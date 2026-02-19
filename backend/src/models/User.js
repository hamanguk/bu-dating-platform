const mongoose = require('mongoose');

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
    interests: {
      type: [String],
      default: [],
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
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
