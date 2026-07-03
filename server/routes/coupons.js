const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

router.post('/validate', authMiddleware, couponController.validateCoupon);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);

module.exports = router;
