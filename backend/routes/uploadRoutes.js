import express from 'express';
import upload from '../middleware/uploadMiddleware.js'; // Multer middleware
import cloudinary from '../config/cloudinary.js'; // Cloudinary config
import { protect, admin } from '../middleware/authMiddleware.js'; // সিকিউরিটি

const router = express.Router();

// POST /api/upload
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // --- ⛔️ সহজ এবং নির্ভরযোগ্য আপলোড লজিক ---

    // ১. Multer থেকে পাওয়া ফাইল 'buffer'-টিকে Base64 স্ট্রিং-এ রূপান্তর করুন
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // ২. Cloudinary-কে বলুন এই Base64 স্ট্রিংটি আপলোড করতে
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'goriber-hub', // Cloudinary-তে আপনার ফোল্ডারের নাম
      resource_type: 'image',
    });

    // ৩. আপলোড সফল হলে, URL টি ফ্রন্টএন্ডে ফেরত পাঠান
    res.status(201).json({
      message: 'Image uploaded successfully',
      url: result.secure_url, // Cloudinary-এর নতুন URL
    });
    
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    res.status(500).json({ message: 'Error uploading image.', error: err.message });
  }
});

export default router;