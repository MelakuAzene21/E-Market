// // routes/product.js
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const Product = require('../models/Product');

// // Set up multer for file storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Folder where images will be stored
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//     }
// });

// // File filter to allow only images
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (extname && mimetype) {
//         return cb(null, true);
//     } else {
//         cb('Images only!');
//     }
// };

// // Initialize multer
// const upload = multer({
//     storage,
//     limits: { fileSize: 1000000 }, // 1MB file size limit
//     fileFilter
// });

// // POST route to add a product (with image upload)
// router.post('/add', protect, admin, upload.single('image'), async (req, res) => {
//     try {
//         const {
//             name,
//             description,
//             price,
//             brand,
//             category,
//             Stock,
//             rating,
//             numReviews
//         } = req.body;

//         const image = req.file ? `/uploads/${req.file.filename}` : null; // Save image path

//         const newProduct = new Product({
//             name,
//             description,
//             price,
//             image, // Store image path
//             brand,
//             category,
//             Stock,
//             rating,
//             numReviews
//         });

//         const savedProduct = await newProduct.save();
//         res.status(201).json(savedProduct);
//     } catch (error) {
//         res.status(500).json({ message: 'Error adding product', error });
//     }
// });






// routes/product.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Product = require('../models/Product'); 
// Set up multer for file storage

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder where images will be stored
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!'); // If not a valid image file, send an error
    }
};

// Initialize multer to handle multiple images
const upload = multer({
    storage,
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter
});

// POST route to add a product (with multiple image uploads)
router.post('/add', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        console.log(req.files); // Log this to check if files are being uploaded

        const {
            name,
            description,
            price,
            brand,
            category,
            Stock,
            rating,
            numReviews
        } = req.body;

        // If no files are uploaded, return an error
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        // Save all uploaded image paths to an array
        // Fix: Use template literals for the correct image paths
        const images = req.files.map(file => `/uploads/${file.filename}`);

        const newProduct = new Product({
            name,
            description,
            price,
            images, // Save image paths array
            brand,
            category,
            Stock,
            rating,
            numReviews
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error adding product:', error); // Log the error
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
});








// Update product route
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, Stock, brand } = req.body;

        // Check if an image file was uploaded
        const image = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updatedFields = { name, description, price, category, Stock, brand };
        if (image) updatedFields.image = image;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updatedFields,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
});























































// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});
router.get('/item', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword ? {
        name: {
            $regex: req.query.keyword,
            $options: 'i'
        }
    } : {};

    const { category, brand, minPrice, maxPrice, inStock } = req.query;
    let filter = { ...keyword };
    if (brand) filter.brand = brand
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (inStock === 'true') {
        filter.Stock = { $gt: 0 };
    }

    const products = await Product.find(filter)
        .skip(skip)
        .limit(limit);

    const totalProducts = await Product.countDocuments(filter);

    res.json({
        products,
        totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
    });
}
)
// routes/product.js

// GET a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
});

// routes/product.js

// Configure multer for file uploads



// routes/product.js

// DELETE a product by ID
router.delete('/:id',protect,admin, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

//for reviews
router.post('/:id/review', protect, async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the user has already reviewed the product
        const alreadyReviewed = product.reviews.find(
            review => review.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Product already reviewed' });
        }

        // Create a new review
        const review = {
            name: req.user.name,  // Assuming user's name is in the token
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);

        // Update numReviews and recalculate rating
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();

        res.status(201).json({ message: 'Review added', product });
    } catch (error) {
        res.status(500).json({ message: 'Error adding review', error });
    }
});

router.get('/:id/reviews', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.status(200).json(product.reviews);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
});
 

router.put('/:productId/review/:reviewId', protect, async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find the review to update
        const review = product.reviews.find(
            (review) => review._id.toString() === req.params.reviewId.toString()
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if the user who is trying to update the review is the owner
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this review' });
        }

        // Update the review fields
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        // Recalculate the product's average rating
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();

        res.status(200).json({ message: 'Review updated', product });
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error });
    }
});

router.delete('/:productId/review/:reviewId', protect, async (req, res) => {
    try {
        // Find the product
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find the review to delete
        const review = product.reviews.find(
            (review) => review._id.toString() === req.params.reviewId.toString()
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if the user is authorized to delete this review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this review' });
        }

        // Remove the review from the product's reviews array
        product.reviews = product.reviews.filter(
            (review) => review._id.toString() !== req.params.reviewId.toString()
        );

        // Update the product's review count and rating
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            (product.reviews.length || 1);  // Avoid division by 0 if no reviews are left

        await product.save();

        res.status(200).json({ message: 'Review deleted successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
});

module.exports = router;
