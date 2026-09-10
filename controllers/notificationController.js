const Notification = require('../models/Notification');

/**
 * Get User Notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching notifications.' });
  }
};

/**
 * Mark Notifications as Read
 */
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Mark Read Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating notifications.' });
  }
};
