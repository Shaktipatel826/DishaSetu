const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Admin name is required'],
    trim: true,
    default: 'Administrator'
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
  role: {
    type: String,
    default: 'admin',
    immutable: true
  },
  upiId: {
    type: String,
    default: 'kisandirect@upi',
    trim: true
  },
  businessName: {
    type: String,
    default: 'Kisan Direct Marketplace',
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admin', AdminSchema);
