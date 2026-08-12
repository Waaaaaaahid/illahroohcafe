// backend/routes/cafeRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const CafeSettings = require('../models/CafeSettings');

// GET /api/cafe/settings
const getSettings = asyncHandler(async (req, res) => {
  let settings = await CafeSettings.findOne();
  if (!settings) {
    settings = await CafeSettings.create({ name: 'Ilarooh' });
  }
  return success(res, 200, settings, 'Cafe settings retrieved');
});

// PUT /api/cafe/settings (admin)
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await CafeSettings.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  return success(res, 200, settings, 'Cafe settings updated');
});

router.route('/settings').get(getSettings).put(protect, admin, updateSettings);

module.exports = router;
