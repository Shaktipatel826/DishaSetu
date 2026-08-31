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
  upiId: {
    type: String,
    default: '',
    trim: true
  },
  bankAccount: {
    type: String,
    default: '',
    trim: true
  },
  bankIfsc: {
    type: String,
    default: '',
    trim: true
  },
  bankName: {
    type: String,
    default: '',
    trim: true
  },
  accountHolderName: {
    type: String,
    default: '',
    trim: true
  },
  settledPayoutAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farmer', FarmerSchema);
