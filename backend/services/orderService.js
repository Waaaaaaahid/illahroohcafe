// backend/services/orderService.js
// Pure functions for order total calculations - fully implemented, no DB access.

/**
 * Calculates subtotal, tax, deliveryFee and totalAmount for a given cart.
 * @param {Array<{price:number, quantity:number}>} items
 * @param {number} taxPercentage e.g. 5 for 5%
 * @param {number} deliveryFee flat fee
 * @returns {{subtotal:number, tax:number, deliveryFee:number, totalAmount:number}}
 */
const calculateOrderTotals = (items = [], taxPercentage = 0, deliveryFee = 0) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Number(((subtotal * taxPercentage) / 100).toFixed(2));
  const totalAmount = Number((subtotal + tax + deliveryFee).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    deliveryFee: Number(deliveryFee.toFixed(2)),
    totalAmount,
  };
};

module.exports = { calculateOrderTotals };
