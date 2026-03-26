import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-5xl animate-pulse">
            shield_person
          </span>
          <p className="text-sm text-primary font-semibold">혼밥친구</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  // 닉네임 또는 프로필 미완성 → 프로필 페이지 강제 이동 (프로필 페이지 자체는 허용)
  if ((!user.nickname || !user.profileComplete) && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
