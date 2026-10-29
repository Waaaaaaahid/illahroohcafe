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
      dbReady = connectDB().catch((error) => {
        // Let a later request retry after a failed initial connection.
        dbReady = null;
        throw error;
      });
    }
    await dbReady;

    // This is a cheap migration-marker check after the first successful seed.
    // The seeder skips all product/category upserts once the migration is done.
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
