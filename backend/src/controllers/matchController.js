const User = require('../models/User');

// 교시 → 시간 매핑 (백석대 기준)
const PERIOD_TIMES = [
  { start: 9, end: 10 },   // 1교시
  { start: 10, end: 11 },  // 2교시
  { start: 11, end: 12 },  // 3교시
  { start: 12, end: 13 },  // 4교시 (점심)
  { start: 13, end: 14 },  // 5교시
  { start: 14, end: 15 },  // 6교시
  { start: 15, end: 16 },  // 7교시
  { start: 16, end: 17 },  // 8교시
  { start: 17, end: 18 },  // 9교시
];

/**
 * 현재 KST 기준 요일(0=월 ~ 4=금)과 교시(0~8) 계산
 */
function getCurrentDayAndPeriod() {
  const now = new Date();
  // KST = UTC + 9
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.getUTCDay(); // 0=일, 1=월 ~ 5=금, 6=토
  const hour = kst.getUTCHours();

  // 월~금만 (0-indexed: 월=0, 화=1, ..., 금=4)
  const dayIdx = day >= 1 && day <= 5 ? day - 1 : -1;

  // 현재 교시 찾기
  let periodIdx = -1;
  for (let i = 0; i < PERIOD_TIMES.length; i++) {
    if (hour >= PERIOD_TIMES[i].start && hour < PERIOD_TIMES[i].end) {
      periodIdx = i;
      break;
    }
  }

  return { dayIdx, periodIdx, hour };
}

/**
 * GET /api/users/match
 * 현재 공강인 유저 목록 + foodPreferences 기반 정렬
 */
exports.getMatches = async (req, res) => {
  try {
    const { dayIdx, periodIdx, hour } = getCurrentDayAndPeriod();
    const myId = req.user._id;
    const myUser = await User.findById(myId);

    // 기본 필터: 본인 제외, 프로필 완성, 미정지
    const baseFilter = {
      _id: { $ne: myId },
      profileComplete: true,
      isSuspended: false,
    };

    // 공강 필터: 평일 + 수업시간 내이면 해당 교시가 true(공강)인 유저만
    if (dayIdx >= 0 && periodIdx >= 0) {
      baseFilter[`timetable.${dayIdx}.${periodIdx}`] = true;
    }

    let users = await User.find(baseFilter)
      .select('nickname mbti gender profileImage foodPreferences diningStyle timetable bio')
      .limit(50);

    // foodPreferences 겹침 기반 정렬
    const myPrefs = new Set(myUser?.foodPreferences || []);
    users = users
      .map((u) => {
        const overlap = (u.foodPreferences || []).filter((p) => myPrefs.has(p)).length;
        return { user: u, overlap };
      })
      .sort((a, b) => b.overlap - a.overlap)
      .map(({ user, overlap }) => ({
        ...user.toObject(),
        foodOverlap: overlap,
      }));

    res.json({
      users,
      context: {
        dayIdx,
        periodIdx,
        hour,
        isWeekday: dayIdx >= 0,
        isClassTime: periodIdx >= 0,
        isDrinkTime: hour >= 18,
      },
    });
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ message: '매칭 정보를 불러오는 중 오류가 발생했습니다.' });
  }
};
