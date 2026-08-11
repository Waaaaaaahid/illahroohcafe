// backend/utils/response.js
// Shared HTTP response helpers to keep controller responses consistent.

const success = (res, statusCode, data = {}, message = 'Success') => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, statusCode, message = 'Error', errors = null) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

// Used by controller stubs to indicate the handler is not yet implemented.
const notImplemented = (res, feature = 'This endpoint') => {
  return res.status(501).json({
    success: false,
    message: `${feature} is not implemented yet.`,
  });
};

module.exports = { success, error, notImplemented };
