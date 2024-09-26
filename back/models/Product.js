const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });
const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
       
        images: [{ type: String, required: true }],
        brand: {
            type: String,
            required: false,
        },
        category: {
            type: String,
            required: true,
        },
       Stock: {
            type: Number,
            required: true,
            default: 0,
        },
        reviews: [reviewSchema],
        rating: {
            type: Number,
            
            default: 0,
        },
        numReviews: {
            type: Number,
           
            default: 0,
        },
         user: {
             type: mongoose.Schema.Types.ObjectId,
             required:false,
             ref: 'User',
         },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
