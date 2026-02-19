const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyFirebaseToken } = require('../config/firebase');

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'bu.ac.kr';

const generateJWT = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * POST /api/auth/google
 * Firebase ID 토큰을 검증하고 자체 JWT 발급
 */
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID 토큰이 필요합니다.' });
    }

    // Firebase Admin SDK로 토큰 검증
    const decoded = await verifyFirebaseToken(idToken);
    const { email, name, picture, uid } = decoded;

    if (!email) {
      return res.status(400).json({ message: '이메일 정보를 가져올 수 없습니다.' });
    }

    // 학교 이메일 도메인 검증 (관리자 이메일은 예외)
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    const emailDomain = email.split('@')[1];
    const isAdminEmail = ADMIN_EMAILS.includes(email);
    if (emailDomain !== ALLOWED_DOMAIN && !isAdminEmail) {
      return res.status(403).json({
        message: `${ALLOWED_DOMAIN} 이메일만 사용 가능합니다.`,
        code: 'INVALID_DOMAIN',
      });
    }

    // DB에서 사용자 조회 또는 생성
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name: name || email.split('@')[0],
        profileImage: picture || '',
        googleId: uid,
        profileComplete: false,
        role: isAdminEmail ? 'admin' : 'user',
      });
    } else {
      // 관리자 이메일이면 role 강제 동기화
      if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
      // 구글 프로필 이미지 업데이트
      if (picture && !user.profileImage) {
        user.profileImage = picture;
        await user.save();
      }
    }

    const token = generateJWT(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        department: user.department,
        profileImage: user.profileImage,
        role: user.role,
        profileComplete: user.profileComplete,
      },
    });
  } catch (err) {
    console.error('Google login error:', err);
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: '토큰이 만료되었습니다. 다시 로그인해주세요.' });
    }
    if (err.code?.startsWith('auth/')) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
    res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
  }
};

/**
 * GET /api/auth/me
 * 현재 로그인한 사용자 정보 반환
 */
exports.getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      department: req.user.department,
      studentId: req.user.studentId,
      mbti: req.user.mbti,
      height: req.user.height,
      gender: req.user.gender,
      bio: req.user.bio,
      interests: req.user.interests,
      isAnonymous: req.user.isAnonymous,
      profileImage: req.user.profileImage,
      role: req.user.role,
      profileComplete: req.user.profileComplete,
      createdAt: req.user.createdAt,
    },
  });
};

/**
 * POST /api/auth/logout
 * (JWT는 stateless이므로 클라이언트가 토큰 삭제)
 */
exports.logout = (req, res) => {
  res.json({ message: '로그아웃 되었습니다.' });
};
