const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// @desc    Update user password
// @route   PUT /api/users/updatePassword
// @access  Private
exports.updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update to the new password (no manual hashing needed)
    user.password = newPassword; // let the pre('save') hook handle the hashing
    await user.save();

    res.json({ message: 'Password updated successfully' });
};


//user update Profile
// @desc    Update user profile
// @route   PUT /api/users/updateProfile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
//Admin get all user
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};

//Admin get a single user
// @desc    Get a user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) { 
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
//admin update user profile
// @desc    Update a user profile
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUserByAdmin = async (req, res) => {
    const user = await User.findById(req.params.id, req.body, { new: true });

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        // user.role = req.body.role !== undefined ? req.body.role==="user" : user.role=="admin";

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            // role: updatedUser.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

//admin delete user
// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
 
exports.deleteUser = async (req, res) => {
   try {
       const user = await User.findByIdAndDelete(req.params.id);

       if (!user) {

           res.json({ message: 'User not Found' });
       } else {
           res.status(201).json({ message: 'User Successfully deleted' });
       } 
   } catch (error) {
    res.status(500).json({message:"error deleting occur ",error})
   }
};
