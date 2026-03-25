import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, uploadProfileImage } from '../services/api';
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
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    department: user?.department || '',
    studentId: user?.studentId || '',
    mbti: user?.mbti || '',
    height: user?.height || '',
    gender: user?.gender || '',
    bio: user?.bio || '',
    foodPreferences: user?.foodPreferences || [],
    diningStyle: user?.diningStyle || '',
    timetable: user?.timetable || defaultTimetable(),
    isAnonymous: user?.isAnonymous || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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

  const hasFreePeriod = form.timetable.some((day) => day.some(Boolean));

  const handleSave = async () => {
    if (!form.department.trim()) {
      setError('학과는 필수 입력 항목입니다.');
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
        height: form.height ? parseInt(form.height) : undefined,
      };
      const { data } = await updateProfile(payload);
      setUser(data.user);
      if (data.user?.profileComplete) {
        setSuccess('프로필 완성! 메인 페이지로 이동합니다.');
        setTimeout(() => navigate('/', { replace: true }), 500);
      } else {
        setSuccess('저장되었습니다. 학과 입력 + 공강 시간 선택을 완료해주세요!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await uploadProfileImage(formData);
      setUser((prev) => ({ ...prev, profileImage: data.imageUrl }));
    } catch {
      setError('이미지 업로드에 실패했습니다.');
    }
  };

  const profileImageSrc = user?.profileImage
    ? user.profileImage.startsWith('/uploads') ? `http://localhost:5000${user.profileImage}` : user.profileImage
    : null;

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-10">
      {/* 헤더 */}
      <div className="flex items-center p-5 justify-between">
        <h2 className="text-xl font-extrabold dark:text-white flex-1 text-center">내 프로필</h2>
        <button onClick={logout} className="text-xs text-gray-400 px-4 py-2 rounded-2xl border border-gray-200 dark:border-white/10 font-medium">
          로그아웃
        </button>
      </div>

      {/* 프로필 이미지 */}
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <div
            className="w-32 h-32 rounded-3xl bg-cover bg-center bg-primary/10 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center"
            style={profileImageSrc ? { backgroundImage: `url(${profileImageSrc})` } : {}}
          >
            {!profileImageSrc && (
              <span className="material-symbols-outlined text-primary text-4xl">person</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-1 right-1 bg-gradient-to-r from-primary to-accent text-white p-2 rounded-xl border-2 border-white dark:border-gray-800 shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleImageUpload} />
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold dark:text-white">{user?.name}</p>
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

        <div className="space-y-1">
          <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">
            학과 <span className="text-primary">*</span>
          </label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="예: 컴퓨터공학과"
            className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-2xl h-13 px-5 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">학번 (선택)</label>
          <input
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            placeholder="예: 20231234"
            className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-2xl h-13 px-5 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">MBTI</label>
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
            <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">성별</label>
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

        <div className="space-y-1">
          <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">키 (cm)</label>
          <input
            name="height"
            type="number"
            value={form.height}
            onChange={handleChange}
            placeholder="예: 175"
            min="140" max="220"
            className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-2xl h-13 px-5 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
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

        {/* 익명 모드 토글 */}
        <div className="flex items-center justify-between bg-white dark:bg-[#2d1e14] rounded-2xl p-5 shadow-sm border border-orange-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">visibility_off</span>
              <p className="text-sm font-bold dark:text-white">익명 모드</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">다른 사용자에게 이름/사진을 숨깁니다.</p>
          </div>
          <label className="relative flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors"
            style={{ backgroundColor: form.isAnonymous ? '#FF8C00' : '#e5d5c5' }}>
            <div
              className="h-[27px] w-[27px] rounded-full bg-white shadow-md transition-transform"
              style={{ transform: form.isAnonymous ? 'translateX(20px)' : 'translateX(0)' }}
            />
            <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handleChange} className="hidden" />
          </label>
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
