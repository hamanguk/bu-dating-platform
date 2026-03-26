const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Post = require('../models/Post');

/**
 * POST /api/chat/room
 * 채팅방 생성 또는 기존 방 반환
 */
exports.createOrGetRoom = async (req, res) => {
  try {
    const { type, targetUserId, postId } = req.body;
    const myId = req.user._id;

    if (type === 'direct') {
      if (!targetUserId) {
        return res.status(400).json({ message: '상대방 ID가 필요합니다.' });
      }
      if (targetUserId === myId.toString()) {
        return res.status(400).json({ message: '자신과는 채팅할 수 없습니다.' });
      }

      const existing = await ChatRoom.findOne({
        type: 'direct',
        participants: { $all: [myId, targetUserId], $size: 2 },
      }).populate('participants', 'nickname profileImage');

      if (existing) return res.json(existing);

      const room = await ChatRoom.create({
        type: 'direct',
        participants: [myId, targetUserId],
      });
      await room.populate('participants', 'nickname profileImage');
      return res.status(201).json(room);
    }

    if (type === 'group') {
      if (!postId) {
        return res.status(400).json({ message: '게시물 ID가 필요합니다.' });
      }

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });

      const existing = await ChatRoom.findOne({ type: 'group', post: postId }).populate(
        'participants',
        'nickname profileImage'
      );
      if (existing) {
        if (!existing.participants.some((p) => p._id.toString() === myId.toString())) {
          existing.participants.push(myId);
          await existing.save();
          await existing.populate('participants', 'nickname profileImage');
        }
        return res.json(existing);
      }

      const room = await ChatRoom.create({
        type: 'group',
        post: postId,
        participants: [myId],
        name: post.title,
      });
      await room.populate('participants', 'nickname profileImage');
      return res.status(201).json(room);
    }

    res.status(400).json({ message: '유효하지 않은 채팅 타입입니다.' });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ message: '채팅방 생성 중 오류가 발생했습니다.' });
  }
};

/**
 * GET /api/chat/rooms
 * 내 채팅방 목록 (unread count 포함)
 */
exports.getMyRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const rooms = await ChatRoom.find({
      participants: userId,
      isActive: true,
    })
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
      .populate('participants', 'nickname profileImage')
      .populate('post', 'title type');

    // 방별 안 읽은 메시지 수 계산
    const roomIds = rooms.map((r) => r._id);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          roomId: { $in: roomIds },
          sender: { $ne: userId },
          readBy: { $ne: userId },
        },
      },
      { $group: { _id: '$roomId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    unreadCounts.forEach(({ _id, count }) => {
      countMap[_id.toString()] = count;
    });

    const result = rooms.map((room) => ({
      ...room.toObject(),
      unreadCount: countMap[room._id.toString()] || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '채팅방 목록을 불러오는 중 오류가 발생했습니다.' });
  }
};

/**
 * GET /api/chat/unread-count
 * 전체 안 읽은 메시지 수
 */
exports.getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const myRooms = await ChatRoom.find({ participants: userId, isActive: true }).select('_id');
    const roomIds = myRooms.map((r) => r._id);

    const result = await Message.aggregate([
      {
        $match: {
          roomId: { $in: roomIds },
          sender: { $ne: userId },
          readBy: { $ne: userId },
        },
      },
      { $count: 'total' },
    ]);

    res.json({ unreadCount: result[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: '오류가 발생했습니다.' });
  }
};

/**
 * POST /api/chat/rooms/:roomId/leave
 * 채팅방 나가기
 */
exports.leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await ChatRoom.findOne({ _id: roomId, participants: userId });
    if (!room) return res.status(404).json({ message: '채팅방을 찾을 수 없습니다.' });

    // 시스템 메시지 생성
    const user = req.user;
    const nickname = user.nickname || '익명';
    const systemMsg = await Message.create({
      roomId: room._id,
      sender: userId,
      content: `${nickname}님이 퇴장하셨습니다.`,
    });

    // 소켓으로 시스템 메시지 브로드캐스트
    const io = req.app.get('io');
    if (io) {
      const populated = await systemMsg.populate('sender', 'nickname');
      io.to(roomId).emit('new_message', populated);
      io.to(roomId).emit('room_updated', {
        roomId,
        lastMessage: { content: systemMsg.content, sender: userId, timestamp: systemMsg.createdAt },
      });
    }

    // participants에서 제거
    room.participants = room.participants.filter((p) => p.toString() !== userId.toString());

    // 참여자가 0명이면 비활성화
    if (room.participants.length === 0) {
      room.isActive = false;
    }

    room.lastMessage = {
      content: systemMsg.content,
      sender: userId,
      timestamp: systemMsg.createdAt,
    };
    await room.save();

    res.json({ message: '채팅방을 나갔습니다.' });
  } catch (err) {
    console.error('Leave room error:', err);
    res.status(500).json({ message: '채팅방 나가기 중 오류가 발생했습니다.' });
  }
};

/**
 * GET /api/chat/rooms/:roomId/messages
 * 채팅방 메시지 조회 (페이지네이션)
 */
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const room = await ChatRoom.findOne({
      _id: roomId,
      participants: req.user._id,
    });
    if (!room) return res.status(404).json({ message: '채팅방을 찾을 수 없습니다.' });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'nickname profileImage');

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: '메시지를 불러오는 중 오류가 발생했습니다.' });
  }
};
