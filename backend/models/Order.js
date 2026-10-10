import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      size: { type: String, default: 'N/A' },
      color: { type: String, default: 'N/A' },
      price: { type: Number, required: true },
      imageUrl: { type: String, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
    },
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  
  // --- Manual Payment Fields ---
  paymentMethod: {
    type: String,
    required: true,
    default: 'Cash on Delivery',
  },
  // This will store the manual TrxID from the user
  transactionId: {
    type: String, 
  },
  // ---

  isPaid: {
    type: Boolean,
    required: true,
    default: false // All orders, even manual, start as UNPAID
  },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
}, {
  timestamps: true,
});

// "My orders" page and admin newest-first listing
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;