const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', schemeController.getSchemes);
router.get('/:id', schemeController.getSchemeById);

// Protected Admin routes
router.post('/', protect, adminOnly, schemeController.createScheme);
router.put('/:id', protect, adminOnly, schemeController.updateScheme);
router.delete('/:id', protect, adminOnly, schemeController.deleteScheme);

module.exports = router;
