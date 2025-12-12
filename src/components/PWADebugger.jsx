import { useEffect } from "react";

export default function PWADebugger() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait for everything to load
    setTimeout(() => {
      console.log('🔍 [PWA Debug] Starting diagnostic...');
      
      // 1. Check HTTPS
      const isHTTPS = window.location.protocol === 'https:';
      console.log(isHTTPS ? '✅ HTTPS enabled' : '❌ HTTPS not enabled');
      
      // 2. Check Service Worker support
      const hasSW = 'serviceWorker' in navigator;
      console.log(hasSW ? '✅ Service Worker supported' : '❌ Service Worker not supported');
      
      // 3. Check if SW is registered
      if (hasSW) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg) {
            console.log('✅ Service Worker registered:', reg);
            console.log('   - State:', reg.active?.state);
            console.log('   - Scope:', reg.scope);
          } else {
            console.log('❌ Service Worker not registered');
          }
        });
      }
      
      // 4. Check manifest link
      const manifestLink = document.querySelector('link[rel="manifest"]');
      console.log(manifestLink ? '✅ Manifest link found' : '❌ No manifest link in HTML');
      
      // 5. Try to fetch manifest
      fetch('/manifest.json')
        .then(r => {
          console.log('✅ Manifest fetch response:', r.status, r.statusText);
          return r.json();
        })
        .then(manifest => {
          console.log('✅ Manifest content:', manifest);
          console.log('   - Name:', manifest.name);
          console.log('   - Icons:', manifest.icons?.length);
          console.log('   - Start URL:', manifest.start_url);
          console.log('   - Display:', manifest.display);
        })
        .catch(e => {
          console.error('❌ Manifest fetch failed:', e);
        });
      
      // 6. Check if already installed
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
      console.log(isInstalled ? '✅ App is installed' : '⚠️ App not installed');
      
      // 7. Check beforeinstallprompt
      console.log('⏳ Waiting for beforeinstallprompt event...');
      
    }, 3000);
  }, []);

  return null;
}