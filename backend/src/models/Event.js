const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    // 이벤트 유형
    eventType: {
      type: String,
      enum: ['discount', 'event', 'new_menu', 'notice'],
      default: 'event',
    },
    images: {
      type: [String],
      default: [],
    },
    // 이벤트 기간
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

eventSchema.index({ endDate: 1, isActive: 1 });
eventSchema.index({ author: 1 });

module.exports = mongoose.model('Event', eventSchema);
