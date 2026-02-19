import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../services/api';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    type: 'group',
    title: '',
    description: '',
    participantsCount: 3,
    genderPreference: 'any',
    isAnonymous: false,
  });

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
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach((f) => formData.append('images', f));

      const { data } = await createPost(formData);
      navigate(`/posts/${data.post._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || '게시물 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-32">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 flex items-center bg-background-light/80 dark:bg-background-dark/80 ios-blur p-4 pb-2 justify-between">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5">
          <span className="material-symbols-outlined dark:text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold dark:text-white flex-1 text-center pr-10">게시글 작성</h2>
      </div>

      <div className="px-4 space-y-6 mt-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 미리보기 */}
        {form.title && (
          <div className="rounded-xl shadow-lg bg-white dark:bg-[#2d161a] overflow-hidden border border-black/5">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-primary text-xs font-bold uppercase tracking-widest">현재 활성 중</p>
              </div>
              <p className="text-[#1d0c0f] dark:text-white text-xl font-bold">{form.title}</p>
              <p className="text-[#a14553] text-sm font-medium mt-1">
                {form.participantsCount}:{form.participantsCount} {form.type === 'group' ? '과팅' : '소개팅'}
              </p>
            </div>
          </div>
        )}

        {/* 타입 선택 */}
        <section>
          <h3 className="text-sm font-bold text-[#a14553] uppercase tracking-wider mb-3">유형 선택</h3>
          <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-full">
            <button
              onClick={() => setForm((p) => ({ ...p, type: 'one' }))}
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${form.type === 'one' ? 'bg-white dark:bg-[#3d262a] shadow-sm text-primary' : 'text-gray-500'}`}
            >
              1:1 소개팅
            </button>
            <button
              onClick={() => setForm((p) => ({ ...p, type: 'group' }))}
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${form.type === 'group' ? 'bg-white dark:bg-[#3d262a] shadow-sm text-primary' : 'text-gray-500'}`}
            >
              과팅
            </button>
          </div>
        </section>

        {/* 제목 */}
        <section>
          <h3 className="text-sm font-bold text-[#a14553] uppercase tracking-wider mb-2">제목 *</h3>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
            placeholder="예: 불금 루프탑 분위기 맛집"
            className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
        </section>

        {/* 사진 업로드 */}
        <section>
          <h3 className="text-sm font-bold text-[#a14553] uppercase tracking-wider mb-3">사진 추가 (최대 5장)</h3>
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

        {/* 인원수 & 성별 선택 */}
        {form.type === 'group' && (
          <section>
            <h3 className="text-sm font-bold text-[#a14553] uppercase tracking-wider mb-3">인원수 선택</h3>
            <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-full">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setForm((p) => ({ ...p, participantsCount: n }))}
                  className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${form.participantsCount === n ? 'bg-white dark:bg-[#3d262a] shadow-sm text-primary' : 'text-gray-500'}`}
                >
                  {n}:{n}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#a14553] uppercase tracking-wider">성별</label>
            <select
              name="genderPreference"
              value={form.genderPreference}
              onChange={handleChange}
              className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
            >
              <option value="any">무관</option>
              <option value="male">남성 그룹</option>
              <option value="female">여성 그룹</option>
              <option value="mixed">혼성 그룹</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center bg-white dark:bg-[#2d161a] rounded-xl h-12 px-4 shadow-sm w-full gap-2">
              <span className="material-symbols-outlined text-primary text-sm">school</span>
              <span className="text-sm font-medium dark:text-white">대학교 인증됨</span>
            </div>
          </div>
        </div>

        {/* 분위기 설명 */}
        <section>
          <h3 className="text-sm font-bold text-[#a14553] uppercase tracking-wider mb-2">분위기 설명</h3>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={1000}
            placeholder="예: 에너지 넘치는 공대생들이에요! 시원한 루프탑에서 같이 놀아요."
            className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm min-h-[100px] resize-none dark:text-white"
          />
        </section>

        {/* 익명 */}
        <label className="flex items-center justify-between bg-white dark:bg-[#2d161a] rounded-xl p-4 shadow-sm cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">visibility_off</span>
            <span className="text-sm font-bold dark:text-white">익명으로 게시</span>
          </div>
          <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handleChange} className="w-5 h-5 accent-primary" />
        </label>
      </div>

      {/* 등록 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/80 dark:via-background-dark/80 to-transparent z-30">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="coral-gradient w-full h-14 rounded-full flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {submitting ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <>
              <span>등록하기</span>
              <span className="material-symbols-outlined">send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
