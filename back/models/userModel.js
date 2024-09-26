const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto=require('crypto')
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
   resetPasswordToken: String,
    resetPasswordExpire: Date,
},
  { timestamps: true }
  );

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// In userModel.js
userSchema.methods.generatePasswordResetToken = function () {
  // Create a token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set it to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expiration time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
