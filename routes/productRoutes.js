const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getCategories
} = require('../controllers/productController');

// Public routes
router.get('/', getAllProducts);
router.get('/meta/categories', getCategories);
router.get('/:id', getProductById);

module.exports = router;
