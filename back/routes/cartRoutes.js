const express = require('express');
const {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// All routes are protected; user must be logged in
router.route('/').get(protect, getCart);
router.route('/').post(protect, addItemToCart);
router.route('/item/:productId').put(protect, updateCartItem);
router.route('/item/:productId').delete(protect, removeCartItem);
router.route('/clear').delete(protect, clearCart);
 
module.exports = router;
 