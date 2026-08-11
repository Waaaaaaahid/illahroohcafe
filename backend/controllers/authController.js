// backend/controllers/authController.js
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return error(res, 400, 'Email already registered');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password,
  });

  const token = generateToken(user._id);
  const userData = user.toObject();
  delete userData.password;

  return success(res, 201, { token, user: userData }, 'User registered');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return error(res, 401, 'Invalid email or password');
  }

  const token = generateToken(user._id);
  const userData = user.toObject();
  delete userData.password;

  return success(res, 200, { token, user: userData }, 'User authenticated');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return error(res, 404, 'User not found');
  }
  return success(res, 200, { user }, 'Current user retrieved');
});

const forgotPassword = asyncHandler(async (req, res) => {
  return error(res, 501, 'Forgot password is not implemented yet');
});

const resetPassword = asyncHandler(async (req, res) => {
  return error(res, 501, 'Reset password is not implemented yet');
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };
