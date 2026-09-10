const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', opportunityController.getOpportunities);
router.get('/ticker', opportunityController.getLatestUpdatesTicker);
router.post('/check-eligibility', opportunityController.checkEligibility);
router.get('/:id', opportunityController.getOpportunityById);

// Protected Admin CRUD routes
router.post('/', protect, adminOnly, opportunityController.createOpportunity);
router.put('/:id', protect, adminOnly, opportunityController.updateOpportunity);
router.delete('/:id', protect, adminOnly, opportunityController.deleteOpportunity);

module.exports = router;
