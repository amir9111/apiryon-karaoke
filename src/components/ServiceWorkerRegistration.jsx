import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const manifest = {
      name: "Apiryon - מערכת קריוקי",
      short_name: "Apiryon",
      description: "מערכת ניהול קריוקי מתקדמת",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#020617",
      theme_color: "#00caff",
      orientation: "portrait",
      icons: [
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect fill='%23020617' width='512' height='512'/%3E%3Ccircle cx='256' cy='256' r='200' fill='none' stroke='%2300caff' stroke-width='16'/%3E%3Ctext x='256' y='280' font-family='Arial' font-size='70' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect fill='%23020617' width='192' height='192'/%3E%3Ccircle cx='96' cy='96' r='75' fill='none' stroke='%2300caff' stroke-width='6'/%3E%3Ctext x='96' y='105' font-family='Arial' font-size='26' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect fill='%23020617' width='512' height='512'/%3E%3Ccircle cx='256' cy='256' r='200' fill='none' stroke='%2300caff' stroke-width='16'/%3E%3Ctext x='256' y='280' font-family='Arial' font-size='70' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "maskable"
        }
      ]
    };

    const swCode = `
      const CACHE_NAME = 'apiryon-v7';
      const MANIFEST = ${JSON.stringify(manifest)};
      
      self.addEventListener('install', (event) => {
        console.log('🔧 [SW] Installing...');
        self.skipWaiting();
      });
      
      self.addEventListener('activate', (event) => {
        console.log('✅ [SW] Activated');
        event.waitUntil(
          Promise.all([
            caches.keys().then((cacheNames) => {
              return Promise.all(
                cacheNames
                  .filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
              );
            }),
            self.clients.claim()
          ])
        );
      });
      
      self.addEventListener('fetch', (event) => {
        const url = new URL(event.request.url);
        
        // Serve manifest.json
        if (url.pathname === '/manifest.json' || url.pathname.endsWith('manifest.json')) {
          console.log('📄 [SW] Serving manifest.json from SW');
          event.respondWith(
            new Response(JSON.stringify(MANIFEST), {
              status: 200,
              headers: {
                'Content-Type': 'application/manifest+json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
              }
            })
          );
          return;
        }
        
        // Only handle GET requests
        if (event.request.method !== 'GET') {
          return;
        }
        
        // Network first, fallback to cache
        event.respondWith(
          fetch(event.request)
            .then((response) => {
              if (response && response.status === 200 && response.type === 'basic') {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  try {
                    cache.put(event.request, clone);
                  } catch (e) {
                    console.log('[SW] Cache put failed:', e);
                  }
                });
              }
              return response;
            })
            .catch(() => {
              return caches.match(event.request).then(cached => {
                return cached || new Response('Network error', { status: 408 });
              });
            })
        );
      });
    `;

    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);

    navigator.serviceWorker.register(swUrl, { scope: '/' })
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