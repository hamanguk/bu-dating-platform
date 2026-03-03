import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, firebaseSignOut } from '../services/firebase';
import { loginWithGoogle, getMe, pingServer } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

// 네트워크 에러 시 최대 2회 재시도 (3초 간격), HTTP 에러는 재시도 안 함
const withRetry = async (fn, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries || err.response) throw err;
      console.warn(`⏳ 재시도 ${i + 1}/${retries}...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loginInProgress = useRef(false);

  useEffect(() => {
    pingServer(); // Render 슬립 해제

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔔 onAuthStateChanged:', firebaseUser?.email ?? 'null');

      if (loginInProgress.current) {
        setLoading(false);
        return;
      }

      try {
        if (firebaseUser) {
          const token = localStorage.getItem('token');

          if (token) {
            // 기존 로그인 세션 (앱 재실행 시)
            console.log('✅ 기존 세션 복원:', firebaseUser.email);
            const { data } = await withRetry(() => getMe());
            setUser(data.user);
            connectSocket(token);
          } else {
            // Firebase 로그인은 됐지만 백엔드 토큰이 없는 경우
            console.log('🔄 백엔드 토큰 발급:', firebaseUser.email);
            const idToken = await firebaseUser.getIdToken();
            const { data } = await withRetry(() => loginWithGoogle(idToken));
            localStorage.setItem('token', data.token);
            setUser(data.user);
            connectSocket(data.token);
          }
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('❌ onAuthStateChanged 에러:', err.code, err.message);
        const msg = err.response?.data?.message || err.message || '';
        if (msg) setError(msg);
        localStorage.removeItem('token');
        setUser(null);
        if (err.response?.status === 403) {
          await firebaseSignOut().catch(() => {});
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setError(null);
    try {
      loginInProgress.current = true;

      const firebaseUser = await signInWithGoogle();
      console.log('✅ 로그인 성공:', firebaseUser.email);
      const idToken = await firebaseUser.getIdToken();
      const { data } = await withRetry(() => loginWithGoogle(idToken));
      localStorage.setItem('token', data.token);
      setUser(data.user);
      connectSocket(data.token);
      return data.user;
    } catch (err) {
      console.error('❌ 로그인 에러:', err.code, err.message);
      const msg =
        err.response?.data?.message ||
        err.message ||
        '로그인에 실패했습니다. bu.ac.kr 이메일을 사용해주세요.';
      setError(msg);
      throw new Error(msg);
    } finally {
      loginInProgress.current = false;
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
    <AuthContext.Provider
      value={{ user, setUser, loading, error, setError, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
