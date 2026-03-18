const router = require('express').Router();
const { saveFcmToken, deleteFcmToken } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.post('/fcm-token', authenticate, saveFcmToken);
router.delete('/fcm-token', authenticate, deleteFcmToken);

module.exports = router;
