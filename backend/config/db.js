// backend/config/db.js
// Mongoose connection setup, safe for both `npm start` (long-running) and
// Vercel serverless (lazy connect via backend/api/index.js).
const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'MONGO_URI is not set. Add it to your hosting environment (Vercel) before deploying.',
      );
    }
    console.warn(
      'MONGO_URI is not set. Falling back to local MongoDB at mongodb://127.0.0.1:27017/illahroohcafe',
    );
  }

  connectionPromise = mongoose
    .connect(mongoUri || 'mongodb://127.0.0.1:27017/illahroohcafe', {
      serverSelectionTimeoutMS: 10000,
    })
    .then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      connectionPromise = undefined;
      console.error(`MongoDB connection error: ${error.message}`);
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;