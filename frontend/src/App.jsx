import { Component } from 'react';
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
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2 text-white text-sm font-medium">
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        <span>새 메시지 알림을 받으시겠어요?</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={enableNotifications}
          className="bg-white text-rose-500 text-xs font-bold px-3 py-1.5 rounded-full"
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

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <NotificationBanner />
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
