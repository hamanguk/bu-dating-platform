import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, uploadProfileImage } from '../services/api';

const MBTI_LIST = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
                   'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
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
    interests: user?.interests?.join(', ') || '',
    isAnonymous: user?.isAnonymous || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.department.trim()) {
      setError('학과는 필수 입력 항목입니다.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        height: form.height ? parseInt(form.height) : undefined,
        interests: form.interests ? form.interests.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      const { data } = await updateProfile(payload);
      setUser(data.user);
      setSuccess('프로필이 저장되었습니다!');
      setTimeout(() => setSuccess(''), 3000);
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
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-8">
      {/* 헤더 */}
      <div className="flex items-center p-4 justify-between">
        <h2 className="text-lg font-bold dark:text-white flex-1 text-center">내 프로필</h2>
        <button onClick={logout} className="text-xs text-gray-400 px-3 py-1 rounded-full border border-gray-200 dark:border-white/10">
          로그아웃
        </button>
      </div>

      {/* 프로필 이미지 */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative">
          <div
            className="w-28 h-28 rounded-full bg-cover bg-center bg-primary/10 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center"
            style={profileImageSrc ? { backgroundImage: `url(${profileImageSrc})` } : {}}
          >
            {!profileImageSrc && (
              <span className="material-symbols-outlined text-primary text-4xl">person</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-gray-800"
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

      {/* 폼 */}
      <div className="px-4 space-y-4">
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
          <label className="text-xs font-bold text-[#a14553] uppercase tracking-wider">
            학과 <span className="text-primary">*</span>
          </label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="예: 컴퓨터공학과"
            className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#a14553] uppercase tracking-wider">학번 (선택)</label>
          <input
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            placeholder="예: 20231234"
            className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#a14553] uppercase tracking-wider">MBTI</label>
            <select
              name="mbti"
              value={form.mbti}
              onChange={handleChange}
              className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
            >
              <option value="">선택</option>
              {MBTI_LIST.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#a14553] uppercase tracking-wider">성별</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
            >
              <option value="">선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#a14553] uppercase tracking-wider">키 (cm)</label>
          <input
            name="height"
            type="number"
            value={form.height}
            onChange={handleChange}
            placeholder="예: 175"
            min="140" max="220"
            className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#a14553] uppercase tracking-wider">자기소개</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            maxLength={300}
            placeholder="나를 소개해주세요 (최대 300자)"
            className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm min-h-[100px] resize-none dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#a14553] uppercase tracking-wider">관심사 (쉼표로 구분)</label>
          <input
            name="interests"
            value={form.interests}
            onChange={handleChange}
            placeholder="예: 영화, 커피, 여행"
            className="w-full bg-white dark:bg-[#2d161a] border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
          />
        </div>

        {/* 익명 모드 토글 */}
        <div className="flex items-center justify-between bg-white dark:bg-[#2d161a] rounded-xl p-4 shadow-sm border border-[#eacdd1] dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">visibility_off</span>
              <p className="text-sm font-bold dark:text-white">익명 모드</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">다른 사용자에게 이름/사진을 숨깁니다.</p>
          </div>
          <label className="relative flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors"
            style={{ backgroundColor: form.isAnonymous ? '#ff6b81' : '#eacdd1' }}>
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
          className="w-full h-14 rounded-full coral-gradient flex items-center justify-center gap-2 text-white font-bold text-base shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-60"
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
