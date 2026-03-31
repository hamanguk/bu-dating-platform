const mongoose = require('mongoose');

// 5(월~금) x 13(1~13교시, 09:00~21:00) 시간표 기본값 생성
const defaultTimetable = () =>
  Array.from({ length: 5 }, () => Array(13).fill(false));

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
    nickname: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
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
    // 공강 시간대 (자유 텍스트 — "월수금 점심", "화목 오후" 등)
    freeTime: {
      type: String,
      maxlength: 100,
      default: '',
    },
    // 수강 과목 목록 (매칭 알고리즘 활용)
    majorCourses: {
      type: [String],
      default: [],
    },
    // 계정 유형: 일반 유저 vs 비즈니스 (주변 식당/카페 등)
    accountType: {
      type: String,
      enum: ['general', 'business'],
      default: 'general',
    },
    // 비즈니스 계정 추가 정보
    businessInfo: {
      businessName: { type: String, trim: true, default: '' },
      category: { type: String, enum: ['restaurant', 'cafe', 'bar', 'etc', ''], default: '' },
      address: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      description: { type: String, maxlength: 500, default: '' },
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
userSchema.index({ nickname: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
