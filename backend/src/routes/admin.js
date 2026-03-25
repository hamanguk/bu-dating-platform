const router = require('express').Router();
const {
  getReports,
  suspendUser,
  unsuspendUser,
  deletePost,
  updateReportStatus,
  getStats,
  getUsers,
  getChatLogs,
  getRecentActivity,
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/activity', getRecentActivity);
router.get('/users', getUsers);
router.get('/chat-logs', getChatLogs);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);
router.post('/users/:id/suspend', suspendUser);
router.post('/users/:id/unsuspend', unsuspendUser);
router.delete('/posts/:id', deletePost);

// 일회용: 모든 게시물 삭제 (혼밥친구 리브랜딩용)
router.delete('/posts-all', async (req, res) => {
  try {
    const Post = require('../models/Post');
    const result = await Post.deleteMany({});
    res.json({ message: `${result.deletedCount}개 게시물이 삭제되었습니다.` });
  } catch (err) {
    res.status(500).json({ message: '게시물 전체 삭제 중 오류' });
  }
});

module.exports = router;
