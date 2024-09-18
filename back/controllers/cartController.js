// const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/Product');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price brand category image');

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private 
const addItemToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json('Product not found');
    }

    // Check if the quantity requested exceeds the stock
    if (quantity > product.Stock) {
        return res.status(400).json(`Only ${product.Stock} items in stock for ${product.name}`);
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        // Create a new cart if it doesn't exist
        cart = await Cart.create({
            user: req.user._id,
            items: [{ product: productId, quantity: quantity || 1 }],
        });
    } else {
        // Check if the product is already in the cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            // If product exists in the cart, calculate the new quantity
            const newQuantity = cart.items[itemIndex].quantity + (quantity || 1);

            // Check if the new quantity exceeds the available stock
            if (newQuantity > product.Stock) {
                return res.status(400).json(`Cannot add more than ${product.Stock} items of ${product.name}`);
            } 

            // Update the quantity if within stock limits
            cart.items[itemIndex].quantity = newQuantity;
        } else {
            // If the product is not in the cart, add it
            cart.items.push({ product: productId, quantity: quantity || 1 });
        }

        // Save the updated cart
        await cart.save()
    }

    // Return the updated cart to the user
    res.status(200).json(cart);
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/item/:productId
// @access  Private
const updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity < 1) {
        res.status(400).json('Quantity must be at least 1');
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404).json('Cart not found');
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.json(cart);
    } else {
        res.status(404).json('Product not found in cart');
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/item/:productId
// @access  Private
const removeCartItem = async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        res.status(404).json('Cart not found')
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
        await cart.save();
        res.json(cart);
    } else {
        res.status(404).json('Product not found in cart');
    }
};

// @desc    Clear the cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404).json('Cart not found');
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared' });
};

module.exports = {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};
