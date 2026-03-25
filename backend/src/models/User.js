const mongoose = require('mongoose');

// 5(월~금) x 9(1~9교시) 시간표 기본값 생성
const defaultTimetable = () =>
  Array.from({ length: 5 }, () => Array(9).fill(false));

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    studentId: {
      type: String,
      trim: true,
      default: '',
    },
    mbti: {
      type: String,
      enum: ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
             'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP', ''],
      default: '',
    },
    height: {
      type: Number,
      min: 140,
      max: 220,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    // 기존 interests → foodPreferences + diningStyle로 피벗
    interests: {
      type: [String],
      default: [],
    },
    foodPreferences: {
      type: [String],
      default: [],
    },
    diningStyle: {
      type: String,
      enum: ['quiet', 'chatty', ''],
      default: '',
    },
    // 5x9 시간표 (월~금, 1~9교시) — true = 공강
    timetable: {
      type: [[Boolean]],
      default: defaultTimetable,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedUntil: {
      type: Date,
    },
    googleId: {
      type: String,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
