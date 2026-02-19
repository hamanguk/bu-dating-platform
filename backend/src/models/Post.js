const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['one', 'group'],
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
      maxlength: 1000,
      default: '',
    },
    participantsCount: {
      type: Number,
      enum: [2, 3, 4],
      default: 2,
    },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'mixed', 'any'],
      default: 'any',
    },
    images: {
      type: [String],
      default: [],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
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

postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ author: 1 });

module.exports = mongoose.model('Post', postSchema);
