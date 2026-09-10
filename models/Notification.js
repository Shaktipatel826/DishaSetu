const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    en: { type: String, required: true },
    hi: { type: String, default: '' }
  },
  message: {
    en: { type: String, required: true },
    hi: { type: String, default: '' }
  },
  targetUrl: {
    type: String,
    default: '#'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
