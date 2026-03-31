import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../services/api';

const PLACEHOLDERS = [
  '공강인데 학식 같이 먹을 사람!',
  '자취방 근처에서 삼겹살 번개 하실 분?',
  '점심에 혼밥 싫어요... 같이 먹어요!',
  '카페에서 공부하면서 커피 한잔 할 사람~',
  '오늘 저녁 치킨 먹을 사람 구합니다!',
  '학교 앞 맛집 탐방 같이 갈 사람?',
  '야식으로 라면 끓여 먹을 사람!',
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [placeholder, setPlaceholder] = useState('');

  const [form, setForm] = useState({
    title: '',
  });

  useEffect(() => {
    setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  }, []);

  const isValid = form.title.trim().length >= 1;

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
      formData.append('title', form.title.trim());
      files.forEach((f) => formData.append('images', f));

      await createPost(formData);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || '게시물 작성 중 오류가 발생했습니다.';
      if (err.response?.data?.code === 'PROFILE_INCOMPLETE') {
        setError('프로필을 먼저 완성해주세요. 프로필 페이지에서 공강 시간표를 설정하고 저장하세요.');
      } else {
        setError(`오류: ${msg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-40">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 flex items-center bg-background-light/80 dark:bg-background-dark/80 ios-blur p-4 pb-2 justify-between">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5">
          <span className="material-symbols-outlined dark:text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold dark:text-white flex-1 text-center pr-10">약속 제안</h2>
      </div>

      <div className="px-4 space-y-6 mt-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 안내 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500 text-[18px]">info</span>
          <p className="text-xs text-blue-600 dark:text-blue-300 font-medium leading-relaxed">
            글을 올리면 내 공강 시간이 자동으로 매칭에 반영돼요!<br />
            같은 시간이 비는 친구에게 내 글이 더 잘 보입니다.
          </p>
        </div>

        {/* 제목 */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            제목 <span className="text-primary">*</span>
          </h3>
          <input
            name="title"
            value={form.title}
            onChange={(e) => setForm({ title: e.target.value })}
            maxLength={100}
            placeholder={`예: ${placeholder}`}
            className="w-full bg-white dark:bg-[#2d1e14] border-none rounded-2xl h-14 px-5 text-base font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
          <p className="text-[10px] text-gray-400 mt-1 text-right">{form.title.length}/100</p>
        </section>

        {/* 미리보기 */}
        {form.title && (
          <div className="rounded-2xl shadow-lg bg-white dark:bg-[#2d1e14] overflow-hidden border border-black/5">
            {previews.length > 0 ? (
              <div
                className="h-40 bg-center bg-cover"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%), url(${previews[0]})` }}
              />
            ) : (
              <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-white/5 dark:to-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/30 text-[64px]">restaurant</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-primary text-xs font-bold uppercase tracking-widest">미리보기</p>
              </div>
              <p className="text-[#1d0c0f] dark:text-white text-lg font-bold">{form.title}</p>
            </div>
          </div>
        )}

        {/* 사진 업로드 */}
        <section>
          <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
            사진 추가 <span className="text-gray-400 font-medium">(선택)</span>
          </h3>
          <p className="text-[11px] text-gray-400 mb-3">사진이 없으면 기본 배경이 표시됩니다</p>
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, idx) => (
              <div key={idx} className="relative w-20 h-20">
                <img src={src} className="w-full h-full object-cover rounded-xl" alt="" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                >
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </button>
              </div>
            ))}
            {files.length < 5 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
                <span className="text-[10px] text-primary font-medium">추가</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" multiple className="hidden" onChange={handleImageSelect} />
        </section>
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
              <span>약속 제안하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
