const express = require('express');
const router = express.Router();
const {
  getMyProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getMyOrders,
  updateOrderStatus,
  getEarnings,
  getBankDetails,
  updateBankDetails
} = require('../controllers/farmerController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Protect all farmer routes
router.use(verifyToken, requireRole('farmer'));

// Product Management
router.get('/products', getMyProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Order Management
router.get('/orders', getMyOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Earnings & Bank Details
router.get('/earnings', getEarnings);
router.get('/bank-details', getBankDetails);
router.put('/bank-details', updateBankDetails);

module.exports = router;
