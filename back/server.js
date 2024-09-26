const express = require('express');
const path=require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userCredentialRoute = require('./routes/userCredentialRoutes');
//const userCredentialRoute=require('./routes/userCredentialRoutes')
const cors = require('cors');
const productRoutes=require('./routes/product')
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
// const { protect } = require('../middleware/authMiddleware');
// const { createNote, getNotes, updateNote, deleteNote } = require('../controllers/noteController');

dotenv.config();
connectDB();

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());  
app.use('/api/auth', authRoutes);


app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes)
app.use('/api/users',userCredentialRoute)
app.use('/uploads',express.static(path.join(__dirname,"uploads")))
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
