const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Farm location/village/district is required'],
    trim: true
  },
  role: {
    type: String,
    default: 'farmer',
    immutable: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farmer', FarmerSchema);
