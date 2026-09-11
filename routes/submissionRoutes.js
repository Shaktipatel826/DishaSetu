const express = require('express');
const router = express.Router();
const { submissionUploads } = require('../middleware/upload');
const { verifyToken, adminOnly } = require('../middleware/auth');
const {
  createSubmission,
  getMySubmissions,
  getAllSubmissionsAdmin,
  getSubmissionById,
  updateSubmissionStatusAdmin
} = require('../controllers/submissionController');

// All submission routes require authentication
router.use(verifyToken);

// Student submission endpoints
router.post('/', submissionUploads, createSubmission);
router.get('/my', getMySubmissions);

// Admin review endpoints
router.get('/admin', adminOnly, getAllSubmissionsAdmin);
router.put('/admin/:id/status', adminOnly, updateSubmissionStatusAdmin);

// Single submission details
router.get('/:id', getSubmissionById);

module.exports = router;
