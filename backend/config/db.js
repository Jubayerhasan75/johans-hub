import mongoose from 'mongoose';

// Cache the connection promise so serverless invocations (and accidental
// double-calls) reuse one connection instead of opening a new one each time.
let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { promise: null };
}

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        cached.promise = null; // allow retry on next call
        console.error(`❌ MongoDB Error: ${error.message}`);
        throw error;
      });
  }

  return cached.promise;
};

export default connectDB;
