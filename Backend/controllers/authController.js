const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '1070313248799-q3r7khugifnf6rr69nh7uhpmucaeurq0.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'rhinco_secret_salt').digest('hex');
};

const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role || 'user',
  avatar: user.avatar || '',
  authProvider: user.authProvider || 'email',
  status: user.status || 'Active',
  googleId: user.googleId || '',
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
});

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
      authProvider: 'email',
      status: 'Active',
      lastLogin: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: formatUserResponse(user),
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

    if (user.status === 'Blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    // If account was created via Google and has no password set
    if (!user.password && user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'This account was created with Google. Please use "Continue with Google" to sign in.',
      });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: formatUserResponse(user),
      token: Buffer.from(`${user._id}:${Date.now()}`).toString('base64'),
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error logging in' });
  }
};

// @desc    Google OAuth Sign-In & User Creation
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential, userInfo } = req.body;
    let googleData = null;

    // 1. Verify Google Credential (JWT token) if provided
    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload && payload.email) {
          googleData = {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
            picture: payload.picture || '',
            emailVerified: payload.email_verified,
          };
        }
      } catch (verifyErr) {
        console.warn('Google verifyIdToken issue, trying tokeninfo endpoint:', verifyErr.message);
        // Fallback: fetch directly from Google tokeninfo endpoint
        try {
          const resp = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
          );
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.email) {
              googleData = {
                googleId: data.sub,
                email: data.email,
                name: data.name || '',
                picture: data.picture || '',
                emailVerified: data.email_verified === 'true' || data.email_verified === true,
              };
            }
          }
        } catch (fetchErr) {
          console.error('Tokeninfo fetch error:', fetchErr.message);
        }
      }
    }

    // 2. Fallback to userInfo if token verification could not reach Google servers
    if (!googleData && userInfo && userInfo.email) {
      googleData = {
        googleId: userInfo.googleId || userInfo.sub || '',
        email: userInfo.email,
        name: userInfo.name || 'Google User',
        picture: userInfo.picture || userInfo.avatar || '',
        emailVerified: true,
      };
    }

    if (!googleData || !googleData.email) {
      return res.status(400).json({
        success: false,
        message: 'Could not verify Google account details. Please try again.',
      });
    }

    const normalizedEmail = googleData.email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Check if user is blocked
      if (user.status === 'Blocked') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        });
      }

      // Update existing user with Google info & lastLogin
      user.lastLogin = new Date();
      if (!user.googleId && googleData.googleId) user.googleId = googleData.googleId;
      if (!user.avatar && googleData.picture) user.avatar = googleData.picture;
      await user.save();
    } else {
      // Create new user in database from Google account
      user = await User.create({
        name: googleData.name || 'Google Customer',
        email: normalizedEmail,
        phone: req.body.phone || '',
        authProvider: 'google',
        googleId: googleData.googleId || '',
        avatar: googleData.picture || '',
        role: 'user',
        status: 'Active',
        lastLogin: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Signed in successfully with Google',
      user: formatUserResponse(user),
      token: Buffer.from(`${user._id}:${Date.now()}`).toString('base64'),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error authenticating with Google.',
    });
  }
};

// @desc    Get all registered users (for Admin Panel)
// @route   GET /api/auth/users
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status, authProvider } = req.query;
    let query = {};

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
      ];
    }

    if (role && role !== 'All' && role !== 'All Roles') {
      query.role = role;
    }

    if (status && status !== 'All' && status !== 'All Status') {
      query.status = status;
    }

    if (authProvider && authProvider !== 'All' && authProvider !== 'All Providers') {
      query.authProvider = authProvider;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user status, role, or info (for Admin Panel)
// @route   PUT /api/auth/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;

    const updated = await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: formatUserResponse(updated),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (for Admin Panel)
// @route   DELETE /api/auth/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully from database',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
