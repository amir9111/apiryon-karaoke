import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const manifest = {
      name: "האפריון - מועדון קריוקי",
      short_name: "האפריון",
      description: "מערכת ניהול תור קריוקי ומסכי קהל למועדון האפריון",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#020617",
      theme_color: "#00caff",
      orientation: "any",
      lang: "he",
      dir: "rtl",
      categories: ["entertainment", "music", "lifestyle"],
      icons: [
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%2300caff;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%230088ff;stop-opacity:1'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='96' cy='96' r='88' fill='url(%23g)'/%3E%3Ctext x='96' y='115' text-anchor='middle' font-size='36' font-weight='900' fill='%23ffffff' font-family='Arial,sans-serif'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%2300caff;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%230088ff;stop-opacity:1'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='256' cy='256' r='240' fill='url(%23g)'/%3E%3Ctext x='256' y='300' text-anchor='middle' font-size='90' font-weight='900' fill='%23ffffff' font-family='Arial,sans-serif'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%2300caff;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%230088ff;stop-opacity:1'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='96' cy='96' r='88' fill='url(%23g)'/%3E%3Ctext x='96' y='115' text-anchor='middle' font-size='36' font-weight='900' fill='%23ffffff' font-family='Arial,sans-serif'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "maskable"
        },
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%2300caff;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%230088ff;stop-opacity:1'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='256' cy='256' r='240' fill='url(%23g)'/%3E%3Ctext x='256' y='300' text-anchor='middle' font-size='90' font-weight='900' fill='%23ffffff' font-family='Arial,sans-serif'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "maskable"
        }
      ]
    };

    const swCode = `
      const CACHE_NAME = 'apiryon-v8';
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

    navigator.serviceWorker.register(swUrl, { 
      scope: '/',
      updateViaCache: 'none'
    })
      .then(reg => {
        console.log('✅ [PWA] Service Worker registered!');
        console.log('📍 [PWA] Scope:', reg.scope);
        console.log('🔄 [PWA] Updating...');
        
        // Force update
        reg.update();
        
        // Log manifest URL after SW is ready
        setTimeout(() => {
          fetch('/manifest.json')
            .then(r => r.json())
            .then(m => {
              console.log('✅ [PWA] Manifest loaded:', m);
              console.log('🎯 [PWA] Icons count:', m.icons?.length);
            })
            .catch(e => console.error('❌ [PWA] Manifest error:', e));
        }, 1000);
      })
      .catch(err => {
        console.error('❌ [PWA] SW registration failed:', err);
      });
  }, []);

  return null;
}