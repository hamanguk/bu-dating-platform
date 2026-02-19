const Report = require('../models/Report');

/**
 * POST /api/reports
 * 사용자 또는 게시물 신고
 */
exports.createReport = async (req, res) => {
  try {
    const { reportedUser, reportedPost, reason, detail } = req.body;

    if (!reportedUser || !reason) {
      return res.status(400).json({ message: '신고 대상과 사유는 필수입니다.' });
    }

    if (reportedUser === req.user._id.toString()) {
      return res.status(400).json({ message: '자신을 신고할 수 없습니다.' });
    }

    // 중복 신고 방지 (24시간 이내 동일 대상)
    const recentReport = await Report.findOne({
      reporter: req.user._id,
      reportedUser,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    if (recentReport) {
      return res.status(429).json({ message: '24시간 이내에 같은 사용자를 이미 신고했습니다.' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser,
      reportedPost: reportedPost || undefined,
      reason,
      detail: detail?.slice(0, 500) || '',
    });

    res.status(201).json({ message: '신고가 접수되었습니다.', reportId: report._id });
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ message: '신고 접수 중 오류가 발생했습니다.' });
  }
};
