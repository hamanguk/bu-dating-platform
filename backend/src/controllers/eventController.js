const Event = require('../models/Event');

/**
 * GET /api/events
 * 이벤트/혜택 목록 (진행 중인 것만)
 */
exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const now = new Date();
    const filter = { isDeleted: false, isActive: true, endDate: { $gte: now } };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'nickname businessInfo accountType'),
      Event.countDocuments(filter),
    ]);

    const processed = events.map((ev) => {
      const obj = ev.toObject();
      obj.likeCount = ev.likes.length;
      obj.isLiked = ev.likes.some((id) => id.toString() === req.user._id.toString());
      delete obj.likes;
      return obj;
    });

    res.json({
      events: processed,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ message: '이벤트 목록을 불러오는 중 오류가 발생했습니다.' });
  }
};

/**
 * POST /api/events
 * 이벤트 생성 (비즈니스 계정만)
 */
exports.createEvent = async (req, res) => {
  try {
    if (req.user.accountType !== 'business') {
      return res.status(403).json({ message: '비즈니스 계정만 이벤트를 등록할 수 있습니다.' });
    }

    const { title, description, eventType, startDate, endDate } = req.body;
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: '제목, 시작일, 종료일은 필수입니다.' });
    }

    const images = req.files?.map((f) => f.path).filter(Boolean) || [];

    const event = await Event.create({
      author: req.user._id,
      title: title.trim(),
      description: description?.trim() || '',
      eventType: eventType || 'event',
      images,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    await event.populate('author', 'nickname businessInfo accountType');
    res.status(201).json({ message: '이벤트가 등록되었습니다.', event });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: '이벤트 등록 중 오류가 발생했습니다.' });
  }
};

/**
 * DELETE /api/events/:id
 * 이벤트 삭제 (작성자 or 관리자)
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });
    if (!event) return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });

    const isOwner = event.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

    event.isDeleted = true;
    await event.save();
    res.json({ message: '이벤트가 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '이벤트 삭제 중 오류가 발생했습니다.' });
  }
};

/**
 * POST /api/events/:id/like
 * 이벤트 좋아요 토글
 */
exports.toggleEventLike = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });
    if (!event) return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });

    const idx = event.likes.indexOf(req.user._id);
    if (idx === -1) {
      event.likes.push(req.user._id);
    } else {
      event.likes.splice(idx, 1);
    }
    await event.save();
    res.json({ likeCount: event.likes.length, isLiked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: '오류가 발생했습니다.' });
  }
};
