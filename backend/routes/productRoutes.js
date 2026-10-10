import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Shared validation for create/update payloads
const validateProductInput = (body) => {
  const { name, price, imageUrl, category, description, countInStock } = body;
  if (!name?.trim()) return 'Product name is required';
  if (price == null || isNaN(Number(price)) || Number(price) < 0) return 'A valid price is required';
  if (!imageUrl?.trim()) return 'Product image is required';
  if (!category?.trim()) return 'Category is required';
  if (!description?.trim()) return 'Description is required';
  if (countInStock == null || isNaN(Number(countInStock)) || Number(countInStock) < 0) {
    return 'A valid stock count is required';
  }
  return null;
};

// GET /api/products  (optional: ?keyword=...&category=...)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.keyword) {
      filter.name = { $regex: String(req.query.keyword).slice(0, 100), $options: 'i' };
    }
    if (req.query.category && req.query.category !== 'All') {
      filter.category = String(req.query.category);
    }
    // Sort by newest first
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
});

// --- Admin Only Routes ---

// POST /api/products
router.post('/', protect, admin, async (req, res, next) => {
  try {
    const validationError = validateProductInput(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { name, price, originalPrice, imageUrl, category, description, countInStock, colors, sizes } = req.body;

    const product = new Product({
      name,
      price: Number(price),
      // Only keep originalPrice when it is a real discount
      originalPrice: (originalPrice && Number(originalPrice) > Number(price)) ? Number(originalPrice) : undefined,
      imageUrl,
      category,
      description,
      countInStock: Number(countInStock),
      colors: Array.isArray(colors) ? colors : [],
      sizes: Array.isArray(sizes) ? sizes : [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id
router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const validationError = validateProductInput(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { name, price, originalPrice, imageUrl, category, description, countInStock, colors, sizes } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name;
    product.price = Number(price);
    product.imageUrl = imageUrl;
    product.category = category;
    product.description = description;
    product.countInStock = Number(countInStock);
    product.colors = Array.isArray(colors) ? colors : [];
    product.sizes = Array.isArray(sizes) ? sizes : [];

    // If originalPrice is empty, 0, or not above price, remove it entirely
    if (originalPrice && Number(originalPrice) > Number(price)) {
      product.originalPrice = Number(originalPrice);
    } else {
      product.originalPrice = undefined;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id
router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
});

export default router;
