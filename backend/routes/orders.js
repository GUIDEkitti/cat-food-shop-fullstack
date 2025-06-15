//orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.post('/checkout', protect, authorize('user'), orderController.checkout);
router.get('/history', protect, authorize('user'), orderController.getPurchaseHistory);

module.exports = router;