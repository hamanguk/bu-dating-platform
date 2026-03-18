const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const { getFirebaseAdmin } = require('../config/firebase');

// 오프라인 사용자에게 FCM 푸시 알림 전송
const sendPushToOfflineUsers = async (io, room, senderName, messageContent) => {
  try {
    // 현재 소켓에 연결된 사용자 ID 수집
    const connectedUserIds = new Set();
    for (const [, socket] of io.sockets.sockets) {
      if (socket.user?._id) {
        connectedUserIds.add(socket.user._id.toString());
      }
    }

    // 오프라인 참여자 찾기
    const offlineParticipants = room.participants.filter(
      (pid) => !connectedUserIds.has(pid.toString())
    );

    if (offlineParticipants.length === 0) return;

    // 오프라인 유저들의 FCM 토큰 조회
    const users = await User.find({
      _id: { $in: offlineParticipants },
      fcmTokens: { $exists: true, $ne: [] },
    }).select('fcmTokens');

    const tokens = users.flatMap((u) => u.fcmTokens);
    if (tokens.length === 0) return;

    getFirebaseAdmin();
    const message = {
      notification: {
        title: `${senderName}님의 메시지`,
        body: messageContent.length > 100 ? messageContent.slice(0, 100) + '…' : messageContent,
      },
      data: {
        roomId: room._id.toString(),
        type: 'chat_message',
      },
    };

    // 각 토큰에 개별 전송 (실패한 토큰 정리)
    const results = await Promise.allSettled(
      tokens.map((token) =>
        admin.messaging().send({ ...message, token })
      )
    );

    // 실패한 토큰(만료/무효) 정리
    const invalidTokens = [];
    results.forEach((result, idx) => {
      if (result.status === 'rejected') {
        const code = result.reason?.code;
        if (code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token') {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      await User.updateMany(
        { fcmTokens: { $in: invalidTokens } },
        { $pull: { fcmTokens: { $in: invalidTokens } } }
      );
    }
  } catch (err) {
    console.error('FCM push error:', err.message);
  }
};

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

    // 개인 채널 join (실시간 알림용)
    socket.join(`user_${socket.user._id}`);

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
        socket._activeRoom = roomId;
        socket.emit('joined_room', { roomId });
        console.log(`📩 ${socket.user.name} joined room ${roomId}`);
      } catch (err) {
        socket.emit('error', { message: '채팅방 입장 중 오류가 발생했습니다.' });
      }
    });

    // 채팅방 퇴장
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      if (socket._activeRoom === roomId) socket._activeRoom = null;
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
          readBy: [socket.user._id],
        });

        await message.populate('sender', 'name profileImage');

        const lastMessage = {
          content: message.content,
          sender: socket.user._id,
          timestamp: message.createdAt,
        };

        // 마지막 메시지 업데이트
        await ChatRoom.findByIdAndUpdate(roomId, { lastMessage });

        // 방의 모든 참여자에게 메시지 전송
        io.to(roomId).emit('new_message', message);

        // 모든 참여자의 개인 채널에 room_updated 전송 (ChatList 실시간 갱신용)
        room.participants.forEach((participantId) => {
          io.to(`user_${participantId}`).emit('room_updated', {
            roomId,
            lastMessage,
          });
        });

        // 오프라인 사용자에게 FCM 푸시 알림
        sendPushToOfflineUsers(io, room, socket.user.name, content.trim());
      } catch (err) {
        console.error('Send message error:', err);
        socket.emit('error', { message: '메시지 전송 중 오류가 발생했습니다.' });
      }
    });

    // 메시지 읽음 처리
    socket.on('read_messages', async ({ roomId }) => {
      try {
        const room = await ChatRoom.findOne({
          _id: roomId,
          participants: socket.user._id,
        });
        if (!room) return;

        await Message.updateMany(
          {
            roomId,
            sender: { $ne: socket.user._id },
            readBy: { $ne: socket.user._id },
          },
          { $addToSet: { readBy: socket.user._id } }
        );

        // 방의 다른 사용자에게 읽음 알림
        socket.to(roomId).emit('messages_read', {
          roomId,
          userId: socket.user._id,
        });
      } catch (err) {
        console.error('Read messages error:', err);
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

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.user.name} (${reason})`);
      socket.leave(`user_${socket.user._id}`);
    });
  });
};

module.exports = { initSocket };
