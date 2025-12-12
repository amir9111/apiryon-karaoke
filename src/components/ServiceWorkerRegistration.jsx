import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const swCode = `
      const CACHE_NAME = 'apiryon-v5';
      
      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(() => self.skipWaiting())
        );
      });
      
      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys()
            .then((cacheNames) => {
              return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
              );
            })
            .then(() => self.clients.claim())
        );
      });
      
      self.addEventListener('fetch', (event) => {
        if (event.request.method !== 'GET') return;
        
        event.respondWith(
          fetch(event.request)
            .then((response) => {
              if (response?.status === 200 && !response.url.includes('blob:')) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, clone);
                });
              }
              return response;
            })
            .catch(() => caches.match(event.request))
        );
      });
    `;

    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);

    navigator.serviceWorker.register(swUrl)
      .then(reg => {
        console.log('✅ Service Worker registered successfully!');
        console.log('📍 Scope:', reg.scope);
        reg.update();
      })
      .catch(err => {
        console.error('❌ Service Worker registration failed:', err);
      });
  }, []);

  return null;
}