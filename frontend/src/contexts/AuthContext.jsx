import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, firebaseSignOut } from '../services/firebase';
import { loginWithGoogle, getMe, pingServer } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    pingServer(); // Render 슬립 해제

    // Firebase 인증 상태 감지 - 팝업/리다이렉트 모두 자동 처리
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // 기존 JWT가 유효하면 그대로 사용
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const { data } = await getMe();
              setUser(data.user);
              connectSocket(token);
              return;
            } catch {
              // JWT 만료 → Firebase 토큰으로 재발급
              localStorage.removeItem('token');
            }
          }

          // Firebase 토큰으로 자체 JWT 발급
          const idToken = await firebaseUser.getIdToken();
          const { data } = await loginWithGoogle(idToken);
          localStorage.setItem('token', data.token);
          setUser(data.user);
          connectSocket(data.token);
        } else {
          // Firebase 로그아웃 상태
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || '';
        if (msg) setError(msg);
        await firebaseSignOut().catch(() => {});
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setError(null);
    try {
      // 모바일: signInWithRedirect → 페이지 이동 → onAuthStateChanged가 처리
      // 데스크톱: signInWithPopup → onAuthStateChanged가 처리
      return await signInWithGoogle();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        '로그인에 실패했습니다. bu.ac.kr 이메일을 사용해주세요.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    await firebaseSignOut().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, setError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
