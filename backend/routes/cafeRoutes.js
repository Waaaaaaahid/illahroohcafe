// backend/routes/cafeRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { notImplemented } = require('../utils/response');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
// TODO: const CafeSettings = require('../models/CafeSettings');

// GET /api/cafe/settings
// TODO: return the single CafeSettings doc: CafeSettings.findOne() (create default if none exists).
const getSettings = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Get cafe settings');
});

// PUT /api/cafe/settings (admin)
// TODO: Upsert: CafeSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true }).
const updateSettings = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Update cafe settings');
});

router.route('/settings').get(getSettings).put(protect, admin, updateSettings);

module.exports = router;
