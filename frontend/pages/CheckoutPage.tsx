import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Loader2, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Order } from '../types';

const CheckoutPage: React.FC = () => {
  const { cart, clearCart, userInfo, updateQuantity, removeFromCart, showToast } = useAppContext();
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- New Manual Payment States ---
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery'); // Default is COD
  const [transactionId, setTransactionId] = useState(''); // State for TrxID input

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    } else {
      navigate('/login?redirect=/checkout');
    }
  }, [userInfo, navigate]);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 1000 ? 0 : 60;
  const total = subtotal + shippingFee;

  // --- Updated Order Handler Logic ---
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userInfo || !userInfo.token) {
      setError('You must be logged in to place an order.');
      navigate('/login?redirect=/checkout'); 
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    
    // Check if Manual Payment is selected AND TrxID is empty
    if (paymentMethod === 'Manual Payment' && !transactionId) {
      setError('Please enter your Transaction ID (TrxID) to confirm payment.');
      return;
    }

    // Basic Bangladeshi phone sanity check (11 digits, starts with 01)
    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (!/^01\d{9}$/.test(phoneDigits)) {
      setError('Please enter a valid 11-digit phone number (e.g. 017XXXXXXXX).');
      return;
    }

    setLoading(true);

    // Prices and totals are recalculated on the server from the database —
    // we only send product IDs, quantities and variants.
    const orderData = {
      customerInfo: { name, phone: phoneDigits, email },
      orderItems: cart.map(item => ({
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        product: item.product._id,
      })),
      shippingAddress: { address, city },
      paymentMethod: paymentMethod,
      transactionId: transactionId || null,
    };

    try {
      const createdOrder = await apiFetch<Order>('/api/orders', {
        method: 'POST',
        token: userInfo.token,
        body: JSON.stringify(orderData),
      });

      setLoading(false);
      clearCart();
      showToast('Order placed successfully!');
      navigate('/thankyou', { state: { orderId: createdOrder._id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-center mb-8 tracking-tight">Checkout & Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto text-gray-300 w-20 h-20 mb-4" />
          <p className="text-xl text-gray-600 mb-6">Your cart is empty.</p>
          <Link to="/collection">
            <button className="bg-brand-dark text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors">
              Browse the Collection
            </button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-soft">
              <h2 className="font-display text-2xl font-bold mb-4">Shopping Cart</h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 border-b pb-4 last:border-b-0">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded-md" />
                    <div className="flex-1">
                      <h4 className="text-md font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">Size: {item.size}, Color: {item.color}</p>
                      <p className="text-lg font-semibold text-brand-dark">৳{item.product.price}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity - 1)}
                        className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors active:scale-90"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => {
                          if (item.quantity >= item.product.countInStock) {
                            showToast(`Only ${item.product.countInStock} in stock for ${item.product.name}`, 'error');
                            return;
                          }
                          updateQuantity(item.product._id, item.size, item.color, item.quantity + 1);
                        }}
                        className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors active:scale-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="bg-white p-5 sm:p-8 rounded-2xl shadow-soft space-y-6">
              <h2 className="font-display text-2xl font-bold mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md bg-gray-50" readOnly={!!userInfo} />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md bg-gray-50" readOnly={!!userInfo} />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Full Address</label>
                  <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="e.g. House 123, Road 4" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. Dhaka" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
                </div>
              </div>
            </section>
          </div>

          {/* --- Summary & Payment Column --- */}
          <div className="lg:col-span-1 bg-white p-5 sm:p-8 rounded-2xl shadow-soft h-fit lg:sticky lg:top-32">
            <h2 className="font-display text-2xl font-bold mb-6">Order Summary</h2>
            <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
              <div className="flex justify-between text-md">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-md">
                <span>Shipping</span>
                <span>৳{shippingFee}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-brand-dark mt-2">
                <span>Total</span>
                <span>৳{total}</span>
              </div>
            </div>

            {/* --- New Manual Payment Method Selector --- */}
            <div className="border-t mt-6 pt-6">
              <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
              <div className="space-y-3">
                <div className="flex items-center p-4 border rounded-md">
                  <input
                    id="cod"
                    name="paymentMethod"
                    type="radio"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-brand-accent focus:ring-brand-accent"
                  />
                  <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                    ক্যাশ অন ডেলিভারি (Cash on Delivery)
                  </label>
                </div>
                <div className="flex items-center p-4 border rounded-md">
                  <input
                    id="manual"
                    name="paymentMethod"
                    type="radio"
                    value="Manual Payment"
                    checked={paymentMethod === 'Manual Payment'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-brand-accent focus:ring-brand-accent"
                  />
                  <label htmlFor="manual" className="ml-3 block text-sm font-medium text-gray-700">
                    বিকাশ / নগদ (Manual Payment)
                  </label>
                </div>
              </div>
            </div>

            {/* --- Conditional Block: Show if "Manual Payment" is selected --- */}
            {paymentMethod === 'Manual Payment' && (
              <div className="border-t mt-6 pt-6 bg-yellow-50 p-4 rounded-md">
                <h4 className="text-md font-semibold mb-2">Payment Instructions</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Please send the total amount (৳{total}) to one of the numbers below:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                  <li><strong>Bkash (Merchant):</strong> 01xxxxxxxxx</li>
                  <li><strong>Nagad (Personal):</strong> 01xxxxxxxxx</li>
                </ul>
                <p className="text-sm text-gray-700 mb-3">
                  After sending the money, enter the <strong>Transaction ID (TrxID)</strong> below to confirm.
                </p>
                <div>
                  <label htmlFor="trxId" className="block text-sm font-medium text-gray-700">
                    Transaction ID (TrxID)
                  </label>
                  <input 
                    type="text" 
                    id="trxId" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required 
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" 
                  />
                </div>
              </div>
            )}
            
            {/* --- Error Message Display --- */}
            {error && <div className="text-red-600 bg-red-100 p-3 rounded-md mt-4">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 px-6 py-3 bg-brand-dark text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : 'Confirm Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CheckoutPage;