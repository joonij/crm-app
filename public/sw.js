self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const options = {
      body: data.body || '오늘의 영업 마감을 작성해주세요!',
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/daily-closing' }
    };
    event.waitUntil(self.registration.showNotification(data.title || '알림', options));
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
  });