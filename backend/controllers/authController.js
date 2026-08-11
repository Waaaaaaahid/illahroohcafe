// backend/controllers/authController.js
const asyncHandler = require('../utils/asyncHandler');
const { notImplemented } = require('../utils/response');
// TODO: const User = require('../models/User');
// TODO: const generateToken = require('../utils/generateToken');
// TODO: const { sendEmail } = require('../services/emailService');

// POST /api/auth/register
// TODO: Destructure {name, email, phone, password} from req.body.
// TODO: Check if User.findOne({ email }) already exists -> 400 if so.
// TODO: Create User.create({ name, email, phone, password }) (hashing done in pre-save hook).
// TODO: Sign JWT via generateToken(user._id) and return user (without password) + token.
const register = asyncHandler(async (req, res) => {
  return notImplemented(res, 'User registration');
});

// POST /api/auth/login
// TODO: Destructure {email, password} from req.body.
// TODO: Find user via User.findOne({ email }).select('+password').
// TODO: Compare password with user.matchPassword(password).
// TODO: On success, sign JWT and return user + token; else 401.
const login = asyncHandler(async (req, res) => {
  return notImplemented(res, 'User login');
});

// GET /api/auth/me  (protected)
// TODO: req.user is set by `protect` middleware; fetch fresh doc via User.findById(req.user.id).
const getMe = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Get current user');
});

// POST /api/auth/forgot-password
// TODO: Find user by email, generate a reset token (crypto.randomBytes),
// hash and store in resetPasswordToken/resetPasswordExpires, email the raw token link
// to the user via sendEmail().
const forgotPassword = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Forgot password');
});

// POST /api/auth/reset-password
// TODO: Accept {token, password} from req.body, hash token, look up
// User.findOne({ resetPasswordToken, resetPasswordExpires: { $gt: Date.now() } }),
// set new password, clear reset fields, save.
const resetPassword = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Reset password');
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };
