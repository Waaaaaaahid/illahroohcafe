const express = require('express');
const router = express.Router();
const controller = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/validate', protect, controller.validateCoupon);
router.get('/', protect, admin, controller.listCoupons);
router.post('/', protect, admin, controller.createCoupon);
router.put('/:id', protect, admin, controller.updateCoupon);
router.delete('/:id', protect, admin, controller.deleteCoupon);

module.exports = router;
