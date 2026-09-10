const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, notificationController.getNotifications);
router.put('/read-all', protect, notificationController.markAllRead);

module.exports = router;
