// public/sw.js

// 1. 새 버전이 발견되면 대기하지 않고 즉시 설치 (강제 갱신)
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

// 2. 설치 즉시 제어권 획득하여 열려있는 모든 화면에 새 규칙 적용
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        url: '/daily-closing' // 이동할 목적지 주소 지정
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // 푸시 데이터에 담긴 url(/daily-closing)로 이동, 없으면 기본값 적용
  const targetUrl = event.notification.data?.url || '/daily-closing';
  event.waitUntil(self.clients.openWindow(targetUrl));
});