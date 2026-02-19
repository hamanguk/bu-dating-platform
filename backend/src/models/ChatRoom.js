const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    name: {
      type: String,
      default: '',
    },
    lastMessage: {
      content: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 1:1 채팅방 중복 방지 (participants 2명인 direct 타입)
chatRoomSchema.index({ type: 1, participants: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
