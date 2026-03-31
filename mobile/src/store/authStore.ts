// src/store/authStore.ts
import { create } from 'zustand';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import { isValidSchoolEmail } from '../utils/domainCheck';
import { getAuthError } from '../utils/errorMessages';
import { COLLECTIONS, type User } from '../types/models';

interface AuthState {
  currentUser:  FirebaseUser | null;
  userProfile:  User | null;
  isLoading:    boolean;
  error:        string | null;

  handleGoogleAuthSuccess: (idToken: string) => Promise<void>;
  logout:          () => Promise<void>;
  clearError:      () => void;
  _setUserProfile: (profile: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser:  null,
  userProfile:  null,
  isLoading:    true,
  error:        null,

  _setUserProfile: (profile) => set({ userProfile: profile }),
  clearError:      ()        => set({ error: null }),

  handleGoogleAuthSuccess: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      // Firebase v10+는 ID token(JWT)이 필요함 — access_token(opaque)은 거부될 수 있음
      const credential           = GoogleAuthProvider.credential(idToken, null);
      const { user: fbUser }     = await signInWithCredential(auth, credential);

      if (!isValidSchoolEmail(fbUser.email)) {
        await signOut(auth);
        const err = getAuthError('domain-not-allowed');
        set({ isLoading: false, error: err.userMessage });
        return;
      }

      const userRef = doc(db, COLLECTIONS.USERS, fbUser.uid);
      const snap    = await getDoc(userRef);
      let   profile: User;

      if (!snap.exists()) {
        const newDoc = {
          uid:               fbUser.uid,
          email:             fbUser.email!,
          nickname:          '',
          age:               0,
          gender:            null,
          bio:               '',
          profileImages:     [],
          isProfileComplete: false,
          createdAt:         serverTimestamp(),
          lastActive:        serverTimestamp(),
        };
        await setDoc(userRef, newDoc);
        profile = { ...newDoc, createdAt: null, lastActive: null } as User;
      } else {
        await updateDoc(userRef, { lastActive: serverTimestamp() });
        profile = snap.data() as User;
      }

      set({ currentUser: fbUser, userProfile: profile, isLoading: false });
    } catch (e: any) {
      const err = getAuthError(e?.code ?? 'unknown');
      set({ isLoading: false, error: err.userMessage });
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ currentUser: null, userProfile: null, error: null });
    } catch (e) {
      console.error('[AuthStore] logout error:', e);
    }
  },
}));

// ── Auth 리스너 (App.tsx 에서 한 번만 초기화) ────────────────────────────
let unsubscribe: (() => void) | null = null;

export const initAuthListener = (): (() => void) => {
  if (unsubscribe) return unsubscribe;

  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (!isValidSchoolEmail(user.email)) {
        await signOut(auth);
        useAuthStore.setState({ isLoading: false });
        return;
      }
      try {
        const snap = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
        if (snap.exists()) {
          useAuthStore.setState({ userProfile: snap.data() as User });
        }
        useAuthStore.setState({ currentUser: user, isLoading: false });
      } catch {
        useAuthStore.setState({ currentUser: user, isLoading: false });
      }
    } else {
      useAuthStore.setState({ currentUser: null, userProfile: null, isLoading: false });
    }
  });

  return unsubscribe;
};
