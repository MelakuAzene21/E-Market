const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt=require('bcryptjs')
const crypto=require('crypto')
const nodemailer = require('nodemailer');
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

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        return res.status(404).json({ message: 'User not found in...' });
    }

    // Generate a reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });  // Save the token and expiration time

    // Create reset URL
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'melakuazene623@gmail.com',
                 pass: 'etdl fvpx gtwk bswv'
            }
        });

        const mailOptions = {
            from: 'melakuazene623@gmail.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; padding-bottom: 20px;">
                <h1 style="color: #2c3e50; font-size: 24px;">Password Reset Request</h1>
            </div>
            <p style="font-size: 16px; color: #555;">
                Hello, you have requested to reset your password. Click the button below to reset your password. 
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${resetUrl}" style="background-color: #3498db; color: white; text-decoration: none; padding: 15px 20px; border-radius: 5px; font-size: 16px; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #555;">
                If you did not request this password reset, please ignore this email.
            </p>
            <hr style="border: 0; height: 1px; background: #eaeaea;" />
            <footer style="text-align: center; font-size: 12px; color: #aaa; padding-top: 10px;">
                <p>&copy; ${new Date().getFullYear()} Sheger Gebeya. All rights reserved.</p>
                <p>Addis Abeba ,Ethiopia</p>
            </footer>
        </div>
    `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent with reset instructions' });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500).json({ message: 'Error sending email', error });
    }
};
exports.resetPassword = async (req, res) => {
    const { token } = req.params; // This should be the un-hashed token from the URL
    const { password } = req.body;
    console.log("Received Token: ", token);

    // Hash the token and compare it with the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log("Hashed Token: ", hashedToken);

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }  // Check if token is not expired
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
};
