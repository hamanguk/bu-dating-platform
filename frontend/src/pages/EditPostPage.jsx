import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, updatePost } from '../services/api';

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

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    type: 'meal',
    title: '',
    description: '',
    menuCategory: 'other',
    participantsCount: 2,
    genderPreference: '',
  });

  useEffect(() => {
    getPost(id)
      .then(({ data }) => {
        if (!data.isOwner) {
          alert('수정 권한이 없습니다.');
          navigate(-1);
          return;
        }
        setForm({
          type: data.type || 'meal',
          title: data.title,
          description: data.description || '',
          menuCategory: data.menuCategory || 'other',
          participantsCount: data.participantsCount || 2,
          genderPreference: data.genderPreference || '',
        });
        setExistingImages(data.images || []);
      })
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const isValid = form.title.trim().length >= 1 && form.description.trim().length >= 10;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length + existingImages.length > 5) {
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

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (form.description.trim().length < 10) { setError('설명을 10자 이상 입력해주세요.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('menuCategory', form.menuCategory);
      formData.append('participantsCount', form.participantsCount);
      formData.append('genderPreference', form.genderPreference || 'any');
      files.forEach((f) => formData.append('images', f));

      await updatePost(id, formData);
      navigate(`/posts/${id}`, { replace: true });
    } catch (err) {
      setError(`오류: ${err.response?.data?.message || '게시물 수정 중 오류가 발생했습니다.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  const selectedMenu = MENU_OPTIONS.find((m) => m.value === form.menuCategory);
  const totalImages = existingImages.length + files.length;

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-40">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 flex items-center bg-background-light/80 dark:bg-background-dark/80 ios-blur p-4 pb-2 justify-between">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5">
          <span className="material-symbols-outlined dark:text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold dark:text-white flex-1 text-center pr-10">게시글 수정</h2>
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
                <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-blue-500 text-xs font-bold uppercase tracking-widest">수정 미리보기</p>
              </div>
              <p className="text-[#1d0c0f] dark:text-white text-xl font-bold">{selectedMenu?.icon} {form.title}</p>
              <p className="text-primary/70 text-sm font-medium mt-1">
                {form.type === 'meal' ? '밥 약속' : '술 한잔'} · {form.participantsCount}명
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

        {/* 메뉴 선택 */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-3">메뉴</h3>
          <div className="grid grid-cols-3 gap-2">
            {MENU_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, menuCategory: value }))}
                className={`py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1 ${
                  form.menuCategory === value
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-white dark:bg-[#2d1e14] text-gray-600 dark:text-gray-300 shadow-sm'
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-xs">{label}</span>
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
            className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
        </section>

        {/* 사진 */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-3">사진 (최대 5장)</h3>
          <div className="flex gap-2 flex-wrap">
            {existingImages.map((src, idx) => (
              <div key={`existing-${idx}`} className="relative w-20 h-20">
                <img src={src} className="w-full h-full object-cover rounded-xl" alt="" />
                <button onClick={() => removeExistingImage(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">✕</button>
              </div>
            ))}
            {previews.map((src, idx) => (
              <div key={`new-${idx}`} className="relative w-20 h-20">
                <img src={src} className="w-full h-full object-cover rounded-xl border-2 border-blue-300" alt="" />
                <button onClick={() => removeNewImage(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">✕</button>
              </div>
            ))}
            {totalImages < 5 && (
              <button onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10">
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

        {/* 성별 */}
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
            className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm min-h-[100px] resize-none dark:text-white"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/1000</p>
        </section>

      </div>

      {/* 수정 완료 버튼 */}
      <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-[60]" style={{ bottom: 90 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          className={`w-full h-14 rounded-full flex items-center justify-center gap-2 text-white font-bold text-base shadow-lg transition-all active:scale-[0.98] ${
            isValid ? 'bg-primary shadow-primary/30 opacity-100' : 'bg-primary opacity-50 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined">edit</span>
              <span>수정 완료</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
