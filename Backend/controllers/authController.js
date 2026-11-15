const crypto = require('crypto');
const User = require('../models/User');

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'rhinco_secret_salt').digest('hex');
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your full name' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: (phone || '').trim(),
      password: hashedPassword,
      role: role || 'user',
    });

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userObj,
      token: Buffer.from(`${user._id}:${Date.now()}`).toString('base64'),
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating account' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your email' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: userObj,
      token: Buffer.from(`${user._id}:${Date.now()}`).toString('base64'),
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error logging in' });
  }
};

// @desc    Get all registered users (for admin or count)
// @route   GET /api/auth/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
