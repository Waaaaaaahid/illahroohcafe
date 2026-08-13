const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/item/:itemId', controller.getItemReviews);
router.post('/', protect, controller.createReview);
router.get('/admin', protect, admin, controller.getAdminReviews);
router.patch('/:id/visibility', protect, admin, controller.updateReviewVisibility);
router.delete('/:id', protect, admin, controller.deleteReview);

module.exports = router;
