import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Must match the values shown on the frontend checkout page
const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_FEE = 60;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res, next) => {
  // Track decrements so we can restock if a later item fails
  const decremented = [];
  try {
    const { orderItems, shippingAddress, customerInfo, paymentMethod, transactionId } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    if (!shippingAddress?.address || !shippingAddress?.city) {
      return res.status(400).json({ message: 'Shipping address and city are required' });
    }
    if (!customerInfo?.name || !customerInfo?.phone) {
      return res.status(400).json({ message: 'Customer name and phone are required' });
    }
    if (paymentMethod === 'Manual Payment' && !transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required for manual payment' });
    }

    // Re-price every item from the database. Never trust prices,
    // names or totals sent by the browser.
    const verifiedItems = [];
    for (const item of orderItems) {
      const quantity = Number(item.quantity);
      if (!mongoose.isValidObjectId(item.product) || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Invalid order item' });
      }

      // Atomically decrement stock only if enough is available.
      // This both validates and reserves stock in one step.
      const product = await Product.findOneAndUpdate(
        { _id: item.product, countInStock: { $gte: quantity } },
        { $inc: { countInStock: -quantity } },
        { new: true }
      );

      if (!product) {
        const exists = await Product.findById(item.product).select('name countInStock');
        const reason = exists
          ? `Not enough stock for "${exists.name}" (only ${exists.countInStock} left)`
          : 'A product in your cart no longer exists';
        // Restock anything we already reserved
        for (const d of decremented) {
          await Product.updateOne({ _id: d.product }, { $inc: { countInStock: d.quantity } });
        }
        return res.status(400).json({ message: reason });
      }

      decremented.push({ product: product._id, quantity });
      verifiedItems.push({
        name: product.name,
        quantity,
        size: item.size || 'N/A',
        color: item.color || 'N/A',
        price: product.price, // server-side price
        imageUrl: product.imageUrl,
        product: product._id,
      });
    }

    const itemsPrice = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    const order = new Order({
      orderItems: verifiedItems,
      user: req.user._id,
      shippingAddress: { address: shippingAddress.address, city: shippingAddress.city },
      customerInfo: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || req.user.email,
      },
      totalPrice: itemsPrice + shippingPrice,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      transactionId: transactionId || undefined,
      isPaid: false,
    });

    const createdOrder = await order.save();
    return res.status(201).json(createdOrder);
  } catch (error) {
    // Restock reserved items if saving the order itself failed
    for (const d of decremented) {
      await Product.updateOne({ _id: d.product }, { $inc: { countInStock: d.quantity } }).catch(() => {});
    }
    return next(error);
  }
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // order.user may be null if the account was deleted; compare against the raw ref
    const ownerId = order.user?._id ?? order.user;
    if (req.user.isAdmin || (ownerId && ownerId.equals(req.user._id))) {
      return res.json(order);
    }
    return res.status(403).json({ message: 'Not authorized to view this order' });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order to delivered (admin also confirms payment received)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', '_id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete an order (restocks items if the order was never delivered)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!order.isDelivered) {
      for (const item of order.orderItems) {
        await Product.updateOne({ _id: item.product }, { $inc: { countInStock: item.quantity } }).catch(() => {});
      }
    }
    await order.deleteOne();
    res.json({ message: 'Order removed' });
  } catch (error) {
    next(error);
  }
});

export default router;
