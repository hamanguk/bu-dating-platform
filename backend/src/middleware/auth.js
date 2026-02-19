const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT 인증 미들웨어
 * Authorization: Bearer <token> 헤더 검증
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-__v');
    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }

    if (user.isSuspended) {
      const now = new Date();
      if (!user.suspendedUntil || user.suspendedUntil > now) {
        return res.status(403).json({
          message: '계정이 정지되었습니다.',
          suspendedUntil: user.suspendedUntil,
        });
      }
      // 정지 기간 만료 시 자동 해제
      user.isSuspended = false;
      user.suspendedUntil = null;
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다. 다시 로그인해주세요.' });
    }
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

/**
 * 관리자 전용 미들웨어 (authenticate 이후 사용)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
  next();
};

/**
 * 프로필 완성 여부 검사 미들웨어
 */
const requireCompleteProfile = (req, res, next) => {
  if (!req.user.profileComplete) {
    return res.status(403).json({
      message: '프로필을 먼저 완성해주세요.',
      code: 'PROFILE_INCOMPLETE',
    });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireCompleteProfile };
