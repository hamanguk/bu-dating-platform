import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, user, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState(false);

  // onAuthStateChanged가 user를 설정하면 자동으로 이동
  useEffect(() => {
    if (!loading && user) {
      if (user.profileComplete) {
        navigate('/', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    setError(null);
    setLoginLoading(true);
    try {
      await login();
      // 모바일: 페이지가 redirect됨 (Google 로그인 후 돌아오면 onAuthStateChanged가 처리)
      // 데스크톱: onAuthStateChanged → user 설정 → useEffect에서 자동 navigate
    } catch {
      /* error is set in context */
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full max-w-[430px] mx-auto bg-background-light dark:bg-background-dark px-6 overflow-hidden">
      {/* 배경 데코 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm gap-8">
        {/* 로고 */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full coral-gradient flex items-center justify-center shadow-xl shadow-primary/30">
            <span className="material-symbols-outlined text-white text-4xl">shield_person</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-[#1d0c0f] dark:text-white tracking-tight">
              캠퍼스 데이트
            </h1>
            <p className="text-primary font-semibold mt-1 text-sm">학교 인증 소개팅 플랫폼</p>
          </div>
        </div>

        {/* 설명 */}
        <div className="flex flex-col gap-3 w-full">
          {[
            { icon: 'verified_user', text: '@bu.ac.kr 이메일 인증으로 신뢰할 수 있는 대학생' },
            { icon: 'group', text: '1:1 소개팅부터 과팅까지 다양한 만남' },
            { icon: 'visibility_off', text: '익명/실명 선택으로 편안하게 소통' },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-center gap-3 bg-white dark:bg-white/5 rounded-xl px-4 py-3 shadow-sm">
              <span className="material-symbols-outlined text-primary">{icon}</span>
              <p className="text-sm text-[#1d0c0f] dark:text-white font-medium">{text}</p>
            </div>
          ))}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* 구글 로그인 버튼 */}
        <button
          onClick={handleLogin}
          disabled={loginLoading}
          className="w-full h-14 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center gap-3 shadow-lg font-bold text-[#1d0c0f] dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition-all active:scale-95 disabled:opacity-60"
        >
          {loginLoading ? (
            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {loginLoading ? '로그인 중...' : 'Google로 로그인 (bu.ac.kr)'}
        </button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          백석대학교(@bu.ac.kr) 이메일 계정으로만 로그인 가능합니다.
        </p>
      </div>
    </div>
  );
}
