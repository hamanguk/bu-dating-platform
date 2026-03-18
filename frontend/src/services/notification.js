/**
 * 브라우저 Notification API + FCM 토큰 관리
 */
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';

let messaging = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const getFirebaseApp = () => {
  if (getApps().length) return getApps()[0];
  return initializeApp(firebaseConfig);
};

// 브라우저 알림 권한 요청
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
};

// 브라우저 Notification API로 알림 표시
export const showBrowserNotification = (title, body, onClick) => {
  if (Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') {
    // 탭이 보이는 상태면 인앱 알림만 (소리 등)
    // 채팅 페이지에 있으면 알림 안 띄움
    if (window.location.pathname.startsWith('/chat/')) return;
  }

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'campus-date-chat',
    renotify: true,
  });

  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }
};

// FCM 초기화 및 토큰 발급
export const initFCM = async () => {
  try {
    if (!('serviceWorker' in navigator)) return null;

    const app = getFirebaseApp();
    messaging = getMessaging(app);

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') return null;

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    // Service Worker에 Firebase config 전달
    if (registration.active) {
      registration.active.postMessage({
        type: 'FIREBASE_CONFIG',
        config: firebaseConfig,
      });
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('VITE_FIREBASE_VAPID_KEY not set — FCM disabled');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (err) {
    console.error('FCM init error:', err);
    return null;
  }
};

// FCM 포그라운드 메시지 리스너
export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};
