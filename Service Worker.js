self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

self.addEventListener("message", e => {
  const { title, time, repeat } = e.data;

  const delay = time - Date.now();
  if (delay < 0) return;

  setTimeout(() => {
    self.registration.showNotification("予定通知", {
      body: title,
      icon: "icon.png"
    });

    // 繰り返し処理
    if (repeat === "daily") {
      self.clients.matchAll().then(clients => {
        clients.forEach(c =>
          c.postMessage({
            title,
            time: time + 86400000,
            repeat
          })
        );
      });
    }

    if (repeat === "weekly") {
      self.clients.matchAll().then(clients => {
        clients.forEach(c =>
          c.postMessage({
            title,
            time: time + 604800000,
            repeat
          })
        );
      });
    }
  }, delay);
});
