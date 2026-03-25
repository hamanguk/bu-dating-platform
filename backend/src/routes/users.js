const router = require('express').Router();
const { updateProfile, uploadProfileImage, getUserProfile } = require('../controllers/userController');
const { getMatches } = require('../controllers/matchController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/match', authenticate, getMatches);
router.get('/:id', authenticate, getUserProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/profile-image', authenticate, upload.single('image'), uploadProfileImage);

module.exports = router;
