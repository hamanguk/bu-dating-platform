const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'spam',
        'inappropriate',
        'harassment',
        'fake_profile',
        'underage',
        'other',
      ],
    },
    detail: {
      type: String,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
