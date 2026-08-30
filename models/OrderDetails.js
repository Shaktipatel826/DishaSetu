const mongoose = require('mongoose');

const OrderDetailsSchema = new mongoose.Schema({
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
  productName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  pricePerKg: {
    type: Number,
    required: true
  },
  quantityKg: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OrderDetails', OrderDetailsSchema);
