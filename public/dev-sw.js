self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed in Development Mode');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
