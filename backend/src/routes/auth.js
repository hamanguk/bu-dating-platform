const router = require('express').Router();
const { googleLogin, getMe, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/google', authLimiter, googleLogin);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;
