/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
// 브라우저가 백그라운드/닫혀 있을 때 푸시 알림 수신

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// 메인 스레드에서 Firebase config를 postMessage로 전달받음
let firebaseInitialized = false;

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG' && !firebaseInitialized) {
    firebase.initializeApp(event.data.config);
    firebaseInitialized = true;

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      const roomId = payload.data?.roomId;

      self.registration.showNotification(title || '캠퍼스 데이트', {
        body: body || '새로운 메시지가 도착했습니다.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `chat-${roomId || 'general'}`,
        renotify: true,
        data: { roomId },
      });
    });
  }
});

// 알림 클릭 시 해당 채팅방으로 이동
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const roomId = event.notification.data?.roomId;
  const url = roomId ? `/chat/${roomId}` : '/chat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
