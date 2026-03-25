import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../services/api';

const MENU_OPTIONS = [
  { value: 'korean', label: '한식', icon: '🍚' },
  { value: 'chinese', label: '중식', icon: '🥟' },
  { value: 'japanese', label: '일식', icon: '🍣' },
  { value: 'western', label: '양식', icon: '🍝' },
  { value: 'cafe', label: '카페', icon: '☕' },
  { value: 'chicken', label: '치킨', icon: '🍗' },
  { value: 'pizza', label: '피자', icon: '🍕' },
  { value: 'snack', label: '분식', icon: '🍜' },
  { value: 'other', label: '기타', icon: '🍽️' },
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    type: 'meal',
    title: '',
    description: '',
    menuCategory: [],
    mealTime: '',
    participantsCount: 2,
    genderPreference: '',
    isAnonymous: false,
  });

  const isValid = form.title.trim().length >= 1 && form.description.trim().length >= 10 && form.menuCategory.length > 0 && form.mealTime;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 5) {
      setError('사진은 최대 5장까지 업로드 가능합니다.');
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
    setError('');
  };

  const removeImage = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('설명을 10자 이상 입력해주세요.');
      return;
    }
    if (form.menuCategory.length === 0) {
      setError('메뉴를 최소 1개 선택해주세요.');
      return;
    }
    if (!form.mealTime) {
      setError('식사 시간을 선택해주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('menuCategory', JSON.stringify(form.menuCategory));
      formData.append('mealTime', form.mealTime);
      formData.append('participantsCount', form.participantsCount);
      formData.append('genderPreference', form.genderPreference || 'any');
      formData.append('isAnonymous', form.isAnonymous);
      files.forEach((f) => formData.append('images', f));

      await createPost(formData);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || '게시물 작성 중 오류가 발생했습니다.';
      if (err.response?.data?.code === 'PROFILE_INCOMPLETE') {
        setError('프로필을 먼저 완성해주세요. 프로필 페이지에서 학과를 입력하고 저장하세요.');
      } else {
        setError(`오류: ${msg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMenuIcons = form.menuCategory.map((v) => MENU_OPTIONS.find((m) => m.value === v)?.icon).filter(Boolean).join(' ');

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-40">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 flex items-center bg-background-light/80 dark:bg-background-dark/80 ios-blur p-4 pb-2 justify-between">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5">
          <span className="material-symbols-outlined dark:text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold dark:text-white flex-1 text-center pr-10">밥 약속 제안</h2>
      </div>

      <div className="px-4 space-y-6 mt-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 미리보기 */}
        {form.title && (
          <div className="rounded-xl shadow-lg bg-white dark:bg-[#2d1e14] overflow-hidden border border-black/5">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-primary text-xs font-bold uppercase tracking-widest">미리보기</p>
              </div>
              <p className="text-[#1d0c0f] dark:text-white text-xl font-bold">
                {selectedMenuIcons} {form.title}
              </p>
              <p className="text-primary/70 text-sm font-medium mt-1">
                {form.type === 'meal' ? '밥 약속' : '술 한잔'} · {form.participantsCount}명
                {form.mealTime && ` · ${{ breakfast: '아침', lunch: '점심', dinner: '저녁', late_night: '야식' }[form.mealTime]}`}
              </p>
            </div>
          </div>
        )}

        {/* 타입 선택 */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-3">유형 선택</h3>
          <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-full">
            <button
              onClick={() => setForm((p) => ({ ...p, type: 'meal' }))}
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${form.type === 'meal' ? 'bg-white dark:bg-[#3d262a] shadow-sm text-primary' : 'text-gray-500'}`}
            >
              🍚 밥 약속
            </button>
            <button
              onClick={() => setForm((p) => ({ ...p, type: 'drink' }))}
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${form.type === 'drink' ? 'bg-white dark:bg-[#3d262a] shadow-sm text-primary' : 'text-gray-500'}`}
            >
              🍺 술 한잔
            </button>
          </div>
        </section>

        {/* 메뉴 선택 (필수) */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-1">
            오늘 먹고 싶은 메뉴 <span className="text-primary">*</span>
          </h3>
          <p className="text-[11px] text-gray-400 mb-3">복수 선택 가능</p>
          <div className="grid grid-cols-3 gap-2">
            {MENU_OPTIONS.map(({ value, label, icon }) => {
              const selected = form.menuCategory.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((p) => ({
                    ...p,
                    menuCategory: selected
                      ? p.menuCategory.filter((v) => v !== value)
                      : [...p.menuCategory, value],
                  }))}
                  className={`py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1 ${
                    selected
                      ? 'bg-primary text-white shadow-md scale-105'
                      : 'bg-white dark:bg-[#2d1e14] text-gray-600 dark:text-gray-300 shadow-sm'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs">{label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 식사 시간 선택 (필수) */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-3">
            식사 시간 <span className="text-primary">*</span>
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'breakfast', label: '아침', icon: '🌅', time: '07-09시' },
              { value: 'lunch', label: '점심', icon: '☀️', time: '11-14시' },
              { value: 'dinner', label: '저녁', icon: '🌆', time: '17-19시' },
              { value: 'late_night', label: '야식', icon: '🌙', time: '21시~' },
            ].map(({ value, label, icon, time }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, mealTime: value }))}
                className={`py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-0.5 ${
                  form.mealTime === value
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-white dark:bg-[#2d1e14] text-gray-600 dark:text-gray-300 shadow-sm'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-xs">{label}</span>
                <span className="text-[9px] opacity-70">{time}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 제목 */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-2">제목 *</h3>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
            placeholder="예: 학식 같이 먹을 사람!"
            className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
        </section>

        {/* 사진 업로드 */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-3">사진 추가 (최대 5장)</h3>
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, idx) => (
              <div key={idx} className="relative w-20 h-20">
                <img src={src} className="w-full h-full object-cover rounded-xl" alt="" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
              </div>
            ))}
            {files.length < 5 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10"
              >
                <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
                <span className="text-[10px] text-primary">추가</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" multiple className="hidden" onChange={handleImageSelect} />
        </section>

        {/* 인원수 */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-3">인원수</h3>
          <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-full">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setForm((p) => ({ ...p, participantsCount: n }))}
                className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${form.participantsCount === n ? 'bg-white dark:bg-[#3d262a] shadow-sm text-primary' : 'text-gray-500'}`}
              >
                {n}명
              </button>
            ))}
          </div>
        </section>

        {/* 성별 선택 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary/80 uppercase tracking-wider">성별 선호</label>
            <select
              name="genderPreference"
              value={form.genderPreference}
              onChange={handleChange}
              className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
            >
              <option value="">상관없음</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center bg-white dark:bg-[#2d1e14] rounded-xl h-12 px-4 shadow-sm w-full gap-2">
              <span className="material-symbols-outlined text-primary text-sm">school</span>
              <span className="text-sm font-medium dark:text-white">백석대 인증됨</span>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-2">상세 설명 *</h3>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={1000}
            placeholder="예: 12시에 학식 같이 먹어요! 아무나 환영입니다 😊 (최소 10자)"
            className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm min-h-[100px] resize-none dark:text-white"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/1000</p>
        </section>

        {/* 익명 */}
        <label className="flex items-center justify-between bg-white dark:bg-[#2d1e14] rounded-xl p-4 shadow-sm cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">visibility_off</span>
            <span className="text-sm font-bold dark:text-white">익명으로 게시</span>
          </div>
          <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handleChange} className="w-5 h-5 accent-primary" />
        </label>
      </div>

      {/* 게시 버튼 */}
      <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-[60]" style={{ bottom: 90 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          className={`w-full h-14 rounded-full flex items-center justify-center gap-2 text-white font-bold text-base shadow-lg transition-all active:scale-[0.98] ${
            isValid ? 'bg-gradient-to-r from-primary to-accent shadow-primary/30 opacity-100' : 'bg-primary opacity-50 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined">send</span>
              <span>밥 약속 제안하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
