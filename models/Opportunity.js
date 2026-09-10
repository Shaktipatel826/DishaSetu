const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true },
    hi: { type: String, default: '', trim: true }
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Scholarship',
      'GK / GS Competition',
      'Quiz Competition',
      'Essay Competition',
      'Competitive Exam',
      'Coding Competition',
      'Hackathon',
      'Skill Development Program',
      'Training Program',
      'Prize Opportunity',
      'Internship',
      'Other'
    ],
    default: 'Scholarship'
  },
  description: {
    en: { type: String, default: '', trim: true },
    hi: { type: String, default: '', trim: true }
  },
  eligibility: {
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 100 },
    education: [{ type: String }],
    state: [{ type: String }],
    category: [{ type: String }],
    details: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' }
    }
  },
  benefits: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  prizeAmount: {
    type: String,
    default: ''
  },
  documents: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  applicationProcess: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
  },
  lastDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSING SOON', 'UPCOMING', 'CLOSED'],
    default: 'OPEN'
  },
  applyUrl: {
    type: String,
    required: [true, 'Official application link (applyUrl) is required'],
    trim: true
  },
  showInLatestUpdates: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OpportunitySchema.index({ 'title.en': 'text', 'title.hi': 'text', 'description.en': 'text' });

module.exports = mongoose.model('Opportunity', OpportunitySchema);
