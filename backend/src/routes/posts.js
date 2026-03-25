const router = require('express').Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
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
  (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: `이미지 업로드 오류: ${err.message}` });
      }
      next();
    });
  },
  createPost
);
router.put(
  '/:id',
  authenticate,
  (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: `이미지 업로드 오류: ${err.message}` });
      }
      next();
    });
  },
  updatePost
);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, toggleLike);

module.exports = router;
