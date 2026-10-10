import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 'protect' middleware: checks that the user is logged in via a Bearer token
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the user (minus password). A valid token for a deleted user
    // must NOT pass through with req.user = null.
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// 'admin' middleware: checks that the logged-in user is an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  // 403 = authenticated but not allowed (401 means "not logged in")
  return res.status(403).json({ message: 'Not authorized as an admin' });
};

export { protect, admin };
