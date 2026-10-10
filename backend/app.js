import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Behind Render/Vercel proxies, trust X-Forwarded-* so req.ip is real
app.set('trust proxy', 1);

// --- CORS ---
// In production set CORS_ORIGIN to your Vercel URL(s), comma separated, e.g.
// CORS_ORIGIN=https://johans-hub.vercel.app
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];
const corsOrigin =
  process.env.NODE_ENV === 'production'
    ? allowedOrigins
    : (origin, callback) => {
        // Dev: allow listed origins plus any localhost port
        if (!origin || allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      };
app.use(cors({ origin: corsOrigin }));

// --- Security headers (lightweight, no extra dependency) ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    // Only meaningful over HTTPS (Render/Vercel terminate TLS for us)
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  res.removeHeader('X-Powered-By');
  next();
});
app.disable('x-powered-by');

app.use(express.json({ limit: '100kb' }));

// --- Simple in-memory rate limit for auth endpoints (brute-force guard) ---
const authHits = new Map();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 30;
app.use(['/api/users/login', '/api/users/register'], (req, res, next) => {
  const now = Date.now();
  const entry = authHits.get(req.ip) || { count: 0, start: now };
  if (now - entry.start > AUTH_WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  authHits.set(req.ip, entry);
  if (entry.count > AUTH_MAX_ATTEMPTS) {
    return res.status(429).json({ message: 'Too many attempts, please try again later' });
  }
  next();
});

// --- API Routes ---
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingRoutes);

// Health check (used by hosting platforms and uptime monitors)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/', (req, res) => {
  res.send("Johan's Hub API is running...");
});

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
