const express = require('express');
const { registerUser, loginUser, logout, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/profile', protect, getUserProfile);

module.exports = router 
  