import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const swCode = `
        const CACHE_NAME = 'apiryon-v1';
        
        self.addEventListener('install', (event) => {
          self.skipWaiting();
        });
        
        self.addEventListener('activate', (event) => {
          event.waitUntil(
            caches.keys().then((cacheNames) => {
              return Promise.all(
                cacheNames.map((cacheName) => {
                  if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                  }
                })
              );
            }).then(() => self.clients.claim())
          );
        });
        
        self.addEventListener('fetch', (event) => {
          if (event.request.method !== 'GET') return;
          
          event.respondWith(
            fetch(event.request)
              .then((response) => {
                if (response.status === 200) {
                  const responseClone = response.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                  });
                }
                return response;
              })
              .catch(() => {
                return caches.match(event.request);
              })
          );
        });
      `;

      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);

      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('✅ Service Worker רשום בהצלחה');
        })
        .catch((error) => {
          console.log('❌ שגיאה ברישום Service Worker:', error);
        });
    }
  }, []);

  return null;
}