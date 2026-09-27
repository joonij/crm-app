// public/sw.js
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      vibrate: [200, 100, 200]
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // ⭐️ 스마트폰이 헷갈리지 않도록 도메인을 포함한 '절대 경로'로 지정합니다.
  const targetUrl = 'https://insucarelink.vercel.app/daily-closing';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // 1. 이미 앱(창)이 백그라운드에 열려 있다면, 그 창을 마감 페이지로 갱신하고 화면 앞으로 가져옴
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // 2. 열려 있는 창이 하나도 없다면 새로 마감 페이지를 띄움
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});