const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public auth routes
router.post('/register', authController.registerUser);
router.post('/register-farmer', authController.registerFarmer);
router.post('/register-customer', authController.registerCustomer);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected user session routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
