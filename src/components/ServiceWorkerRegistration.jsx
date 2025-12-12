import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    
    let swRegistration = null;
    
    const swCode = `
      const CACHE_NAME = 'apiryon-v2';
      const urlsToCache = [
        '/',
      ];
      
      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
        );
      });
      
      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys()
            .then((cacheNames) => {
              return Promise.all(
                cacheNames.map((cacheName) => {
                  if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                  }
                })
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
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
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

    navigator.serviceWorker.register(swUrl, { scope: '/' })
      .then((registration) => {
        swRegistration = registration;
      })
      .catch(() => {
        // Silent fail
      });
    
    return () => {
      if (swRegistration) {
        swRegistration.unregister();
      }
    };
  }, []);

  return null;
}