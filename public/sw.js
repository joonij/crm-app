// public/sw.js
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        url: '/daily-closing' 
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // ⭐️ 알림 클릭 시 일일 마감 페이지로 즉시 이동
  event.waitUntil(self.clients.openWindow('/daily-closing'));
});