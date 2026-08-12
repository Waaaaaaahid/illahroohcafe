const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../services/emailService');

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) return error(res, 400, 'Email already registered');

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
  if (!user) return error(res, 404, 'User not found');
  return success(res, 200, { user }, 'Current user retrieved');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const genericMessage = 'If an account exists for that email, a reset link has been sent.';
  const user = await User.findOne({ email });

  if (!user) return success(res, 200, null, genericMessage);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  if (!frontendUrl) return error(res, 500, 'Password reset is not configured');

  const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your Ilarooh Cafe password',
    html: `<p>We received a password reset request.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 15 minutes.</p>`,
  });

  return success(res, 200, null, genericMessage);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || String(password).length < 6) {
    return error(res, 400, 'A valid token and password of at least 6 characters are required');
  }

  const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password');

  if (!user) return error(res, 400, 'Reset token is invalid or expired');

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return success(res, 200, null, 'Password reset successfully');
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };
