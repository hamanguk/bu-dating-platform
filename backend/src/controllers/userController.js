const User = require('../models/User');
const fs = require('fs');
const path = require('path');

/**
 * PUT /api/users/profile
 * 프로필 업데이트 (department 포함)
 */
exports.updateProfile = async (req, res) => {
  try {
    const { department, studentId, mbti, height, gender, bio, interests, isAnonymous } = req.body;

    const updateData = {};
    if (department !== undefined) updateData.department = department.trim();
    if (studentId !== undefined) updateData.studentId = studentId.trim();
    if (mbti !== undefined) updateData.mbti = mbti;
    if (height !== undefined) updateData.height = parseInt(height);
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio.slice(0, 300);
    if (interests !== undefined) updateData.interests = Array.isArray(interests) ? interests.slice(0, 10) : [];
    if (isAnonymous !== undefined) updateData.isAnonymous = Boolean(isAnonymous);

    // 프로필 완성 여부 판단 (department 필수)
    const currentUser = await User.findById(req.user._id);
    const finalDepartment = updateData.department ?? currentUser.department;
    if (finalDepartment) {
      updateData.profileComplete = true;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-__v -googleId');

    res.json({ message: '프로필이 업데이트되었습니다.', user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: '프로필 업데이트 중 오류가 발생했습니다.' });
  }
};

/**
 * POST /api/users/profile-image
 * 프로필 이미지 업로드
 */
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일을 선택해주세요.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // 이전 이미지 삭제 (구글 URL 제외)
    const user = await User.findById(req.user._id);
    if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../', user.profileImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await User.findByIdAndUpdate(req.user._id, { profileImage: imageUrl });

    res.json({ message: '프로필 이미지가 업데이트되었습니다.', imageUrl });
  } catch (err) {
    console.error('Profile image upload error:', err);
    res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
  }
};

/**
 * GET /api/users/:id
 * 특정 사용자 공개 프로필 조회
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name department mbti height gender bio interests isAnonymous profileImage createdAt'
    );
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    // 익명 모드 처리
    if (user.isAnonymous && req.user._id.toString() !== req.params.id) {
      return res.json({
        ...user.toObject(),
        name: '익명',
        profileImage: '',
        department: user.department ? user.department.split('학과')[0] + '학과' : '',
      });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: '사용자 정보를 불러오는 중 오류가 발생했습니다.' });
  }
};
