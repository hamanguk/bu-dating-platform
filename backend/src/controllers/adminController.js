const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');

/**
 * GET /api/admin/reports
 * 신고 목록 조회
 */
exports.getReports = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find({ status })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reporter', 'name email')
        .populate('reportedUser', 'name email department')
        .populate('reportedPost', 'title type'),
      Report.countDocuments({ status }),
    ]);

    res.json({ reports, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: '신고 목록을 불러오는 중 오류가 발생했습니다.' });
  }
};

/**
 * POST /api/admin/users/:id/suspend
 * 사용자 정지
 */
exports.suspendUser = async (req, res) => {
  try {
    const { days = 7 } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    if (user.role === 'admin') return res.status(403).json({ message: '관리자는 정지할 수 없습니다.' });

    user.isSuspended = true;
    user.suspendedUntil = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({ message: `${days}일 정지 처리되었습니다.`, suspendedUntil: user.suspendedUntil });
  } catch (err) {
    res.status(500).json({ message: '사용자 정지 처리 중 오류가 발생했습니다.' });
  }
};

/**
 * POST /api/admin/users/:id/unsuspend
 * 사용자 정지 해제
 */
exports.unsuspendUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      isSuspended: false,
      suspendedUntil: null,
    });
    res.json({ message: '정지가 해제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '오류가 발생했습니다.' });
  }
};

/**
 * DELETE /api/admin/posts/:id
 * 게시물 강제 삭제 (관리자)
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!post) return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    res.json({ message: '게시물이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '오류가 발생했습니다.' });
  }
};

/**
 * PATCH /api/admin/reports/:id
 * 신고 상태 업데이트
 */
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: '신고를 찾을 수 없습니다.' });
    res.json({ message: '신고 상태가 업데이트되었습니다.', report });
  } catch (err) {
    res.status(500).json({ message: '오류가 발생했습니다.' });
  }
};

/**
 * GET /api/admin/stats
 * 대시보드 통계
 */
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalPosts, pendingReports, suspendedUsers] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments({ isDeleted: false }),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ isSuspended: true }),
    ]);
    res.json({ totalUsers, totalPosts, pendingReports, suspendedUsers });
  } catch (err) {
    res.status(500).json({ message: '통계를 불러오는 중 오류가 발생했습니다.' });
  }
};
