// backend/controllers/userController.js
const asyncHandler = require('../utils/asyncHandler');
const { notImplemented, success, error } = require('../utils/response');
const User = require('../models/User');

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
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  return success(res, 200, users);
});

// DELETE /api/users/:id (admin)
const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return error(res, 400, 'You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return error(res, 404, 'User not found');
  }
  return success(res, 200, { _id: req.params.id }, 'User deleted');
});

// PUT /api/users/:id/role (admin)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return error(res, 400, 'Invalid role');
  }
  if (String(req.params.id) === String(req.user._id)) {
    return error(res, 400, 'You cannot change your own role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  ).select('-password');

  if (!user) {
    return error(res, 404, 'User not found');
  }
  return success(res, 200, user, 'User role updated');
});

module.exports = { getProfile, updateProfile, getUsers, deleteUser, updateUserRole };
