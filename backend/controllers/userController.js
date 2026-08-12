const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const User = require('../models/User');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return error(res, 404, 'User not found');
  return success(res, 200, user, 'Profile retrieved');
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) return error(res, 404, 'User not found');

  const { name, email, phone, password } = req.body;

  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: user._id },
    });
    if (existing) return error(res, 400, 'Email already registered');
    user.email = email.toLowerCase();
  }

  if (name !== undefined) user.name = String(name).trim();
  if (phone !== undefined) user.phone = String(phone).trim();
  if (password !== undefined) {
    if (String(password).length < 6) {
      return error(res, 400, 'Password must be at least 6 characters');
    }
    user.password = password;
  }

  await user.save();
  const data = user.toObject();
  delete data.password;

  return success(res, 200, data, 'Profile updated');
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  return success(res, 200, users);
});

const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return error(res, 400, 'You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return error(res, 404, 'User not found');
  return success(res, 200, { _id: req.params.id }, 'User deleted');
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return error(res, 400, 'Invalid role');
  if (String(req.params.id) === String(req.user._id)) {
    return error(res, 400, 'You cannot change your own role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  ).select('-password');

  if (!user) return error(res, 404, 'User not found');
  return success(res, 200, user, 'User role updated');
});

module.exports = { getProfile, updateProfile, getUsers, deleteUser, updateUserRole };
