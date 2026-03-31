const axios = require('axios');
const cheerio = require('cheerio');
const User = require('../models/User');

// 에브리타임 시간표 공유 URL 패턴
const EVERYTIME_URL_PATTERN = /^https?:\/\/everytime\.kr\/@[a-zA-Z0-9]+$/;

// 요일 매핑 (에타 내부 인덱스 → 우리 시간표 인덱스)
const DAY_MAP = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 }; // 월~금
const DAY_NAMES = ['월', '화', '수', '목', '금'];

// 교시 시간 범위 (09:00 ~ 21:59, 13교시)
const PERIOD_START_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

/**
 * 시간(HH:MM 형태)을 교시 인덱스로 변환
 * 09:00 → 0 (1교시), 10:00 → 1 (2교시), ... 21:00 → 12 (13교시)
 */
function timeToPeriodIndex(hours, minutes) {
  const totalMinutes = hours * 60 + minutes;
  // 09:00 = 0교시, 10:00 = 1교시, ...
  const periodIdx = Math.floor((totalMinutes - 540) / 60); // 540 = 9*60
  return Math.max(0, Math.min(12, periodIdx));
}

/**
 * 과목 목록에서 5x9 시간표(공강 표시) 생성
 * subjects: [{ name, day, startTime, endTime }]
 * 반환: boolean[5][9] — true = 공강
 */
function buildTimetableGrid(subjects) {
  // 먼저 모든 칸을 공강(true)으로 초기화
  const grid = Array.from({ length: 5 }, () => Array(13).fill(true));

  for (const subj of subjects) {
    if (subj.day < 0 || subj.day > 4) continue;

    const startPeriod = timeToPeriodIndex(
      parseInt(subj.startTime.split(':')[0]),
      parseInt(subj.startTime.split(':')[1])
    );
    const endPeriod = timeToPeriodIndex(
      parseInt(subj.endTime.split(':')[0]),
      parseInt(subj.endTime.split(':')[1]) - 1 // 종료 시간 직전까지
    );

    for (let p = startPeriod; p <= endPeriod; p++) {
      grid[subj.day][p] = false; // 수업 있음 = 공강 아님
    }
  }

  return grid;
}

/**
 * POST /api/timetable/parse
 * 에브리타임 시간표 URL을 받아 과목 정보를 크롤링
 */
exports.parseTimetable = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ message: '시간표 URL을 입력해주세요.' });
    }

    const trimmedUrl = url.trim();

    // URL 형식 검증
    if (!EVERYTIME_URL_PATTERN.test(trimmedUrl)) {
      return res.status(400).json({
        message: '올바른 에브리타임 시간표 공유 URL을 입력해주세요. (예: https://everytime.kr/@abcdef)',
      });
    }

    // 에브리타임 페이지 요청
    let html;
    try {
      const response = await axios.get(trimmedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });
      html = response.data;
    } catch (fetchErr) {
      console.error('Everytime fetch error:', fetchErr.message);
      return res.status(502).json({
        message: '에브리타임 서버에 접속할 수 없습니다. 잠시 후 다시 시도하거나 수동으로 입력해주세요.',
        fallback: true,
      });
    }

    const $ = cheerio.load(html);
    const subjects = [];

    // 에브리타임 시간표 공유 페이지 파싱
    // 방법 1: .subject 클래스 기반 파싱 (일반적 구조)
    $('div.subject, td.subject, li.subject').each((_, el) => {
      const $el = $(el);
      const name = $el.find('.name, .subject-name, h3, strong').first().text().trim()
        || $el.attr('data-name')
        || $el.text().trim().split('\n')[0]?.trim();

      if (!name) return;

      const timeText = $el.find('.time, .subject-time, span').text().trim();
      const dayAttr = $el.attr('data-day');
      const startAttr = $el.attr('data-start');
      const endAttr = $el.attr('data-end');

      if (dayAttr !== undefined && startAttr && endAttr) {
        subjects.push({
          name,
          day: parseInt(dayAttr),
          dayName: DAY_NAMES[parseInt(dayAttr)] || '',
          startTime: startAttr,
          endTime: endAttr,
        });
      } else if (timeText) {
        const parsed = parseTimeText(timeText);
        parsed.forEach((p) => {
          subjects.push({ name, ...p });
        });
      }
    });

    // 방법 2: CSS position 기반 파싱 (에타 시간표는 absolute position으로 배치)
    if (subjects.length === 0) {
      $('[data-schedule], .schedule .item, .timetable .item, div[class*="schedule"] > div').each((_, el) => {
        const $el = $(el);
        const style = $el.attr('style') || '';
        const name = $el.find('span, div, p').first().text().trim()
          || $el.text().trim().split('\n')[0]?.trim();

        if (!name || name.length > 50) return;

        // data 속성에서 시간 정보 추출
        const day = $el.attr('data-day') || $el.attr('data-col');
        const start = $el.attr('data-start') || $el.attr('data-from');
        const end = $el.attr('data-end') || $el.attr('data-to');

        if (day !== undefined && start && end) {
          const dayIdx = parseInt(day);
          if (dayIdx >= 0 && dayIdx <= 4) {
            subjects.push({
              name,
              day: dayIdx,
              dayName: DAY_NAMES[dayIdx],
              startTime: formatTime(start),
              endTime: formatTime(end),
            });
          }
        }
      });
    }

    // 방법 3: 테이블 기반 파싱
    if (subjects.length === 0) {
      $('table').each((_, table) => {
        const $table = $(table);
        const headers = [];
        $table.find('thead th, thead td, tr:first-child th, tr:first-child td').each((i, th) => {
          headers.push($(th).text().trim());
        });

        $table.find('tbody tr, tr:not(:first-child)').each((_, row) => {
          const cells = [];
          $(row).find('td, th').each((_, cell) => {
            cells.push($(cell).text().trim());
          });

          if (cells.length >= 3) {
            const name = cells[0];
            const dayTimeStr = cells[1] || '';
            const parsed = parseTimeText(dayTimeStr);
            parsed.forEach((p) => {
              subjects.push({ name, ...p });
            });
          }
        });
      });
    }

    // 방법 4: JSON-LD 또는 script 태그 내 데이터 추출
    if (subjects.length === 0) {
      $('script').each((_, script) => {
        const content = $(script).html() || '';
        // JSON 데이터가 포함된 스크립트 탐색
        const jsonMatch = content.match(/subjects?\s*[:=]\s*(\[[\s\S]*?\])/);
        if (jsonMatch) {
          try {
            const data = JSON.parse(jsonMatch[1]);
            if (Array.isArray(data)) {
              data.forEach((item) => {
                if (item.name && item.day !== undefined) {
                  subjects.push({
                    name: item.name,
                    day: parseInt(item.day),
                    dayName: DAY_NAMES[parseInt(item.day)] || '',
                    startTime: item.startTime || item.start || '',
                    endTime: item.endTime || item.end || '',
                  });
                }
              });
            }
          } catch (e) {
            // JSON 파싱 실패 — 무시
          }
        }
      });
    }

    if (subjects.length === 0) {
      return res.status(422).json({
        message: '시간표에서 과목 정보를 추출할 수 없습니다. 에브리타임 시간표 공유 URL이 맞는지 확인하거나, 수동으로 입력해주세요.',
        fallback: true,
      });
    }

    // 유효한 시간 정보가 있는 과목만 필터링
    const validSubjects = subjects.filter(
      (s) => s.name && s.startTime && s.endTime && s.day >= 0 && s.day <= 4
    );

    // 시간표 그리드 생성
    const timetableGrid = buildTimetableGrid(validSubjects);

    // 과목명 목록 (중복 제거)
    const courseNames = [...new Set(validSubjects.map((s) => s.name))];

    res.json({
      subjects: validSubjects,
      courseNames,
      timetable: timetableGrid,
      message: `${courseNames.length}개 과목이 발견되었습니다.`,
    });
  } catch (err) {
    console.error('Timetable parse error:', err);
    res.status(500).json({
      message: '시간표 분석 중 오류가 발생했습니다. 수동으로 입력해주세요.',
      fallback: true,
    });
  }
};

