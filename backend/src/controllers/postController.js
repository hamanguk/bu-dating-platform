const Post = require('../models/Post');
const User = require('../models/User');

// 두 시간표에서 공강이 겹치는 시간대가 있는지 확인
const hasTimetableOverlap = (a, b) => {
  if (!a || !b) return false;
  for (let day = 0; day < 5; day++) {
    for (let period = 0; period < 9; period++) {
      if (a[day]?.[period] && b[day]?.[period]) return true;
    }
  }
  return false;
};

/**
 * GET /api/posts
 * 게시물 목록 조회 (페이지네이션, 타입 필터)
 */
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { isDeleted: false };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total, me] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'nickname profileImage mbti gender timetable'),
      Post.countDocuments(filter),
      User.findById(req.user._id).select('timetable'),
    ]);

    const myTimetable = me?.timetable;

    // 작성자 처리: 닉네임 + MBTI + 성별만 노출 (이름/학과/시간표 비노출)
    const processed = posts.map((post) => {
      const obj = post.toObject();
      const authorTimetable = obj.author?.timetable;
      // 공강 겹침 여부 (본인 글 제외)
      const isOwn = post.author?._id?.toString() === req.user._id.toString();
      obj.timetableMatch = !isOwn && hasTimetableOverlap(myTimetable, authorTimetable);
      if (obj.author) {
        delete obj.author.name;
        delete obj.author.department;
        delete obj.author.timetable;
      }
      obj.likeCount = post.likes.length;
      obj.isLiked = post.likes.some((id) => id.toString() === req.user._id.toString());
      delete obj.likes;
      return obj;
    });

    res.json({
      posts: processed,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ message: '게시물 목록을 불러오는 중 오류가 발생했습니다.' });
  }
};

/**
 * GET /api/posts/:id
 * 게시물 상세 조회
 */
exports.getPost = async (req, res) => {
  try {
    const [post, me] = await Promise.all([
      Post.findOne({ _id: req.params.id, isDeleted: false }).populate(
        'author',
        'nickname profileImage mbti gender timetable'
      ),
      User.findById(req.user._id).select('timetable'),
    ]);
    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    const obj = post.toObject();
    const isOwner = post.author._id.toString() === req.user._id.toString();
    obj.timetableMatch = !isOwner && hasTimetableOverlap(me?.timetable, obj.author?.timetable);
    if (obj.author) {
      delete obj.author.timetable;
    }
    obj.likeCount = post.likes.length;
    obj.isLiked = post.likes.some((id) => id.toString() === req.user._id.toString());
    obj.isOwner = isOwner;
    delete obj.likes;

    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: '게시물을 불러오는 중 오류가 발생했습니다.' });
  }
};

/**
 * POST /api/posts
 * 게시물 작성
 */
exports.createPost = async (req, res) => {
  try {
    const { title, description, menuCategory, mealTime, participantsCount, genderPreference, isAnonymous } = req.body;

    if (!title) {
      return res.status(400).json({ message: '제목은 필수입니다.' });
    }
    // menuCategory: FormData에서 문자열/JSON으로 올 수 있음
    let categories = menuCategory;
    if (typeof categories === 'string') {
      try { categories = JSON.parse(categories); } catch { categories = [categories]; }
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: '메뉴 카테고리를 최소 1개 선택해주세요.' });
    }
    if (!mealTime) {
      return res.status(400).json({ message: '식사 시간은 필수입니다.' });
    }

    const images = req.files?.map((f) => f.path).filter(Boolean) || [];

    const post = await Post.create({
      author: req.user._id,
      title: title.trim(),
      description: description?.trim() || '',
      menuCategory: categories,
      mealTime,
      participantsCount: parseInt(participantsCount) || 2,
      genderPreference: genderPreference || 'any',
      images,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
    });

    await post.populate('author', 'nickname profileImage mbti gender');

    res.status(201).json({ message: '게시물이 작성되었습니다.', post });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: '게시물 작성 중 오류가 발생했습니다.' });
  }
};

/**
 * PUT /api/posts/:id
 * 게시물 수정 (작성자만 가능)
 */
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    const { title, description, menuCategory, mealTime, participantsCount, genderPreference, isAnonymous } = req.body;

    if (title !== undefined) post.title = title.trim();
    if (description !== undefined) post.description = description.trim();
    if (menuCategory !== undefined) {
      let cats = menuCategory;
      if (typeof cats === 'string') {
        try { cats = JSON.parse(cats); } catch { cats = [cats]; }
      }
      post.menuCategory = Array.isArray(cats) ? cats : [cats];
    }
    if (mealTime !== undefined) post.mealTime = mealTime;
    if (participantsCount !== undefined) post.participantsCount = parseInt(participantsCount) || 2;
    if (genderPreference !== undefined) post.genderPreference = genderPreference;
    if (isAnonymous !== undefined) post.isAnonymous = isAnonymous === 'true' || isAnonymous === true;

    // 새 이미지가 업로드된 경우 교체
    if (req.files?.length > 0) {
      post.images = req.files.map((f) => f.path).filter(Boolean);
    }

    await post.save();
    await post.populate('author', 'nickname profileImage mbti gender');

    res.json({ message: '게시물이 수정되었습니다.', post });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ message: '게시물 수정 중 오류가 발생했습니다.' });
  }
};

/**
 * DELETE /api/posts/:id
 * 게시물 삭제 (작성자만 가능)
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    post.isDeleted = true;
    await post.save();

    res.json({ message: '게시물이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '게시물 삭제 중 오류가 발생했습니다.' });
  }
};

/**
 * POST /api/posts/:id/like
 * 게시물 좋아요 토글
 */
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });

    const userId = req.user._id;
    const likedIndex = post.likes.indexOf(userId);

    if (likedIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likedIndex, 1);
    }
    await post.save();

    res.json({ likeCount: post.likes.length, isLiked: likedIndex === -1 });
  } catch (err) {
    res.status(500).json({ message: '오류가 발생했습니다.' });
  }
};
