import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// --- 인앱 브라우저 감지 (앱별 세분화) ---
const getInAppType = () => {
  const ua = navigator.userAgent || navigator.vendor || '';
  const isIOS = /iPad|iPhone|iPod/i.test(ua) && !window.MSStream;
  const isAndroid = /android/i.test(ua);

  if (/KAKAOTALK/i.test(ua)) return { app: 'kakaotalk', isIOS, isAndroid };
  if (/Instagram/i.test(ua) || /FBAN|FBAV/i.test(ua)) return { app: 'instagram', isIOS, isAndroid };
  if (/everytime/i.test(ua)) return { app: 'everytime', isIOS, isAndroid };
  if (/NAVER/i.test(ua)) return { app: 'naver', isIOS, isAndroid };
  if (/Line\//i.test(ua)) return { app: 'line', isIOS, isAndroid };
  if (/DaumApps/i.test(ua)) return { app: 'daum', isIOS, isAndroid };
  if (/SamsungBrowser\/.*CrossApp/i.test(ua)) return { app: 'samsung', isIOS, isAndroid };
  if (isAndroid && /\bwv\b/i.test(ua)) return { app: 'webview', isIOS, isAndroid };

  return null; // 일반 브라우저
};

// Android intent:// 크롬 강제 실행
const openInChrome = () => {
  const url = window.location.href;
  const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
  window.location.href = intentUrl;
};

// 카카오톡 iOS: 로그인 비교적 가능 → 소프트 팁만
// 인스타/에타/네이버 등: 완전 차단 → 하드 모달
const isHardBlock = (inApp) => {
  if (!inApp) return false;
  // 카카오톡 iOS는 소프트(로그인 허용 + 팁)
  if (inApp.app === 'kakaotalk' && inApp.isIOS) return false;
  return true;
};

export default function LoginPage() {
  const { login, user, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState(false);
  const [showInAppModal, setShowInAppModal] = useState(false);
  const [inAppInfo, setInAppInfo] = useState(null);

  useEffect(() => {
    const info = getInAppType();
    setInAppInfo(info);

    // 안드로이드 카카오톡: 자동으로 크롬 탈출 시도
    if (info?.app === 'kakaotalk' && info.isAndroid) {
      openInChrome();
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (user.profileComplete && user.nickname) {
        navigate('/', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    // 로그인 버튼 클릭 시 인앱 브라우저 체크
    if (inAppInfo && isHardBlock(inAppInfo)) {
      setShowInAppModal(true);
      return;
    }

    setError(null);
    setLoginLoading(true);
    try {
      const loggedUser = await login();
      if (loggedUser.profileComplete && loggedUser.nickname) {
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

  const appLabel = {
    instagram: '인스타그램',
    everytime: '에브리타임',
    naver: '네이버',
    line: '라인',
    daum: '다음',
    kakaotalk: '카카오톡',
    samsung: '삼성 브라우저',
    webview: '앱 내 브라우저',
  };

  // 카카오톡 iOS 소프트 팁 여부
  const showSoftTip = inAppInfo?.app === 'kakaotalk' && inAppInfo.isIOS;

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
          <div className="w-24 h-24 rounded-3xl shadow-xl shadow-primary/30 overflow-hidden">
            <img src="/logo.svg" alt="혼밥친구" className="w-full h-full" />
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

        {/* 카카오톡 iOS 소프트 팁 */}
        {showSoftTip && (
          <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-yellow-500 text-[18px] mt-0.5">info</span>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs leading-relaxed">
              카카오톡에서 접속하셨네요! 로그인이 안 되면 우측 하단 <strong>...</strong> 버튼 → <strong>"Safari로 열기"</strong>를 눌러주세요.
            </p>
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

      {/* 인앱 브라우저 안내 모달 (로그인 버튼 클릭 시 표시) */}
      {showInAppModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setShowInAppModal(false)}>
          <div
            className="w-full max-w-[480px] mx-auto bg-white dark:bg-[#1A0F05] rounded-t-3xl p-6 pb-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">open_in_browser</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold dark:text-white">외부 브라우저로 열어주세요</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {appLabel[inAppInfo?.app] || '앱 내 브라우저'}에서는 구글 로그인이 차단됩니다
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex items-start gap-3 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3">
                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-sm font-bold dark:text-white">우측 상단 메뉴 (⋯ 또는 ⋮) 터치</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">앱 상단에 있는 점 3개 버튼을 눌러주세요</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3">
                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-sm font-bold dark:text-white">
                    {inAppInfo?.isIOS ? '"Safari로 열기"' : '"Chrome으로 열기"'} 선택
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">외부 브라우저에서 정상적으로 로그인됩니다</p>
                </div>
              </div>
            </div>

            {/* Android: 자동 크롬 열기 버튼 */}
            {inAppInfo?.isAndroid && (
              <button
                onClick={openInChrome}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.97] transition-transform mb-3"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                Chrome으로 바로 열기
              </button>
            )}

            {/* URL 복사 */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).then(() => {
                  alert('주소가 복사되었습니다! 브라우저에 붙여넣기 해주세요.');
                }).catch(() => {
                  prompt('아래 주소를 복사해주세요:', window.location.href);
                });
              }}
              className="w-full h-12 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              주소 복사하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
