// backend/middleware/validationMiddleware.js
const { body, validationResult } = require('express-validator');
const { error: sendError } = require('../utils/response');

// Runs accumulated express-validator checks and short-circuits on failure.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }
  next();
};

// Reusable rule sets, to be spread into route definitions, e.g.:
// router.post('/register', registerRules, validate, authController.register)

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const menuItemRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
];

const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('customerDetails.name').trim().notEmpty().withMessage('Customer name is required'),
  body('customerDetails.phone').trim().notEmpty().withMessage('Customer phone is required'),
  body('paymentMethod').isIn(['cod', 'online']).withMessage('Invalid payment method'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  menuItemRules,
  orderRules,
};
