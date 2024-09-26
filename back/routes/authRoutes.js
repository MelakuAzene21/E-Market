const express = require('express');
const { registerUser, loginUser, logout, getUserProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/profile', protect, getUserProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
module.exports = router 
  