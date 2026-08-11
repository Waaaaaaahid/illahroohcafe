// backend/utils/validators.js
// Small standalone validation helpers (not tied to express-validator).

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const isValidPhone = (phone) => /^[0-9]{7,15}$/.test(phone);

const isPositiveNumber = (value) => typeof value === 'number' && value >= 0;

module.exports = { isValidEmail, isValidPhone, isPositiveNumber };
