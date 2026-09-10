const mongoose = require('mongoose');

const SavedItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    enum: ['Opportunity', 'Scheme'],
    required: true
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    default: null
  },
  reminderPreference: {
    type: String,
    enum: ['7_days', '3_days', '1_day', 'deadline_day', 'none'],
    default: '3_days'
  },
  reminderDate: {
    type: Date,
    default: null
  },
  reminderStatus: {
    type: String,
    enum: ['pending', 'sent', 'disabled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness per user per opportunity/scheme
SavedItemSchema.index({ userId: 1, opportunityId: 1 }, { unique: true, sparse: true });
SavedItemSchema.index({ userId: 1, schemeId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('SavedItem', SavedItemSchema);
