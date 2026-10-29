// backend/api/index.js
// Vercel serverless entry — the whole Express app runs as one function.
// Keep request handling lightweight: catalog seeding is a deployment/setup task,
// not something to run before serving requests on every new serverless instance.
const app = require('../server');
const connectDB = require('../config/db');

let dbReady = null;

module.exports = async (req, res) => {
  try {
    if (!dbReady) {
      dbReady = connectDB().catch((error) => {
        // Allow a later request to retry if the initial DB connection fails.
        dbReady = null;
        throw error;
      });
    }
    await dbReady;

    return app(req, res);
  } catch (error) {
    console.error('Backend startup error:', error);

    return res.status(500).json({
      success: false,
      message: 'Backend failed to start',
      error: error.message,
    });
  }
};
