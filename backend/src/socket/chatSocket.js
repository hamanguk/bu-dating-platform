const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

const initSocket = (io) => {
  // Socket.io JWT 인증 미들웨어
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('인증 토큰이 필요합니다.'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name profileImage _id');
      if (!user) return next(new Error('유효하지 않은 사용자입니다.'));

      socket.user = user;
      next();
    } catch {
      next(new Error('유효하지 않은 토큰입니다.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.id})`);

    // 채팅방 입장
    socket.on('join_room', async (roomId) => {
      try {
        const room = await ChatRoom.findOne({
          _id: roomId,
          participants: socket.user._id,
        });
        if (!room) {
          socket.emit('error', { message: '채팅방 접근 권한이 없습니다.' });
          return;
        }
        socket.join(roomId);
        socket.emit('joined_room', { roomId });
        console.log(`📩 ${socket.user.name} joined room ${roomId}`);
      } catch (err) {
        socket.emit('error', { message: '채팅방 입장 중 오류가 발생했습니다.' });
      }
    });

    // 채팅방 퇴장
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    // 메시지 전송
    socket.on('send_message', async ({ roomId, content }) => {
      try {
        if (!content?.trim()) return;

        const room = await ChatRoom.findOne({
          _id: roomId,
          participants: socket.user._id,
        });
        if (!room) {
          socket.emit('error', { message: '채팅방 접근 권한이 없습니다.' });
          return;
        }

        const message = await Message.create({
          roomId,
          sender: socket.user._id,
          content: content.trim().slice(0, 2000),
        });

        await message.populate('sender', 'name profileImage');

        // 마지막 메시지 업데이트
        await ChatRoom.findByIdAndUpdate(roomId, {
          lastMessage: {
            content: message.content,
            sender: socket.user._id,
            timestamp: message.createdAt,
          },
        });

        // 방의 모든 참여자에게 메시지 전송
        io.to(roomId).emit('new_message', message);
      } catch (err) {
        console.error('Send message error:', err);
        socket.emit('error', { message: '메시지 전송 중 오류가 발생했습니다.' });
      }
    });

    // 타이핑 표시
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.user._id,
        name: socket.user.name,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = { initSocket };