/**
 * POST /api/timetable/save
 * 파싱된 시간표 데이터를 유저 프로필에 저장
 */
exports.saveTimetable = async (req, res) => {
  try {
    const { timetable, majorCourses } = req.body;

    if (!timetable || !Array.isArray(timetable) || timetable.length !== 5) {
      return res.status(400).json({ message: '올바른 시간표 데이터가 아닙니다.' });
    }

    const updateData = { timetable };
    if (majorCourses && Array.isArray(majorCourses)) {
      updateData.majorCourses = majorCourses.slice(0, 20);
    }

    // 공강 여부로 profileComplete 판단
    const hasFreePeriod = timetable.some((day) => day.some(Boolean));
    updateData.profileComplete = !!hasFreePeriod;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-__v -googleId');

    res.json({
      message: '시간표가 저장되었습니다.',
      user,
    });
  } catch (err) {
    console.error('Timetable save error:', err);
    res.status(500).json({ message: '시간표 저장 중 오류가 발생했습니다.' });
  }
};

// ─── 헬퍼 ───

/**
 * "월 09:00~10:30" 또는 "월수 13:00-14:30" 같은 텍스트 파싱
 */
function parseTimeText(text) {
  const results = [];
  // "월 09:00~10:30", "화목 13:00-14:30" 패턴
  const pattern = /([월화수목금]+)\s*(\d{1,2}:\d{2})\s*[~\-]\s*(\d{1,2}:\d{2})/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const days = match[1];
    const startTime = match[2];
    const endTime = match[3];

    for (const dayChar of days) {
      const dayIdx = DAY_NAMES.indexOf(dayChar);
      if (dayIdx >= 0) {
        results.push({
          day: dayIdx,
          dayName: dayChar,
          startTime: padTime(startTime),
          endTime: padTime(endTime),
        });
      }
    }
  }

  return results;
}

/**
 * 시간 문자열을 HH:MM 형식으로 정규화
 */
function padTime(time) {
  if (!time) return '';
  // 이미 HH:MM 형태
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  // H:MM → HH:MM
  if (/^\d{1}:\d{2}$/.test(time)) return '0' + time;
  // 숫자만 (분 단위) → HH:MM 변환
  const num = parseInt(time);
  if (!isNaN(num) && num >= 0) {
    const h = Math.floor(num / 60);
    const m = num % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return time;
}

/**
 * 다양한 시간 포맷을 HH:MM으로 변환
 */
function formatTime(value) {
  if (!value) return '';
  // 이미 HH:MM
  if (/^\d{1,2}:\d{2}$/.test(value)) return padTime(value);
  // 분 단위 숫자 (에타에서 사용하는 경우)
  const num = parseInt(value);
  if (!isNaN(num)) {
    const h = Math.floor(num / 60);
    const m = num % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return value;
}
