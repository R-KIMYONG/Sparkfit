const CACHE_NAME = 'sparkfit-cache-v1';
const urlsToCache = [
  self.location.origin, // 현재 도메인의 루트 (더 안전한 캐싱)
  '/index.html',
  '/icons/apple-touch-icon-57x57.png',
  '/icons/apple-touch-icon-60x60.png'
];

// 활성화 (Activate) 이벤트 - 기존 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
