// backend/utils/constants.js
// Central place for shared enum-like constants used across the backend.

module.exports = {
  ROLES: { USER: 'user', ADMIN: 'admin' },
  PAYMENT_METHODS: { COD: 'cod', ONLINE: 'online' },
  PAYMENT_STATUS: { PENDING: 'pending', PAID: 'paid', FAILED: 'failed', REFUNDED: 'refunded' },
  ORDER_STATUS: {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    READY: 'Ready',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },
  DEFAULT_CURRENCY: 'INR',
};
