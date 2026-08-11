// backend/middleware/adminMiddleware.js
const { error: sendError } = require('../utils/response');

/**
 * admin: must run AFTER `protect`. Checks req.user.role === 'admin'.
 * TODO: Once `protect` attaches the full user document (with role) from the DB,
 * this check will work as-is.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return sendError(res, 403, 'Not authorized as an admin');
};

module.exports = { admin };
