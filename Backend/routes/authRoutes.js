const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Admin user management routes
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// @desc    Get admin credentials for quick access / auto-fetch in Admin Panel
// @route   GET /api/auth/admin-credentials
router.get('/admin-credentials', (req, res) => {
  res.json({
    success: true,
    data: {
      username: 'Admin',
      email: 'admin@rhincoequipments.com',
      password: '12345',
      role: 'Super Admin',
      note: 'Auto-fetched system admin credentials for Rhinco Admin Panel',
    },
  });
});

module.exports = router;
