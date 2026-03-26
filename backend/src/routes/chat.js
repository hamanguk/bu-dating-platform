const router = require('express').Router();
const { createOrGetRoom, getMyRooms, getMessages, getTotalUnreadCount, leaveRoom } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/room', authenticate, createOrGetRoom);
router.get('/rooms', authenticate, getMyRooms);
router.get('/unread-count', authenticate, getTotalUnreadCount);
router.get('/rooms/:roomId/messages', authenticate, getMessages);
router.post('/rooms/:roomId/leave', authenticate, leaveRoom);

module.exports = router;
