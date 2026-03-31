const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 하위호환: 기존 데이터 유지
    type: {
      type: String,
      enum: ['meal', 'drink'],
      default: 'meal',
    },
    // 게시물 목적 (신규 — 카드 디자인 분기)
    purpose: {
      type: String,
      enum: ['meal', 'cafe', 'study', 'carpool'],
      default: 'meal',
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
    // 먹고 싶은 메뉴 카테고리 (선택)
    menuCategory: {
      type: [String],
      enum: ['korean', 'chinese', 'japanese', 'western', 'cafe', 'chicken', 'pizza', 'snack', 'beer', 'soju', 'other'],
      default: [],
    },
    // 식사 시간 (선택 — 레거시 호환)
    mealTime: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'late_night', ''],
      default: '',
    },
    participantsCount: {
      type: Number,
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

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ purpose: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
