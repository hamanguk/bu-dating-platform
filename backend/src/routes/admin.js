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

module.exports = router;
