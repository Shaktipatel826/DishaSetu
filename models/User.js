const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
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
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'user', 'admin'],
    default: 'student'
  },
  // Student & User Profile Fields for Eligibility Finder
  age: {
    type: Number,
    min: 5,
    max: 100,
    default: null
  },
  education: {
    type: String,
    enum: ['10th', '12th', 'Graduate', 'Post Graduate', 'Diploma', 'PhD', 'ITI', 'Any', ''],
    default: 'Graduate'
  },
  state: {
    type: String,
    default: 'All India',
    trim: true
  },
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minorities', 'Women', 'All', ''],
    default: 'General'
  },
  languagePreference: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
