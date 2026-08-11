// backend/controllers/menuController.js
const asyncHandler = require('../utils/asyncHandler');
const { notImplemented } = require('../utils/response');
// TODO: const MenuItem = require('../models/MenuItem');

// GET /api/menu
// TODO: Support query params (category, available, popular, search) and
// return MenuItem.find(filters).populate('category').
const getMenuItems = asyncHandler(async (req, res) => {
  return notImplemented(res, 'List menu items');
});

// POST /api/menu (admin)
// TODO: Validate body via menuItemRules, then MenuItem.create({...req.body}).
// TODO: Handle optional image upload via uploadService middleware upstream.
const createMenuItem = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Create menu item');
});

// GET /api/menu/:id
// TODO: MenuItem.findById(req.params.id).populate('category'); 404 if not found.
const getMenuItemById = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Get menu item by id');
});

// PUT /api/menu/:id (admin)
// TODO: MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).
const updateMenuItem = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Update menu item');
});

// DELETE /api/menu/:id (admin)
// TODO: MenuItem.findByIdAndDelete(req.params.id); also delete Cloudinary image via publicId.
const deleteMenuItem = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Delete menu item');
});

// PATCH /api/menu/:id/availability (admin)
// TODO: Toggle or set `available` field: MenuItem.findByIdAndUpdate(id, { available: req.body.available }).
const updateAvailability = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Update menu item availability');
});

module.exports = {
  getMenuItems,
  createMenuItem,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  updateAvailability,
};
