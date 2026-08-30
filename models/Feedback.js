const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required (1-5)'],
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5']
  },
  comment: {
    type: String,
    required: [true, 'Feedback review comment is required'],
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
