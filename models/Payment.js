const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    default: 'Cash on Delivery',
    enum: ['Cash on Delivery', 'Online Payment', 'UPI', 'Net Banking']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: function() {
      return 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);
