// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for a given user id.
 * TODO: Ensure JWT_SECRET and JWT_EXPIRES_IN are set in backend/.env before use.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

module.exports = generateToken;
