const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
    },
    {
        _id: false,
    }
);

const cartSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true, // Each user has one cart
        },
        items: [cartItemSchema],
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
