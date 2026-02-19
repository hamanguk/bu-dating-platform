import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import MainFeedPage from './pages/MainFeedPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
  );
}
