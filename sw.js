self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// メッセージで即時通知表示（必要なら）
self.addEventListener('message', e => {
  const { title, options } = e.data || {};
  if (title) {
    self.registration.showNotification(title, options || {});
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients && clients.length) {
        return clients[0].focus();
      }
      return self.clients.openWindow('./index.html');
    })
  );
});
