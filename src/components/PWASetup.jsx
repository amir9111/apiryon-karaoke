import React from "react";
import { Helmet } from "react-helmet";

export default function PWASetup() {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const siteName = "אפריון - מועדון קריוקי";
  const siteDescription = "מועדון הקריוקי המוביל בצפון - רישום לתור, גלריה ועוד";
  
  const iconSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect fill='%2300caff' width='512' height='512'/%3E%3Ctext x='50%25' y='50%25' font-size='280' font-weight='bold' text-anchor='middle' dy='.35em' fill='white'%3EA%3C/text%3E%3C/svg%3E`;

  // PWA Setup
  React.useEffect(() => {
    // Create manifest dynamically
    const manifest = {
      name: "אפריון - מועדון קריוקי",
      short_name: "אפריון",
      description: siteDescription,
      start_url: siteUrl + "/#/Home",
      display: "standalone",
      background_color: "#020617",
      theme_color: "#00caff",
      orientation: "portrait",
      dir: "rtl",
      lang: "he",
      icons: [
        {
          src: iconSvg,
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any maskable"
        },
        {
          src: iconSvg,
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any maskable"
        }
      ],
      scope: "/",
      categories: ["entertainment", "music"],
      shortcuts: [
        {
          name: "רישום לתור",
          url: "/#/Home",
          icons: [{ src: iconSvg, sizes: "96x96" }]
        },
        {
          name: "גלריה",
          url: "/#/Gallery",
          icons: [{ src: iconSvg, sizes: "96x96" }]
        }
      ]
    };

    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);
    
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.href = manifestURL;
    } else {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = manifestURL;
      document.head.appendChild(manifestLink);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      const swCode = `
        const CACHE = 'apiryon-v2';
        
        self.addEventListener('install', (e) => {
          e.waitUntil(self.skipWaiting());
        });
        
        self.addEventListener('activate', (e) => {
          e.waitUntil(
            caches.keys().then(keys => {
              return Promise.all(
                keys.filter(key => key !== CACHE).map(key => caches.delete(key))
              );
            }).then(() => self.clients.claim())
          );
        });
        
        self.addEventListener('fetch', (e) => {
          if (e.request.method !== 'GET') return;
          
          e.respondWith(
            fetch(e.request)
              .then(res => {
                if (res && res.status === 200 && res.type === 'basic') {
                  const resClone = res.clone();
                  caches.open(CACHE).then(cache => cache.put(e.request, resClone));
                }
                return res;
              })
              .catch(() => caches.match(e.request))
          );
        });
      `;
      
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swURL = URL.createObjectURL(blob);
      
      navigator.serviceWorker.register(swURL)
        .then(() => console.log('✅ Service Worker רשום'))
        .catch(err => console.error('❌ שגיאה ב-Service Worker:', err));
    }
  }, []);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteName}</title>
      <meta name="description" content={siteDescription} />
      <link rel="canonical" href={siteUrl} />
      
      {/* PWA Meta Tags */}
      <meta name="theme-color" content="#00caff" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="אפריון" />
      <link rel="apple-touch-icon" href={iconSvg} />
      <link rel="icon" href={iconSvg} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteName} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={iconSvg} />
      <meta property="og:site_name" content="אפריון" />
      <meta property="og:locale" content="he_IL" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteName} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={iconSvg} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "אפריון",
          "description": siteDescription,
          "url": siteUrl,
          "applicationCategory": "EntertainmentApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "ILS"
          }
        })}
      </script>
      
      <html lang="he" dir="rtl" />
    </Helmet>
  );
}