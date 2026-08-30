const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Wheat', 'Rice', 'Dal', 'Millets', 'Pulses', 'Oilseeds', 'Spices', 'Barley', 'Corn', 'Oats', 'Other'],
    default: 'Wheat'
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Price per kg is required'],
    min: [1, 'Price per kg must be greater than 0']
  },
  stockKg: {
    type: Number,
    required: [true, 'Stock quantity (in kg) is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  ratingAvg: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search queries
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
