// backend/api/index.js
// Vercel serverless entry — the whole Express app runs as one function.
const app = require('../server');
const connectDB = require('../config/db');
const ensureMenuSeeded = require('../scripts/ensureMenuSeeded');

let dbReady = null;
let menuReady = null;

module.exports = async (req, res) => {
  try {
    if (!dbReady) {
      dbReady = connectDB();
    }
    await dbReady;

    if (!menuReady) {
      menuReady = ensureMenuSeeded().catch((error) => {
        menuReady = null;
        throw error;
      });
    }
    await menuReady;

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
