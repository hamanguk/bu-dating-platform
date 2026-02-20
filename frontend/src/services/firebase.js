import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  hd: import.meta.env.VITE_ALLOWED_DOMAIN || 'bu.ac.kr',
  prompt: 'select_account',
});

const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

export const signInWithGoogle = async () => {
  if (isMobile()) {
    await signInWithRedirect(auth, googleProvider);
    return null; // 페이지가 리다이렉트되므로 여기서 끝
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user; // onAuthStateChanged가 idToken 처리
};

export const firebaseSignOut = () => signOut(auth);
