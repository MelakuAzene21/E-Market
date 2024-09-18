const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt=require('bcryptjs')
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
        res.status(201).json("User Successfully Registered");
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};
 
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        res.cookie('token', generateToken(user._id), { 
            httpOnly: true,   // Ensures the cookie is not accessible via JavaScript
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'Strict',  // Prevents CSRF attacks by ensuring the cookie is only sent for same-site requests
        });
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

exports.logout=async(req,res)=>{
    if (req.cookies.token) {
      res.cookie("token","")
       res.json("Successfully Logout ,You can login again to access  the PROFILE  ");
    }
   else{
res.json("You have first Login");
   }
}

exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
