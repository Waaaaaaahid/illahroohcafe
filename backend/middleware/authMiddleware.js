// backend/middleware/authMiddleware.js
// JWT verification middleware. Verifies the user token and attaches the full user document.
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { error: sendError } = require('../utils/response');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return sendError(res, 401, 'Not authorized, token failed');
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'Not authorized, user not found');
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 401, 'Not authorized, token failed');
  }
});

module.exports = { protect };
