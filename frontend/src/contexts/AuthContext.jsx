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
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await getMe();
      setUser(data.user);
      connectSocket(token);
    } catch {
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

  // 모바일 Google 리다이렉트 로그인 결과 처리
  useEffect(() => {
    setLoading(true);
    getGoogleRedirectResult()
      .then(async (result) => {
        if (!result) return;
        const { data } = await loginWithGoogle(result.idToken);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        connectSocket(data.token);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || '로그인 실패';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async () => {
    setError(null);
    try {
      // 1. Firebase Google 로그인 → ID 토큰 획득
      const { idToken } = await signInWithGoogle();

      // 2. 서버에 ID 토큰 전송 → 자체 JWT 발급
      const { data } = await loginWithGoogle(idToken);

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
