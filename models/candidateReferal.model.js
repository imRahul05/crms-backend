const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  experience: {  
    type: String,
    enum: ['Fresher', '1', '2', '3', '4+'],  
    default: 'Fresher'
  },
  resume: {
    type: String,
    required: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

const candidateReferral = mongoose.model('Referral', referralSchema);

module.exports = candidateReferral;
