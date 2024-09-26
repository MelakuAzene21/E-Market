const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        name: { type: String, required: true },
      
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
    },
    {
        _id: false,
    }
);
const shippingAddressSchema = mongoose.Schema(
    {
        phoneNumber: { type: Number, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    {
        _id: false,
    }
);

const paymentResultSchema = mongoose.Schema(
    {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    {
        _id: false,
    }
);

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        orderItems: [orderItemSchema],
        shippingAddress: shippingAddressSchema,
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentResult: paymentResultSchema,
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
