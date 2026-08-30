const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getOrderById,
  submitFeedback
} = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All order routes require authentication
router.use(verifyToken);

// Customer order operations
router.post('/', requireRole('customer'), createOrder);
router.get('/my-orders', requireRole('customer'), getCustomerOrders);
router.post('/:id/feedback', requireRole('customer'), submitFeedback);

// Order tracking / detail view (Customer, Farmer, Admin)
router.get('/:id', getOrderById);

module.exports = router;
