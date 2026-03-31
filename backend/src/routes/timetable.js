const router = require('express').Router();
const { parseTimetable, saveTimetable } = require('../controllers/timetableController');
const { authenticate } = require('../middleware/auth');

// 에브리타임 시간표 URL 파싱
router.post('/parse', authenticate, parseTimetable);

// 파싱된 시간표 저장
router.post('/save', authenticate, saveTimetable);

module.exports = router;
