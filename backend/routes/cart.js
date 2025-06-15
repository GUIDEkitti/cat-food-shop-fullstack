//cart.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController.js');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.route('/')
    .get(protect, authorize('user'), cartController.getCartItems)
    .post(protect, authorize('user'), cartController.addToCart);

router.route('/:productId')
    .put(protect, authorize('user'), cartController.updateCartItem)
    .delete(protect, authorize('user'), cartController.removeCartItem);

module.exports = router;