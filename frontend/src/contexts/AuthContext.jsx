import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, firebaseSignOut } from '../services/firebase';
import { loginWithGoogle, getMe, pingServer } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loginInProgress = useRef(false); // 데스크톱 팝업 로그인 중 플래그

  useEffect(() => {
    pingServer(); // Render 슬립 해제 (fire and forget)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 팝업 로그인은 login()에서 직접 처리 중 → 여기서 건너뜀
      if (loginInProgress.current) {
        setLoading(false);
        return;
      }

      try {
        if (firebaseUser) {
          const token = localStorage.getItem('token');
          if (token) {
            // 기존 로그인 세션 (앱 재실행 시)
            const { data } = await getMe();
            setUser(data.user);
            connectSocket(token);
          }
          // token 없이 firebaseUser만 있는 경우는 무시 (팝업 로그인은 login()이 처리)
        } else {
          // 로그아웃 상태
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || '';
        if (msg) setError(msg);
        localStorage.removeItem('token');
        setUser(null);
        // 도메인 오류(403)일 때만 Firebase도 로그아웃 (네트워크 오류는 로그아웃 X)
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
      const idToken = await firebaseUser.getIdToken();
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
