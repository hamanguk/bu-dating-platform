import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// 인앱 브라우저 감지
const detectInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || '';
  const rules = [
    /FBAN|FBAV/i,           // Facebook / Instagram
    /Instagram/i,
    /KAKAOTALK/i,
    /everytime/i,
    /NAVER/i,
    /Line\//i,
    /DaumApps/i,
    /SamsungBrowser\/.*CrossApp/i,
    /\bwv\b/i,              // Android WebView
  ];
  return rules.some((r) => r.test(ua));
};

// Android intent:// 크롬 강제 실행
const openInExternalBrowser = () => {
  const currentUrl = window.location.href;
  const ua = navigator.userAgent || '';

  // Android: intent 스키마로 크롬 실행 시도
  if (/android/i.test(ua)) {
    const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
    return;
  }

  // iOS: Safari로 열기 (복사 안내)
  // iOS 인앱 브라우저에서는 자동 탈출이 어려워서 안내만 제공
};

export default function LoginPage() {
  const { login, user, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState(false);
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    setIsInApp(detectInAppBrowser());
  }, []);

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
      const loggedUser = await login();
      if (loggedUser.profileComplete) {
        navigate('/', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    } catch {
      /* error는 context에서 setError로 처리됨 */
    } finally {
      setLoginLoading(false);
    }
  };

  // 인앱 브라우저 감지 시 탈출 안내
  if (isInApp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-[430px] mx-auto bg-background-light dark:bg-background-dark px-6">
        <div className="flex flex-col items-center w-full max-w-sm gap-8">
          {/* 아이콘 */}
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl">open_in_browser</span>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-extrabold dark:text-white">외부 브라우저로 열어주세요</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
              인스타그램, 에브리타임 등 앱 내 브라우저에서는<br />
              구글 로그인이 차단됩니다.
            </p>
          </div>

          {/* 안내 카드 */}
          <div className="w-full space-y-3">
            <div className="bg-white dark:bg-white/5 rounded-2xl px-5 py-4 shadow-sm border border-gray-100 dark:border-white/10">
              <div className="flex items-start gap-3">
                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-sm font-bold dark:text-white">우측 상단 메뉴 (⋯ 또는 ⋮) 터치</p>
                  <p className="text-xs text-gray-400 mt-0.5">앱 상단에 있는 점 3개 버튼을 눌러주세요</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-2xl px-5 py-4 shadow-sm border border-gray-100 dark:border-white/10">
              <div className="flex items-start gap-3">
                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-sm font-bold dark:text-white">"기본 브라우저로 열기" 선택</p>
                  <p className="text-xs text-gray-400 mt-0.5">Safari 또는 Chrome에서 열기를 눌러주세요</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-2xl px-5 py-4 shadow-sm border border-gray-100 dark:border-white/10">
              <div className="flex items-start gap-3">
                <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-sm font-bold dark:text-white">구글 로그인 진행</p>
                  <p className="text-xs text-gray-400 mt-0.5">외부 브라우저에서 정상적으로 로그인됩니다</p>
                </div>
              </div>
            </div>
          </div>

          {/* Android 자동 열기 버튼 */}
          <button
            onClick={openInExternalBrowser}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.97] transition-transform"
          >
            <span className="material-symbols-outlined">open_in_new</span>
            외부 브라우저로 열기
          </button>

          {/* URL 복사 대안 */}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).then(() => {
                alert('주소가 복사되었습니다! 브라우저에 붙여넣기 해주세요.');
              }).catch(() => {
                prompt('아래 주소를 복사해주세요:', window.location.href);
              });
            }}
            className="text-sm text-gray-400 underline underline-offset-4"
          >
            주소 복사하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full max-w-[430px] mx-auto bg-background-light dark:bg-background-dark px-6 overflow-hidden">
      {/* 배경 데코 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm gap-10">
        {/* 로고 */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/30">
            <span className="material-symbols-outlined text-white text-4xl">restaurant</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-[#1d0c0f] dark:text-white tracking-tight">
              혼밥친구
            </h1>
            <p className="text-primary font-semibold mt-1 text-sm">백석대 공강 시간 밥 매칭 플랫폼</p>
          </div>
        </div>

        {/* 설명 */}
        <div className="flex flex-col gap-3 w-full">
          {[
            { icon: 'schedule', text: '공강 시간에 맞는 밥 친구를 자동 매칭' },
            { icon: 'restaurant', text: '한식부터 카페까지, 취향이 맞는 친구' },
            { icon: 'verified_user', text: '학교 이메일 인증으로 안전한 만남' },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-center gap-4 bg-white dark:bg-white/5 rounded-2xl px-5 py-4 shadow-sm">
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
          className="w-full h-16 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center gap-3 shadow-lg font-bold text-[#1d0c0f] dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition-all active:scale-95 disabled:opacity-60"
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
