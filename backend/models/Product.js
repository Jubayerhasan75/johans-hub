import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, default: 0, min: [0, 'Price cannot be negative'] },

  originalPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function (v) {
        // Only meaningful when it is higher than the selling price
        return v == null || v > this.price;
      },
      message: 'Original price must be greater than the selling price',
    },
  },

  imageUrl: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  countInStock: { type: Number, required: true, default: 0, min: [0, 'Stock cannot be negative'] },
  colors: [String],
  sizes: [String],
}, {
  timestamps: true,
});

// Storefront queries: newest-first listing, category filter, name search
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
