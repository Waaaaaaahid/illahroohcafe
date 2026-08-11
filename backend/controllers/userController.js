// backend/controllers/userController.js
const asyncHandler = require('../utils/asyncHandler');
const { notImplemented } = require('../utils/response');
// TODO: const User = require('../models/User');

// GET /api/users/profile (protected)
// TODO: User.findById(req.user.id).select('-password').
const getProfile = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Get user profile');
});

// PUT /api/users/profile (protected)
// TODO: Allow updating name/phone/email/password; if password present, let pre-save hook re-hash it.
const updateProfile = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Update user profile');
});

// GET /api/users (admin)
// TODO: User.find().select('-password') with pagination/search.
const getUsers = asyncHandler(async (req, res) => {
  return notImplemented(res, 'List users');
});

// DELETE /api/users/:id (admin)
// TODO: User.findByIdAndDelete(req.params.id); guard against deleting self/last admin.
const deleteUser = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Delete user');
});

// PUT /api/users/:id/role (admin)
// TODO: Validate role in ['user','admin']; User.findByIdAndUpdate(id, { role }, { new: true }).
const updateUserRole = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Update user role');
});

module.exports = { getProfile, updateProfile, getUsers, deleteUser, updateUserRole };
