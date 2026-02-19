const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/posts
 * 게시물 목록 조회 (페이지네이션, 타입 필터)
 */
exports.getPosts = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const filter = { isDeleted: false };
    if (type === 'one' || type === 'group') filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'name department profileImage isAnonymous'),
      Post.countDocuments(filter),
    ]);

    // 익명 작성자 처리
    const processed = posts.map((post) => {
      const obj = post.toObject();
      if (post.isAnonymous) {
        obj.author = { name: '익명', department: obj.author?.department || '', profileImage: '' };
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
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).populate(
      'author',
      'name department profileImage isAnonymous mbti'
    );
    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    const obj = post.toObject();
    if (post.isAnonymous && post.author._id.toString() !== req.user._id.toString()) {
      obj.author = { name: '익명', department: '', profileImage: '' };
    }
    obj.likeCount = post.likes.length;
    obj.isLiked = post.likes.some((id) => id.toString() === req.user._id.toString());
    obj.isOwner = post.author._id.toString() === req.user._id.toString();
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
    const { type, title, description, participantsCount, genderPreference, isAnonymous } = req.body;

    if (!type || !title) {
      return res.status(400).json({ message: '타입과 제목은 필수입니다.' });
    }

    const images = req.files?.map((f) => `/uploads/${f.filename}`) || [];

    const post = await Post.create({
      author: req.user._id,
      type,
      title: title.trim(),
      description: description?.trim() || '',
      participantsCount: parseInt(participantsCount) || 2,
      genderPreference: genderPreference || 'any',
      images,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
    });

    await post.populate('author', 'name department profileImage');

    res.status(201).json({ message: '게시물이 작성되었습니다.', post });
  } catch (err) {
    // 업로드된 파일 정리
    if (req.files) {
      req.files.forEach((f) => {
        const filePath = path.join(__dirname, '../../uploads', f.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
    console.error('Create post error:', err);
    res.status(500).json({ message: '게시물 작성 중 오류가 발생했습니다.' });
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
