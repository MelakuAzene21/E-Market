// const = require('express-async-handler');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/Product');
// const axios = require('axios');
// const { signTeleBirrRequest } = require('../utils/teleBirrUtils');
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// const {
//     TELEBIRR_MERCHANT_APP_ID,
//     TELEBIRR_FABRIC_APP_ID,
//     TELEBIRR_SHORTCODE,
//     TELEBIRR_APP_SECRET,
//     TELEBIRR_PRIVATE_KEY
// } = process.env;

const addOrderItems = async (req, res) => {
    const {
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price image Stock');

    console.log('Cart for user:', req.user._id, cart);

 
    if ( !cart||cart.items.length === 0) {
      return res.status(400).json('No items in cart')
    } 

    // Prepare order items
    const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
        image: item.product.image,
    }));

    // Verify stock
    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        if (product.Stock < item.quantity) {
          return  res.status(400).json(`Not enough stock for product ${product.name}`);
        }
        product.Stock -= item.quantity;
        await product.save() 
    }

    const order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    const createdOrder = await order.save();
    // Clear the cart after creating the order
    cart.items = [];
    await cart.save();

    return res.status(201).json(createdOrder)
    //below
    // const paymentData = {
    //     outTradeNo: createdOrder._id,
    //     subject: 'Order Payment',
    //     totalAmount: totalPrice,
    //     merchantAppId: TELEBIRR_MERCHANT_APP_ID,
    //     notifyUrl: 'http://localhost:5000/api/telebirr-notify',
    //     shortCode: TELEBIRR_SHORTCODE,
    //     timeoutExpress: '15m',
    //     nonceStr: Date.now().toString(),
    // };

    // const sign = signTeleBirrRequest(paymentData, TELEBIRR_PRIVATE_KEY);
    // const telebirrRequestData = {
    //     ...paymentData,
    //     sign,
    //     appSecret: TELEBIRR_APP_SECRET,
    // };

    // try {
    //     const telebirrResponse = await axios.post('https://api.telebirr.com/payments/pay', telebirrRequestData);
    //     res.status(201).json({ order: createdOrder, telebirrPayment: telebirrResponse.data });
    // } catch (error) {
    //     console.error('TeleBirr payment failed:', error);
    //     res.status(500).json('Payment failed');
//     // }
// };

// const teleBirrNotify = async (req, res) => {
//     const { outTradeNo, tradeStatus } = req.body;

//     if (tradeStatus === 'TRADE_SUCCESS') {
//         const order = await Order.findById(outTradeNo);
//         if (order) {
//             order.isPaid = true;
//             order.paidAt = Date.now();
//             await order.save();
//             return res.status(200).json('Payment successful');
//         }
//     }
//     res.status(400).json('Payment failed');
};

 //above
 // @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        // Check if the user is the owner or an admin
        if (order.user._id.toString() === req.user._id.toString() || req.user.role==="admin") {
            res.json(order);
        } else {
            res.status(401).json('Not authorized to view this order');
        }
    } else {
        res.status(404).json('Order not found');
    }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
// Get logged-in user's orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' })
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Optionally verify payment details here
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json('Order not found');
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json('Order not found');
    }
};



//delete oreder
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user._id.toString() === req.user._id.toString() || req.user.role==="admin") {
            await Order.findByIdAndDelete(req.params.id); // Use findByIdAndDelete instead of remove
            res.status(200).json({ message: 'Order deleted successfully' });
        } else {
            res.status(401).json({ message: 'Not authorized to delete this order' });
        }

    } catch (error) {
        console.error('Error deleting order:', error); // Log the error to the console
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//to update orders details
// @desc    Update order details
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the user is the owner or an admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role!=="admin") {
            return res.status(401).json({ message: 'Not authorized to update this order' });
        }

        // Update order details
        const { shippingAddress, paymentMethod, orderItems } = req.body;

        // Validate provided data
        if (shippingAddress) {
            order.shippingAddress = shippingAddress;
        }
        if (paymentMethod) {
            order.paymentMethod = paymentMethod;
        }
        if (orderItems) {
            // Validate and update order items
            const updatedOrderItems = orderItems.map(item => ({
                product: item.product,
                name: item.name,
                qty: item.qty,
                price: item.price,
                image: item.image,
            }));
            order.orderItems = updatedOrderItems;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);

    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrder,
    updateOrderToPaid,
    updateOrderToDelivered,
    deleteOrder // Add deleteOrder to exports
};


