const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Post = require('../models/Post');

/**
 * POST /api/chat/room
 * 채팅방 생성 또는 기존 방 반환
 * - type: 'direct' (1:1) | 'group' (과팅)
 * - postId: 과팅 게시물 ID (group일 경우)
 * - targetUserId: 1:1 채팅 상대방 ID (direct일 경우)
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

      // 기존 1:1 방 조회
      const existing = await ChatRoom.findOne({
        type: 'direct',
        participants: { $all: [myId, targetUserId], $size: 2 },
      }).populate('participants', 'name profileImage department');

      if (existing) return res.json(existing);

      const room = await ChatRoom.create({
        type: 'direct',
        participants: [myId, targetUserId],
      });
      await room.populate('participants', 'name profileImage department');
      return res.status(201).json(room);
    }

    if (type === 'group') {
      if (!postId) {
        return res.status(400).json({ message: '게시물 ID가 필요합니다.' });
      }

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });

      // 기존 그룹 방 조회
      const existing = await ChatRoom.findOne({ type: 'group', post: postId }).populate(
        'participants',
        'name profileImage department'
      );
      if (existing) {
        // 참여자가 아닌 경우 추가
        if (!existing.participants.some((p) => p._id.toString() === myId.toString())) {
          existing.participants.push(myId);
          await existing.save();
          await existing.populate('participants', 'name profileImage department');
        }
        return res.json(existing);
      }

      const room = await ChatRoom.create({
        type: 'group',
        post: postId,
        participants: [myId],
        name: post.title,
      });
      await room.populate('participants', 'name profileImage department');
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
 * 내 채팅방 목록
 */
exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user._id,
      isActive: true,
    })
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
      .populate('participants', 'name profileImage isAnonymous')
      .populate('post', 'title type');

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: '채팅방 목록을 불러오는 중 오류가 발생했습니다.' });
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
      .populate('sender', 'name profileImage');

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: '메시지를 불러오는 중 오류가 발생했습니다.' });
  }
};
