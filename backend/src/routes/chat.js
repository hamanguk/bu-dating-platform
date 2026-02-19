const router = require('express').Router();
const { createOrGetRoom, getMyRooms, getMessages } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/room', authenticate, createOrGetRoom);
router.get('/rooms', authenticate, getMyRooms);
router.get('/rooms/:roomId/messages', authenticate, getMessages);

module.exports = router;
