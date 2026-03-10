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

// localStorage에서 캐시된 유저 정보 읽기
const getCachedUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem('token');
  const cachedUser = getCachedUser();

  // 토큰 + 캐시가 있으면 즉시 로그인 상태로 시작 (깜빡임 방지)
  const [user, setUserState] = useState(token && cachedUser ? cachedUser : null);
  const [loading, setLoading] = useState(!cachedUser || !token);
  const [error, setError] = useState(null);
  const loginInProgress = useRef(false);
  const initialized = useRef(false);

  // user 변경 시 localStorage에 동기화
  const setUser = (newUser) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    pingServer(); // Render 슬립 해제

    // 캐시된 유저가 있으면 백그라운드로 최신 정보 검증
    if (token && cachedUser) {
      connectSocket(token);
      getMe()
        .then(({ data }) => setUser(data.user))
        .catch((err) => {
          // 401이면 세션 만료 → 로그아웃
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUserState(null);
          }
        })
        .finally(() => setLoading(false));
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 초기화 이후 + 캐시 복원이 있었으면 Firebase 이벤트 무시
      if (initialized.current) return;
      initialized.current = true;

      if (loginInProgress.current) {
        setLoading(false);
        return;
      }

      // 캐시 복원이 이미 성공했으면 스킵
      if (token && cachedUser) {
        return;
      }

      try {
        if (firebaseUser) {
          const existingToken = localStorage.getItem('token');

          if (existingToken) {
            console.log('✅ 기존 세션 복원:', firebaseUser.email);
            const { data } = await withRetry(() => getMe());
            setUser(data.user);
            connectSocket(existingToken);
          } else {
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
    setUserState(null);
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
