const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true },
    hi: { type: String, default: '', trim: true }
  },
  sector: {
    type: String,
    required: true,
    enum: [
      'Education',
      'Employment',
      'Women',
      'Farmers',
      'Health',
      'Housing',
      'Skill Development',
      'Financial Assistance',
      'Social Welfare',
      'Other'
    ],
    default: 'Education'
  },
  governmentType: {
    type: String,
    enum: ['Central', 'State'],
    default: 'Central'
  },
  stateName: {
    type: String,
    default: 'All India',
    trim: true
  },
  description: {
    en: { type: String, default: '', trim: true },
    hi: { type: String, default: '', trim: true }
  },
  eligibility: {
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 100 },
    education: [{ type: String }],
    category: [{ type: String }],
    targetGroup: [{ type: String }],
    details: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' }
    }
  },
  benefits: {
    en: { type: String, default: '' },
    hi: { type: String, default: '' }
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
    required: [true, 'Official government scheme portal link is required'],
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

SchemeSchema.index({ 'title.en': 'text', 'title.hi': 'text', 'description.en': 'text' });

module.exports = mongoose.model('Scheme', SchemeSchema);
