const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/:id/reviews', authMiddleware, productController.addReview);

// Admin-only protected CRUD routes
router.post('/', authMiddleware, adminMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;
