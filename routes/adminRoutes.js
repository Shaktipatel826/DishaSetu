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
  deleteFeedback
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Protect all admin routes
router.use(verifyToken, requireRole('admin'));

// Platform statistics
router.get('/stats', getStats);

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
