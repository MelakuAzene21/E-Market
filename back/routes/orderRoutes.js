const express = require('express');
const {
    teleBirrNotify,
    addOrderItems,
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrder,
    updateOrderToPaid,
    updateOrderToDelivered,
    deleteOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();


// Create a new order
router.route('/').post(protect, addOrderItems);

// Get all orders (admin only)
router.route('/').get(protect, admin, getAllOrders);
// Get logged in user orders
router.route('/myorders').get(protect, getMyOrders)
// Get order by ID
router.route('/:id').get(protect, getOrderById)

router.route('/:id').delete(protect, deleteOrder)
router.route('/:id').put(protect,admin, updateOrder)
 
// Update order to paid
router.route('/:id/pay').put(protect, updateOrderToPaid)

// Update order to delivered (admin only)
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

module.exports = router
