import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
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
  const loginInProgress = useRef(false);   // 데스크톱 팝업 진행 중
  const redirectProcessed = useRef(false); // 리다이렉트 결과 처리 완료 여부

  useEffect(() => {
    pingServer(); // Render 슬립 해제

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔔 onAuthStateChanged:', firebaseUser?.email ?? 'null');

      // 데스크톱 팝업 또는 getRedirectResult로 이미 처리 중이면 건너뜀
      if (loginInProgress.current || redirectProcessed.current) {
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
            // 모바일 리다이렉트 복귀 백업 처리
            // (processRedirectResult가 먼저 처리하면 redirectProcessed=true로 여기 안 옴)
            console.log('🔄 onAuthStateChanged 백업 처리:', firebaseUser.email);
            redirectProcessed.current = true;
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

  // LoginPage의 useEffect에서 호출 — getRedirectResult 처리
  const processRedirectResult = async () => {
    try {
      console.log('🔍 getRedirectResult 확인 중...');
      const result = await getRedirectResult(auth);

      if (!result) {
        console.log('ℹ️ redirect result 없음 (데스크톱 또는 직접 접근)');
        return null;
      }

      console.log('✅ RedirectResult 성공:', result.user.email);
      redirectProcessed.current = true; // onAuthStateChanged 백업 처리 방지

      const idToken = await result.user.getIdToken();
      const { data } = await withRetry(() => loginWithGoogle(idToken));
      localStorage.setItem('token', data.token);
      setUser(data.user);
      connectSocket(data.token);
      return data.user;
    } catch (err) {
      console.error('❌ RedirectResult 에러:', err.code, err.message);
      throw err;
    }
  };

  const login = async () => {
    setError(null);
    try {
      loginInProgress.current = true;

      const firebaseUser = await signInWithGoogle();

      if (!firebaseUser) {
        // 모바일: signInWithRedirect → 페이지 이동 → processRedirectResult가 복귀 후 처리
        loginInProgress.current = false;
        return null;
      }

      // 데스크톱: 팝업 완료 → 직접 백엔드 호출
      console.log('✅ Popup 로그인 성공:', firebaseUser.email);
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
      value={{ user, setUser, loading, error, setError, login, logout, processRedirectResult }}
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
