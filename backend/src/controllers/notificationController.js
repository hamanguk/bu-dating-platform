const User = require('../models/User');

// FCM 토큰 저장
exports.saveFcmToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'FCM 토큰이 필요합니다.' });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { fcmTokens: token },
    });

    res.json({ message: 'FCM 토큰이 저장되었습니다.' });
  } catch (err) {
    console.error('saveFcmToken error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// FCM 토큰 삭제 (로그아웃 시)
exports.deleteFcmToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'FCM 토큰이 필요합니다.' });

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { fcmTokens: token },
    });

    res.json({ message: 'FCM 토큰이 삭제되었습니다.' });
  } catch (err) {
    console.error('deleteFcmToken error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
