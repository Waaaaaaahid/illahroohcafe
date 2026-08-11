// backend/middleware/authMiddleware.js
// JWT verification middleware structure. NOT fully wired to a live DB lookup.
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { error: sendError } = require('../utils/response');
// TODO: Uncomment once User model is connected to a live DB:
// const User = require('../models/User');

/**
 * protect: verifies the Bearer token from the Authorization header.
 * TODO:
 *  1. Extract token from `Authorization: Bearer <token>` header.
 *  2. Verify token with jwt.verify(token, process.env.JWT_SECRET).
 *  3. Fetch the user via User.findById(decoded.id).select('-password').
 *  4. Attach the user to req.user and call next().
 *  5. Return 401 for missing/invalid/expired tokens.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, no token provided');
  }

  try {
    // TODO: replace with real verification + DB lookup once connected.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // TODO: replace with full user doc from DB
    next();
  } catch (err) {
    return sendError(res, 401, 'Not authorized, token failed');
  }
});

module.exports = { protect };
