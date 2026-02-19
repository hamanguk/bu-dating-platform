const router = require('express').Router();
const {
  getPosts,
  getPost,
  createPost,
  deletePost,
  toggleLike,
} = require('../controllers/postController');
const { authenticate, requireCompleteProfile } = require('../middleware/auth');
const { postLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');

router.get('/', authenticate, getPosts);
router.get('/:id', authenticate, getPost);
router.post(
  '/',
  authenticate,
  requireCompleteProfile,
  postLimiter,
  upload.array('images', 5),
  createPost
);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, toggleLike);

module.exports = router;
