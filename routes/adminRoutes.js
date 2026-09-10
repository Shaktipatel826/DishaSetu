const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRegisteredStudents,
  deleteStudent
} = require('../controllers/adminController');
const { verifyToken, adminOnly } = require('../middleware/auth');

// Protect all admin routes with authentication & admin role check
router.use(verifyToken, adminOnly);

// Dashboard stats endpoint
router.get('/dashboard-stats', getDashboardStats);

// Student directory endpoints
router.get('/students', getRegisteredStudents);
router.delete('/students/:id', deleteStudent);

module.exports = router;
