const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  categoryType: {
    type: String,
    enum: ['Opportunity', 'Government Scheme'],
    default: 'Opportunity'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Scholarship',
      'Government Scheme',
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
  organization: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  sourceUrl: {
    type: String,
    required: [true, 'Source URL / Verification link is required'],
    trim: true
  },
  proofUrl: {
    type: String,
    required: [true, 'Proof document / notification file is required'],
    trim: true
  },
  proofOriginalName: {
    type: String,
    default: ''
  },
  verificationImage: {
    type: String,
    default: ''
  },
  publicBannerImage: {
    type: String,
    default: ''
  },
  eligibility: {
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 100 },
    education: [{ type: String }],
    state: [{ type: String, default: 'All India' }],
    category: [{ type: String, default: 'All' }],
    details: { type: String, default: '' }
  },
  benefits: {
    type: String,
    default: ''
  },
  lastDate: {
    type: Date,
    required: [true, 'Last application date is required']
  },
  applyUrl: {
    type: String,
    default: '',
    trim: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Under Review', 'Changes Requested', 'Approved', 'Rejected'],
    default: 'Pending Review'
  },
  adminFeedback: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  createdOpportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  createdSchemeId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SubmissionSchema.index({ title: 'text', organization: 'text' });

module.exports = mongoose.model('Submission', SubmissionSchema);
