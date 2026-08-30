const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/customerController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Protect all customer cart routes
router.use(verifyToken, requireRole('customer'));

router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:productId', updateCartItem);
router.delete('/cart/:productId', removeFromCart);
router.delete('/cart', clearCart);

module.exports = router;
