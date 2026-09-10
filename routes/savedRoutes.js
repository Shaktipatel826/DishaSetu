const express = require('express');
const router = express.Router();
const savedItemController = require('../controllers/savedItemController');
const { protect } = require('../middleware/auth');

router.post('/', protect, savedItemController.saveItem);
router.get('/', protect, savedItemController.getUserSavedItems);
router.put('/:id/reminder', protect, savedItemController.updateReminder);
router.delete('/:id', protect, savedItemController.removeSavedItem);

module.exports = router;
