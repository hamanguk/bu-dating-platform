import { Component, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import MainFeedPage from './pages/MainFeedPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import EditPostPage from './pages/EditPostPage';
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import MatchPage from './pages/MatchPage';
import BenefitsPage from './pages/BenefitsPage';
import AdminPage from './pages/AdminPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', fontSize: 14 }}>
          <h2 style={{ color: 'red' }}>App Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 16px' }}>
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotificationBanner() {
  const { showNotificationBanner, enableNotifications, setShowNotificationBanner } = useAuth();
  if (!showNotificationBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2 text-white text-sm font-medium">
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        <span>새 메시지 알림을 받으시겠어요?</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={enableNotifications}
          className="bg-white text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full"
        >
          허용
        </button>
        <button
          onClick={() => setShowNotificationBanner(false)}
          className="text-white/80 text-xs px-2 py-1.5"
        >
          나중에
        </button>
      </div>
    </div>
  );
}

function PWAInstallBanner() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (!user) return;

    // 이미 PWA로 실행 중이면 표시 안 함
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone;
    if (isStandalone) return;

    // 이미 닫은 적 있으면 7일간 표시 안 함
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // iOS 감지
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Android/Desktop: beforeinstallprompt 이벤트 캐치
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: beforeinstallprompt 없으므로 직접 표시
    if (isIOS) {
      setShow(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [user]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-[100] rounded-2xl bg-white dark:bg-[#2d1a1d] shadow-2xl border border-black/5 dark:border-white/10 p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white text-xl">install_mobile</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 dark:text-white">앱처럼 사용하기</p>
          {isIOS ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              하단의{' '}
              <span className="material-symbols-outlined text-[14px] align-middle">ios_share</span>
              {' '}공유 버튼 → <strong>"홈 화면에 추가"</strong>를 누르면
              푸시 알림도 받을 수 있어요!
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              홈 화면에 추가하면 더 빠르고 푸시 알림도 받을 수 있어요!
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 dark:text-gray-500 flex-shrink-0 -mt-1 -mr-1 p-1"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
      {!isIOS && deferredPrompt && (
        <button
          onClick={handleInstall}
          className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold shadow-md"
        >
          홈 화면에 추가
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <NotificationBanner />
        <PWAInstallBanner />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<MainFeedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/posts" element={<MainFeedPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/posts/:id/edit" element={<EditPostPage />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/benefits" element={<BenefitsPage />} />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:roomId" element={<ChatPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
