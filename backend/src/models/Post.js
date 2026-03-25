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
      enum: ['meal', 'drink'],
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
    // 먹고 싶은 메뉴 카테고리 (필수, 복수 선택)
    menuCategory: {
      type: [String],
      enum: ['korean', 'chinese', 'japanese', 'western', 'cafe', 'chicken', 'pizza', 'snack', 'other'],
      validate: {
        validator: (v) => v && v.length > 0,
        message: '메뉴 카테고리를 최소 1개 선택해주세요.',
      },
    },
    // 식사 시간 (필수)
    mealTime: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'late_night'],
      required: true,
    },
    participantsCount: {
      type: Number,
      enum: [2, 3, 4],
      default: 2,
    },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
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
