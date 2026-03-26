import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, checkNickname } from '../services/api';
import TimetableSelector from '../components/TimetableSelector';

const MBTI_LIST = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
                   'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];

const FOOD_OPTIONS = [
  { value: 'korean', label: '한식 🍚' },
  { value: 'chinese', label: '중식 🥟' },
  { value: 'japanese', label: '일식 🍣' },
  { value: 'western', label: '양식 🍝' },
  { value: 'cafe', label: '카페 ☕' },
  { value: 'chicken', label: '치킨 🍗' },
  { value: 'pizza', label: '피자 🍕' },
  { value: 'snack', label: '분식 🍜' },
  { value: 'beer', label: '맥주 🍺' },
  { value: 'soju', label: '소주 🍶' },
];

const defaultTimetable = () => Array.from({ length: 5 }, () => Array(9).fill(false));

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [nicknameMsg, setNicknameMsg] = useState('');

  const [form, setForm] = useState({
    nickname: user?.nickname || '',
    mbti: user?.mbti || '',

    gender: user?.gender || '',
    bio: user?.bio || '',
    foodPreferences: user?.foodPreferences || [],
    diningStyle: user?.diningStyle || '',
    timetable: user?.timetable || defaultTimetable(),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'nickname') {
      setNicknameStatus(null);
      setNicknameMsg('');
    }
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleFood = (food) => {
    setForm((prev) => {
      const prefs = prev.foodPreferences.includes(food)
        ? prev.foodPreferences.filter((f) => f !== food)
        : [...prev.foodPreferences, food];
      return { ...prev, foodPreferences: prefs };
    });
  };

  const handleCheckNickname = async () => {
    if (!form.nickname.trim()) {
      setNicknameMsg('닉네임을 입력해주세요.');
      setNicknameStatus('taken');
      return;
    }
    if (form.nickname.trim().length > 20) {
      setNicknameMsg('닉네임은 20자 이내로 입력해주세요.');
      setNicknameStatus('taken');
      return;
    }
    setNicknameStatus('checking');
    try {
      const { data } = await checkNickname(form.nickname.trim());
      setNicknameStatus(data.available ? 'available' : 'taken');
      setNicknameMsg(data.message);
    } catch {
      setNicknameStatus('taken');
      setNicknameMsg('확인 중 오류가 발생했습니다.');
    }
  };

  const hasFreePeriod = form.timetable.some((day) => day.some(Boolean));

  const handleSave = async () => {
    if (!form.nickname.trim()) {
      setError('별명(닉네임)은 필수입니다. 나를 표현할 별명을 입력해주세요!');
      return;
    }
    if (!hasFreePeriod) {
      setError('공강 시간을 최소 1개 이상 선택해주세요.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
      };
      const { data } = await updateProfile(payload);
      setUser(data.user);
      if (data.user?.profileComplete && data.user?.nickname) {
        setSuccess('프로필 완성! 메인 페이지로 이동합니다.');
        setTimeout(() => navigate('/', { replace: true }), 500);
      } else {
        setSuccess('저장되었습니다. 필수 항목을 완료해주세요!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-10">
      {/* 헤더 */}
      <div className="flex items-center p-5 justify-between">
        <h2 className="text-xl font-extrabold dark:text-white flex-1 text-center">내 프로필</h2>
        <button onClick={logout} className="text-xs text-gray-400 px-4 py-2 rounded-2xl border border-gray-200 dark:border-white/10 font-medium">
          로그아웃
        </button>
      </div>

      {/* 프로필 헤더 (닉네임 + 뱃지) */}
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl">person</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-xl font-extrabold dark:text-white">{user?.nickname || '별명을 설정해주세요'}</p>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold rounded-full">
              <span className="material-symbols-outlined text-[12px]">verified</span>
              백석대 인증
            </span>
          </div>
          <p className="text-sm text-primary">{user?.email}</p>
        </div>
      </div>

      {/* 관리자 패널 버튼 */}
      {user?.role === 'admin' && (
        <div className="px-4">
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center justify-center gap-2 h-14 bg-[#2d1e14] text-white font-bold rounded-2xl shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            관리자 패널
          </button>
        </div>
      )}

      {/* 폼 */}
      <div className="px-5 space-y-5 mt-2">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* 익명성 안내 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500 text-[18px]">shield</span>
          <p className="text-xs text-blue-600 dark:text-blue-300 font-medium">이름과 학과는 공개되지 않으니 안심하고 밥 친구를 찾아보세요!</p>
        </div>

        {/* 닉네임 */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">badge</span>
            나를 표현할 별명 <span className="text-primary">*</span>
          </label>
          <div className="flex gap-2">
            <input
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              maxLength={20}
              placeholder="예: 배고픈 백석인"
              className="flex-1 bg-white dark:bg-[#2d1e14] border-none rounded-2xl h-13 px-5 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
            />
            <button
              type="button"
              onClick={handleCheckNickname}
              disabled={nicknameStatus === 'checking'}
              className="px-4 h-13 rounded-2xl bg-primary text-white text-xs font-bold whitespace-nowrap disabled:opacity-50"
            >
              {nicknameStatus === 'checking' ? '확인 중...' : '중복 확인'}
            </button>
          </div>
          {nicknameMsg && (
            <p className={`text-xs mt-1 ${nicknameStatus === 'available' ? 'text-green-500' : 'text-red-500'}`}>
              {nicknameMsg}
            </p>
          )}
          <p className="text-[10px] text-gray-400">미입력 시 귀여운 랜덤 닉네임이 부여됩니다.</p>
        </div>

        {/* MBTI + 성별 (닉네임 바로 아래 강조 배치) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              MBTI
            </label>
            <select
              name="mbti"
              value={form.mbti}
              onChange={handleChange}
              className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-2xl h-13 px-5 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
            >
              <option value="">선택</option>
              {MBTI_LIST.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">wc</span>
              성별
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-2xl h-13 px-5 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
            >
              <option value="">선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>
        </div>

        {/* 시간표 (필수) */}
        <div className={`space-y-2 rounded-2xl p-4 shadow-sm border-2 ${
          hasFreePeriod
            ? 'bg-white dark:bg-[#2d1e14] border-primary/20'
            : 'bg-orange-50 dark:bg-orange-900/10 border-primary'
        }`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              공강 시간표 <span className="text-primary">*</span>
            </label>
            {hasFreePeriod ? (
              <span className="text-[10px] text-green-600 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                설정 완료
              </span>
            ) : (
              <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                필수 입력
              </span>
            )}
          </div>
          {!hasFreePeriod && (
            <p className="text-xs text-primary/80">
              공강 시간을 선택해야 밥 친구 매칭이 시작됩니다!
            </p>
          )}
          <TimetableSelector
            timetable={form.timetable}
            onChange={(t) => setForm((prev) => ({ ...prev, timetable: t }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">자기소개</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            maxLength={300}
            placeholder="나를 소개해주세요 (최대 300자)"
            className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm min-h-[120px] resize-none dark:text-white"
          />
        </div>

        {/* 선호 메뉴 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">선호 메뉴 (복수 선택)</label>
          <div className="flex flex-wrap gap-2">
            {FOOD_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleFood(value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  form.foodPreferences.includes(value)
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 식사 스타일 */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">식사 스타일</label>
          <div className="flex gap-3">
            {[
              { value: 'quiet', label: '조용히 먹기 🤫', icon: 'volume_off' },
              { value: 'chatty', label: '수다 떨며 먹기 💬', icon: 'chat' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, diningStyle: prev.diningStyle === value ? '' : value }))}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  form.diningStyle === value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center gap-2 text-white font-extrabold text-base shadow-lg shadow-primary/30 active:scale-[0.97] transition-transform disabled:opacity-60"
        >
          {saving ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <>
              <span>저장하기</span>
              <span className="material-symbols-outlined">check</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
