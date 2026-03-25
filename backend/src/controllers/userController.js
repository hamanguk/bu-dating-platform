const User = require('../models/User');
const { cloudinary } = require('../middleware/upload');

// 랜덤 닉네임 생성용 풀
const RANDOM_ADJECTIVES = [
  '배고픈', '졸린', '행복한', '신나는', '용감한', '귀여운', '멋진', '활발한',
  '조용한', '웃는', '꿈꾸는', '달리는', '노래하는', '춤추는', '빛나는', '따뜻한',
];
const RANDOM_NOUNS = [
  '백석인', '대학생', '학우', '밥친구', '식탐러', '캠퍼스인', '탐험가', '미식가',
  '산책러', '독서가', '커피러버', '라면왕', '치킨매니아', '공강러', '도서관인', '기숙사생',
];

const generateRandomNickname = () => {
  const adj = RANDOM_ADJECTIVES[Math.floor(Math.random() * RANDOM_ADJECTIVES.length)];
  const noun = RANDOM_NOUNS[Math.floor(Math.random() * RANDOM_NOUNS.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj} ${noun}${num}`;
};

/**
 * PUT /api/users/profile
 * 프로필 업데이트 (department 포함)
 */
exports.updateProfile = async (req, res) => {
  try {
    const { department, studentId, mbti, height, gender, bio, interests,
            foodPreferences, diningStyle, timetable, isAnonymous, nickname } = req.body;

    const updateData = {};
    if (department !== undefined) updateData.department = department.trim();
    if (studentId !== undefined) updateData.studentId = studentId.trim();
    if (mbti !== undefined) updateData.mbti = mbti;
    if (height !== undefined) updateData.height = parseInt(height);
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio.slice(0, 300);
    if (interests !== undefined) updateData.interests = Array.isArray(interests) ? interests.slice(0, 10) : [];
    if (foodPreferences !== undefined) updateData.foodPreferences = Array.isArray(foodPreferences) ? foodPreferences.slice(0, 10) : [];
    if (diningStyle !== undefined) updateData.diningStyle = diningStyle;
    if (timetable !== undefined) updateData.timetable = timetable;
    if (isAnonymous !== undefined) updateData.isAnonymous = Boolean(isAnonymous);
    if (nickname !== undefined) updateData.nickname = nickname.trim() || null;

    // 닉네임이 비어있으면 랜덤 닉네임 부여
    const currentUser = await User.findById(req.user._id);
    if (!updateData.nickname && !currentUser.nickname) {
      let randomNick = generateRandomNickname();
      let attempts = 0;
      while (attempts < 10) {
        const exists = await User.findOne({ nickname: randomNick });
        if (!exists) break;
        randomNick = generateRandomNickname();
        attempts++;
      }
      updateData.nickname = randomNick;
    }

    // 프로필 완성 여부 판단 (timetable 공강 1개 이상 필수)
    const finalTimetable = updateData.timetable ?? currentUser.timetable;
    const hasFreePeriod = finalTimetable?.some((day) => day?.some(Boolean));
    updateData.profileComplete = !!hasFreePeriod;

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

    const imageUrl = req.file.path;

    // 이전 Cloudinary 이미지 삭제
    const user = await User.findById(req.user._id);
    if (user.profileImage && user.profileImage.includes('cloudinary.com')) {
      const publicId = user.profileImage.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await User.findByIdAndUpdate(req.user._id, { profileImage: imageUrl });

    res.json({ message: '프로필 이미지가 업데이트되었습니다.', imageUrl });
  } catch (err) {
    console.error('Profile image upload error:', err);
    res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
  }
};

/**
 * GET /api/users/check-nickname
 * 닉네임 중복 확인
 */
exports.checkNickname = async (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ message: '닉네임을 입력해주세요.' });
    }
    if (nickname.trim().length > 20) {
      return res.status(400).json({ message: '닉네임은 20자 이내로 입력해주세요.' });
    }
    const existing = await User.findOne({ nickname: nickname.trim() });
    // 본인의 현재 닉네임이면 사용 가능
    if (existing && existing._id.toString() !== req.user._id.toString()) {
      return res.json({ available: false, message: '이미 사용 중인 닉네임입니다.' });
    }
    res.json({ available: true, message: '사용 가능한 닉네임입니다.' });
  } catch (err) {
    res.status(500).json({ message: '닉네임 확인 중 오류가 발생했습니다.' });
  }
};

/**
 * GET /api/users/:id
 * 특정 사용자 공개 프로필 조회 (학과명은 다른 유저에게 비노출)
 */
exports.getUserProfile = async (req, res) => {
  try {
    const isMe = req.user._id.toString() === req.params.id;

    // 본인이면 전체 정보, 타인이면 닉네임/MBTI/성별만
    const selectFields = isMe
      ? 'nickname department mbti height gender bio interests foodPreferences diningStyle timetable profileImage createdAt'
      : 'nickname mbti gender bio foodPreferences diningStyle profileImage createdAt';

    const user = await User.findById(req.params.id).select(selectFields);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(user.toObject());
  } catch (err) {
    res.status(500).json({ message: '사용자 정보를 불러오는 중 오류가 발생했습니다.' });
  }
};
