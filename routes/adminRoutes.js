const express = require('express');
const router = express.Router();
const {
  getStats,
  getFarmers,
  deleteFarmer,
  getCustomers,
  deleteCustomer,
  getProducts,
  deleteProduct,
  getOrders,
  deleteOrder,
  getAllFeedback,
  deleteFeedback,
  getPaymentSettings,
  updatePaymentSettings,
  getPublicPaymentConfig,
  getFarmerPayouts,
  settleFarmerPayout
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public route for checkout page to load receiving UPI ID & Payee details
router.get('/public/payment-config', getPublicPaymentConfig);

// Protect all following admin routes
router.use(verifyToken, requireRole('admin'));

// Platform statistics
router.get('/stats', getStats);

// Farmer Payouts & Settlement (Admin transfers funds to Farmers)
router.get('/payouts', getFarmerPayouts);
router.post('/payouts/:farmerId/settle', settleFarmerPayout);

// Payment Receiving & Bank Settings (Admin)
router.get('/payment-settings', getPaymentSettings);
router.put('/payment-settings', updatePaymentSettings);

// Farmers management
router.get('/farmers', getFarmers);
router.delete('/farmers/:id', deleteFarmer);

// Customers management
router.get('/customers', getCustomers);
router.delete('/customers/:id', deleteCustomer);

// Products management
router.get('/products', getProducts);
router.delete('/products/:id', deleteProduct);

// Orders management
router.get('/orders', getOrders);
router.delete('/orders/:id', deleteOrder);

// Feedback moderation
router.get('/feedback', getAllFeedback);
router.delete('/feedback/:id', deleteFeedback);

module.exports = router;
