const rateLimit = require('express-rate-limit');

// 일반 API 요청 제한
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
});

// 인증 요청 제한 (브루트포스 방지)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.' },
});

// 게시물 작성 제한
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '게시물 작성 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.' },
});

// 신고 제한
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '신고 횟수를 초과했습니다.' },
});

module.exports = { generalLimiter, authLimiter, postLimiter, reportLimiter };
