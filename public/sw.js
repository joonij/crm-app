// public/sw.js
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico', // 기본 아이콘 활용
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/dashboard'));
});