/**
 * API integration tests.
 * Runs the real Express app on an ephemeral port against a SEPARATE
 * test database (the db name in MONGO_URI is replaced with "JohansHubTest"),
 * so production data is never touched. The test db is dropped afterwards.
 *
 * Run with: npm test
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Point at an isolated test database BEFORE the app/db modules load
process.env.MONGO_URI = process.env.MONGO_URI.replace(/\/([^/?]+)(\?|$)/, '/JohansHubTest$2');
process.env.NODE_ENV = 'test';

const { default: app } = await import('../app.js');
const { default: connectDB } = await import('../config/db.js');
const { default: User } = await import('../models/User.js');
const { default: Product } = await import('../models/Product.js');
const { default: Order } = await import('../models/Order.js');

let server;
let baseUrl;
let adminToken;
let userToken;
let productId;

const api = async (path, { method = 'GET', token, body } = {}) => {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
};

before(async () => {
  await connectDB();
  await mongoose.connection.dropDatabase();

  // Seed an admin directly (the API must never allow self-made admins)
  await User.create({
    name: 'Test Admin',
    email: 'admin@test.local',
    password: 'admin-pass-123',
    isAdmin: true,
  });

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  server?.close();
});

test('health check responds', async () => {
  const { status, data } = await api('/api/health');
  assert.equal(status, 200);
  assert.equal(data.status, 'ok');
});

test('register validates input', async () => {
  const missing = await api('/api/users/register', { method: 'POST', body: { email: 'a@b.c' } });
  assert.equal(missing.status, 400);

  const shortPw = await api('/api/users/register', {
    method: 'POST',
    body: { name: 'X', email: 'x@test.local', password: '123' },
  });
  assert.equal(shortPw.status, 400);
});

test('register, duplicate-register and login flow', async () => {
  const reg = await api('/api/users/register', {
    method: 'POST',
    body: { name: 'Customer', email: 'customer@test.local', password: 'secret123' },
  });
  assert.equal(reg.status, 201);
  assert.ok(reg.data.token, 'register returns a token');
  assert.equal(reg.data.isAdmin, false);
  assert.ok(!('password' in reg.data), 'response must not leak password');

  const dup = await api('/api/users/register', {
    method: 'POST',
    body: { name: 'Customer', email: 'customer@test.local', password: 'secret123' },
  });
  assert.equal(dup.status, 400);

  const badLogin = await api('/api/users/login', {
    method: 'POST',
    body: { email: 'customer@test.local', password: 'wrong' },
  });
  assert.equal(badLogin.status, 401);

  const login = await api('/api/users/login', {
    method: 'POST',
    body: { email: 'CUSTOMER@test.local', password: 'secret123' }, // case-insensitive email
  });
  assert.equal(login.status, 200);
  userToken = login.data.token;

  const adminLogin = await api('/api/users/login', {
    method: 'POST',
    body: { email: 'admin@test.local', password: 'admin-pass-123' },
  });
  assert.equal(adminLogin.status, 200);
  assert.equal(adminLogin.data.isAdmin, true);
  adminToken = adminLogin.data.token;
});

test('login twice does not corrupt the stored password hash', async () => {
  // Regression test for the pre-save double-hash bug
  const again = await api('/api/users/login', {
    method: 'POST',
    body: { email: 'customer@test.local', password: 'secret123' },
  });
  assert.equal(again.status, 200);
});

test('product CRUD requires admin and validates input', async () => {
  const noAuth = await api('/api/products', { method: 'POST', body: { name: 'Hack' } });
  assert.equal(noAuth.status, 401);

  const notAdmin = await api('/api/products', { method: 'POST', token: userToken, body: { name: 'Hack' } });
  assert.equal(notAdmin.status, 403);

  const invalid = await api('/api/products', {
    method: 'POST',
    token: adminToken,
    body: { name: 'No price' },
  });
  assert.equal(invalid.status, 400);

  const created = await api('/api/products', {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Test Tee',
      price: 850,
      originalPrice: 1000,
      imageUrl: '/images/test.jpg',
      category: 'Slim Fit',
      description: 'A test t-shirt',
      countInStock: 5,
      colors: ['Black'],
      sizes: ['M', 'L'],
    },
  });
  assert.equal(created.status, 201);
  productId = created.data._id;

  const list = await api('/api/products');
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.data));
  assert.equal(list.data.length, 1);

  const single = await api(`/api/products/${productId}`);
  assert.equal(single.status, 200);
  assert.equal(single.data.name, 'Test Tee');

  const missing = await api(`/api/products/${new mongoose.Types.ObjectId()}`);
  assert.equal(missing.status, 404);
});

test('order creation uses server-side prices and decrements stock', async () => {
  // Client lies about price/total — server must ignore it
  const order = await api('/api/orders', {
    method: 'POST',
    token: userToken,
    body: {
      orderItems: [{ product: productId, quantity: 2, size: 'M', color: 'Black', price: 1 }],
      shippingAddress: { address: 'House 1, Road 2', city: 'Dhaka' },
      customerInfo: { name: 'Customer', phone: '01700000000' },
      paymentMethod: 'Cash on Delivery',
      totalPrice: 1, // attempted manipulation
    },
  });
  assert.equal(order.status, 201);
  // 2 × 850 = 1700 > 1000 → free shipping
  assert.equal(order.data.totalPrice, 1700);
  assert.equal(order.data.orderItems[0].price, 850);

  const product = await api(`/api/products/${productId}`);
  assert.equal(product.data.countInStock, 3, 'stock decremented from 5 to 3');
});

test('order creation rejects insufficient stock and restores nothing', async () => {
  const tooMany = await api('/api/orders', {
    method: 'POST',
    token: userToken,
    body: {
      orderItems: [{ product: productId, quantity: 99 }],
      shippingAddress: { address: 'A', city: 'Dhaka' },
      customerInfo: { name: 'Customer', phone: '01700000000' },
      paymentMethod: 'Cash on Delivery',
    },
  });
  assert.equal(tooMany.status, 400);

  const product = await api(`/api/products/${productId}`);
  assert.equal(product.data.countInStock, 3, 'stock unchanged after failed order');
});

test('manual payment requires a transaction ID', async () => {
  const noTrx = await api('/api/orders', {
    method: 'POST',
    token: userToken,
    body: {
      orderItems: [{ product: productId, quantity: 1 }],
      shippingAddress: { address: 'A', city: 'Dhaka' },
      customerInfo: { name: 'Customer', phone: '01700000000' },
      paymentMethod: 'Manual Payment',
    },
  });
  assert.equal(noTrx.status, 400);
});

test('order access control: owner and admin only', async () => {
  const myOrders = await api('/api/orders/myorders', { token: userToken });
  assert.equal(myOrders.status, 200);
  assert.equal(myOrders.data.length, 1);
  const orderId = myOrders.data[0]._id;

  // A different user must not see this order
  const stranger = await api('/api/users/register', {
    method: 'POST',
    body: { name: 'Stranger', email: 'stranger@test.local', password: 'secret123' },
  });
  const strangerView = await api(`/api/orders/${orderId}`, { token: stranger.data.token });
  assert.equal(strangerView.status, 403);

  // Owner can see it
  const ownerView = await api(`/api/orders/${orderId}`, { token: userToken });
  assert.equal(ownerView.status, 200);

  // Admin: list all, deliver, delete (restocks)
  const all = await api('/api/orders', { token: adminToken });
  assert.equal(all.status, 200);

  const userList = await api('/api/orders', { token: userToken });
  assert.equal(userList.status, 403);

  const deliver = await api(`/api/orders/${orderId}/deliver`, { method: 'PUT', token: adminToken });
  assert.equal(deliver.status, 200);
  assert.equal(deliver.data.isDelivered, true);
  assert.equal(deliver.data.isPaid, true);

  const del = await api(`/api/orders/${orderId}`, { method: 'DELETE', token: adminToken });
  assert.equal(del.status, 200);
});

test('admin user list does not leak password hashes', async () => {
  const users = await api('/api/users', { token: adminToken });
  assert.equal(users.status, 200);
  assert.ok(users.data.length > 0);
  assert.ok(users.data.every((u) => !('password' in u)), 'no password field in user list');
});

test('site settings: public read, admin-only write', async () => {
  // Public can read (auto-creates defaults)
  const initial = await api('/api/settings');
  assert.equal(initial.status, 200);
  assert.ok(Array.isArray(initial.data.heroImages));
  assert.ok(Array.isArray(initial.data.categoryImages));

  // Non-admins cannot change banner images
  const blocked = await api('/api/settings', {
    method: 'PUT',
    token: userToken,
    body: { heroImages: ['/hack.jpg'] },
  });
  assert.equal(blocked.status, 403);

  // Admin can update, and the array is capped at 3 hero / 2 category
  const updated = await api('/api/settings', {
    method: 'PUT',
    token: adminToken,
    body: {
      heroImages: ['/images/a.jpg', '', '/images/c.jpg', '/images/extra.jpg'],
      categoryImages: ['/images/cat1.jpg', '/images/cat2.jpg', '/images/cat3.jpg'],
    },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.heroImages.length, 3);
  assert.equal(updated.data.categoryImages.length, 2);
  assert.equal(updated.data.heroImages[0], '/images/a.jpg');
  assert.equal(updated.data.heroImages[1], ''); // empty slot = use default

  // The change persists for the next public read
  const reread = await api('/api/settings');
  assert.equal(reread.data.heroImages[2], '/images/c.jpg');
});
