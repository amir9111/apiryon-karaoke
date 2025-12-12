import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already installed or dismissed
    const isDismissed = localStorage.getItem('pwa_install_dismissed');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isDismissed || isInstalled) return;

    // Create manifest
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
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3CradialGradient id='bg'%3E%3Cstop offset='0%25' style='stop-color:%230a1929'/%3E%3Cstop offset='100%25' style='stop-color:%23020617'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='512' height='512'/%3E%3Ccircle cx='256' cy='256' r='200' fill='none' stroke='%2300caff' stroke-width='16'/%3E%3Ctext x='256' y='280' font-family='Arial' font-size='80' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any maskable"
        },
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3CradialGradient id='bg'%3E%3Cstop offset='0%25' style='stop-color:%230a1929'/%3E%3Cstop offset='100%25' style='stop-color:%23020617'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='192' height='192'/%3E%3Ccircle cx='96' cy='96' r='75' fill='none' stroke='%2300caff' stroke-width='6'/%3E%3Ctext x='96' y='105' font-family='Arial' font-size='28' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3EAPIRYON%3C/text%3E%3C/svg%3E",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any"
        }
      ]
    };

    // Service Worker code
    const swCode = `
      const CACHE_NAME = 'apiryon-v7';
      const MANIFEST = ${JSON.stringify(manifest)};
      
      self.addEventListener('install', (event) => {
        console.log('🔧 PWA: Service Worker installing...');
        self.skipWaiting();
      });
      
      self.addEventListener('activate', (event) => {
        console.log('✅ PWA: Service Worker activated');
        event.waitUntil(
          caches.keys()
            .then(names => Promise.all(
              names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
            ))
            .then(() => self.clients.claim())
        );
      });
      
      self.addEventListener('fetch', (event) => {
        const url = new URL(event.request.url);
        
        if (url.pathname === '/manifest.json' || url.pathname.endsWith('/manifest.json')) {
          console.log('📄 PWA: Serving manifest.json');
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
        
        if (event.request.method !== 'GET') return;
        
        event.respondWith(
          fetch(event.request)
            .then(response => {
              if (response?.status === 200 && !response.url.includes('blob:')) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
              }
              return response;
            })
            .catch(() => caches.match(event.request))
        );
      });
    `;

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);

      navigator.serviceWorker.register(swUrl, { scope: '/' })
        .then(reg => {
          console.log('✅ PWA: Service Worker registered');
          reg.update();
        })
        .catch(err => console.error('❌ PWA: Registration failed', err));
    }

    // Add manifest link to head
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
      console.log('✅ PWA: Manifest link added');
    }

    // Add meta tags
    const metaTags = [
      { name: 'theme-color', content: '#00caff' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Apiryon' },
      { name: 'mobile-web-app-capable', content: 'yes' }
    ];

    metaTags.forEach(({ name, content }) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });

    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      console.log('🎉 PWA: Install prompt available!');
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowInstallPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Debug check after 5 seconds
    setTimeout(() => {
      if (!deferredPrompt) {
        console.log('⚠️ PWA: No install prompt yet');
        console.log('  - HTTPS:', window.location.protocol === 'https:');
        console.log('  - SW:', 'serviceWorker' in navigator);
        console.log('  - Manifest:', !!document.querySelector('link[rel="manifest"]'));
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowInstallPrompt(false);
      try {
        localStorage.setItem('pwa_install_dismissed', 'true');
      } catch (e) {}
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA: User choice:', outcome);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa_install_dismissed', 'true');
    } catch (e) {
      console.error('PWA: Install error', e);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    try {
      localStorage.setItem('pwa_install_dismissed', 'true');
    } catch (e) {}
  };

  if (!showInstallPrompt) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(15, 23, 42, 0.98)",
        border: "2px solid rgba(0, 202, 255, 0.4)",
        borderRadius: "16px",
        padding: "16px 20px",
        boxShadow: "0 10px 40px rgba(0, 202, 255, 0.3)",
        zIndex: 9999,
        maxWidth: "90vw",
        width: "400px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}
      dir="rtl"
    >
      <Download className="w-8 h-8" style={{ color: "#00caff", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9", marginBottom: "4px" }}>
          התקן את האפליקציה
        </div>
        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
          גישה מהירה מהמסך הראשי
        </div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          padding: "8px 16px",
          background: "linear-gradient(135deg, #00caff, #0088ff)",
          color: "#001a2e",
          border: "none",
          borderRadius: "10px",
          fontSize: "0.85rem",
          fontWeight: "700",
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow: "0 0 15px rgba(0, 202, 255, 0.4)"
        }}
      >
        התקן
      </button>
      <button
        onClick={handleDismiss}
        style={{
          padding: "8px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#64748b"
        }}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}