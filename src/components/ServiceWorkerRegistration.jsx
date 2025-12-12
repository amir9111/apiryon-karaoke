import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const manifest = {
      name: "Apiryon - מערכת קריוקי",
      short_name: "Apiryon",
      description: "מערכת ניהול קריוקי מתקדמת עם מסך קהל חי",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#020617",
      theme_color: "#00caff",
      orientation: "portrait-primary",
      dir: "rtl",
      lang: "he",
      categories: ["entertainment", "music"],
      icons: [
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3CradialGradient id='bg'%3E%3Cstop offset='0%25' style='stop-color:%230a1929'/%3E%3Cstop offset='100%25' style='stop-color:%23020617'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='512' height='512'/%3E%3Ccircle cx='256' cy='256' r='200' fill='none' stroke='%2300caff' stroke-width='16'/%3E%3Ctext x='256' y='280' font-family='Arial' font-size='80' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any maskable"
        },
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3CradialGradient id='bg'%3E%3Cstop offset='0%25' style='stop-color:%230a1929'/%3E%3Cstop offset='100%25' style='stop-color:%23020617'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='192' height='192'/%3E%3Ccircle cx='96' cy='96' r='75' fill='none' stroke='%2300caff' stroke-width='6'/%3E%3Ctext x='96' y='110' font-family='Arial' font-size='30' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any"
        }
      ]
    };

    const swCode = `
      const CACHE_NAME = 'apiryon-v4';
      const MANIFEST = ${JSON.stringify(manifest)};
      
      self.addEventListener('install', (event) => {
        event.waitUntil(self.skipWaiting());
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
        const url = new URL(event.request.url);
        
        // Intercept manifest.json requests
        if (url.pathname === '/manifest.json') {
          event.respondWith(
            new Response(JSON.stringify(MANIFEST), {
              status: 200,
              headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'no-cache'
              }
            })
          );
          return;
        }
        
        // Regular fetch handling
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
      .catch(() => {});
  }, []);

  return null;
}