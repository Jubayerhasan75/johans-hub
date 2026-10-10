import express from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
});

// --- 1. POST /api/users/login ---
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      return res.json({ ...formatUser(user), token: generateToken(user._id) });
    }
    // Same message for wrong email and wrong password (no account enumeration)
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    next(error);
  }
});

// --- 2. POST /api/users/register ---
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // isAdmin defaults to false (User.js model) — never accept it from the client
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({ ...formatUser(user), token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
});

// --- 3. GET /api/users/profile ---
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(formatUser(user));
  } catch (error) {
    next(error);
  }
});

// --- 4. GET /api/users (admin only) ---
router.get('/', protect, admin, async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
