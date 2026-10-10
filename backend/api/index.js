// Vercel serverless entry point.
// Render/locally we use server.js (npm start) instead; both share app.js.
import app from '../app.js';
import connectDB from '../config/db.js';

export default async function handler(req, res) {
  // Cached in config/db.js, so warm invocations reuse the connection
  await connectDB();
  return app(req, res);
}
