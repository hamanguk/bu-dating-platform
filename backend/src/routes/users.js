const router = require('express').Router();
const { updateProfile, uploadProfileImage, getUserProfile } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/:id', authenticate, getUserProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/profile-image', authenticate, upload.single('image'), uploadProfileImage);

module.exports = router;
