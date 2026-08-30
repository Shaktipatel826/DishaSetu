const express = require('express');
const router = express.Router();
const {
  registerFarmer,
  registerCustomer,
  login,
  logout,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register-farmer', registerFarmer);
router.post('/register-customer', registerCustomer);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (any logged-in role)
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
