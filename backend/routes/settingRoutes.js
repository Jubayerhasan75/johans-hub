import express from 'express';
import Setting from '../models/Setting.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Keep the stored arrays small and sane
const MAX_HERO = 3;
const MAX_CATEGORY = 2;

const sanitizeImages = (value, max) => {
  if (!Array.isArray(value)) return undefined;
  return value
    .slice(0, max)
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    // keep empty strings as "use default" placeholders
    .map((v) => (v.length > 0 ? v : ''));
};

// @desc    Get site settings (homepage banner images)
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const settings = await Setting.getSingleton();
    res.json({
      heroImages: settings.heroImages,
      categoryImages: settings.categoryImages,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update site settings (homepage banner images)
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res, next) => {
  try {
    const settings = await Setting.getSingleton();

    const heroImages = sanitizeImages(req.body.heroImages, MAX_HERO);
    const categoryImages = sanitizeImages(req.body.categoryImages, MAX_CATEGORY);

    if (heroImages !== undefined) settings.heroImages = heroImages;
    if (categoryImages !== undefined) settings.categoryImages = categoryImages;

    const updated = await settings.save();
    res.json({
      heroImages: updated.heroImages,
      categoryImages: updated.categoryImages,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
