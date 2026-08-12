// backend/config/db.js
// Mongoose connection setup. NOT invoked automatically.
// TODO: Set MONGO_URI in backend/.env before calling connectDB().
const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB using MONGO_URI from environment vars.
 * This function is intentionally NOT called anywhere in this skeleton.
 * Wire it up in server.js where indicated by the `// TODO: connectDB()` marker.
 */
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/illahroohcafe';
    if (!process.env.MONGO_URI) {
      console.warn(
        'MONGO_URI is not set. Falling back to local MongoDB at mongodb://127.0.0.1:27017/illahroohcafe',
      );
    }

    const conn = await mongoose.connect(mongoUri, {
      // Mongoose 8+ no longer needs useNewUrlParser/useUnifiedTopology,
      // but keep this options object here for any future flags.
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // TODO: Decide on process.exit(1) vs retry/backoff strategy in production.
    process.exit(1);
  }
};

module.exports = connectDB;
