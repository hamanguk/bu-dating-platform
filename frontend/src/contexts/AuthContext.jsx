import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithGoogle, getGoogleRedirectResult, firebaseSignOut } from '../services/firebase';
import { loginWithGoogle, getMe, pingServer } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initAuth = useCallback(async () => {
    try {
      // 1. 모바일 Google 리다이렉트 결과 먼저 확인
      const redirectResult = await getGoogleRedirectResult();
      if (redirectResult) {
        const { data } = await loginWithGoogle(redirectResult.idToken);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        connectSocket(data.token);
        return;
      }

      // 2. 기존 로그인 세션 확인
      const token = localStorage.getItem('token');
      if (!token) return;
      const { data } = await getMe();
      setUser(data.user);
      connectSocket(token);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || '';
      if (msg) setError(msg);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    pingServer(); // Render 슬립 해제
    initAuth();
  }, [initAuth]);

  const login = async () => {
    setError(null);
    try {
      // 모바일은 signInWithRedirect → null 반환 (페이지 이동됨)
      const result = await signInWithGoogle();
      if (!result) return null;

      const { data } = await loginWithGoogle(result.idToken);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      connectSocket(data.token);
      return data.user;
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
