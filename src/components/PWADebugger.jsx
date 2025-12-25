import { useEffect } from "react";

export default function PWADebugger() {
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔍 ===== PWA DIAGNOSTICS START =====');
      
      // 1. Protocol
      const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      console.log('🔒 [HTTPS]:', isHttps ? '✅ Secure' : '❌ Not HTTPS');
      
      // 2. Service Worker
      const hasSW = 'serviceWorker' in navigator;
      console.log('👷 [Service Worker Support]:', hasSW ? '✅' : '❌');
      
      if (hasSW) {
        navigator.serviceWorker.getRegistration('/').then(reg => {
          if (reg) {
            console.log('✅ [SW] Registered - Scope:', reg.scope);
            console.log('   State:', reg.active?.state || 'No active worker');
          } else {
            console.log('❌ [SW] Not registered yet');
          }
        });
      }
      
      // 3. Manifest
      setTimeout(() => {
        const link = document.querySelector('link[rel="manifest"]');
        console.log('📄 [Manifest Link]:', link ? '✅ Found' : '❌ Missing');
        if (link) console.log('   URL:', link.href);
        
        fetch('/manifest.json')
          .then(r => {
            console.log('📥 [Manifest Fetch]:', r.ok ? '✅ ' + r.status : '❌ ' + r.status);
            console.log('   Content-Type:', r.headers.get('content-type'));
            return r.json();
          })
          .then(m => {
            console.log('✅ [Manifest Parsed]');
            console.log('   Name:', m.name);
            console.log('   Short Name:', m.short_name);
            console.log('   Display:', m.display);
            console.log('   Start URL:', m.start_url);
            console.log('   Icons:', m.icons?.length, 'found');
            console.log('   Scope:', m.scope);
            
            const has192 = m.icons?.some(i => i.sizes === '192x192');
            const has512 = m.icons?.some(i => i.sizes === '512x512');
            console.log('   192x192 icon:', has192 ? '✅' : '❌');
            console.log('   512x512 icon:', has512 ? '✅' : '❌');
            
            console.log('\n📋 [PWA Checklist]:');
            console.log('  ✓ HTTPS/localhost:', isHttps);
            console.log('  ✓ Service Worker:', hasSW);
            console.log('  ✓ Manifest valid:', true);
            console.log('  ✓ display=standalone:', m.display === 'standalone');
            console.log('  ✓ Icons (192+512):', has192 && has512);
            console.log('  ✓ start_url:', !!m.start_url);
            console.log('\n💡 All criteria met? PWA should be installable!');
          })
          .catch(e => console.error('❌ [Manifest Error]:', e.message));
      }, 1000);
      
      // 4. Install Prompt
      let promptFired = false;
      const promptHandler = (e) => {
        promptFired = true;
        console.log('✅✅✅ [Install Prompt] FIRED! PWA IS INSTALLABLE! ✅✅✅');
      };
      
      window.addEventListener('beforeinstallprompt', promptHandler);
      
      setTimeout(() => {
        if (!promptFired) {
          console.log('⚠️ [Install Prompt] NOT fired after 6s');
          console.log('   Possible reasons:');
          console.log('   - Already installed (check display mode)');
          console.log('   - Some criteria not met');
          console.log('   - Browser cache (try incognito)');
          console.log('   - Browser doesn\'t support PWA');
        }
        console.log('🔍 ===== PWA DIAGNOSTICS END =====\n');
      }, 6000);
      
      // 5. Display Mode
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      console.log('🖥️ [Display Mode]:', standalone ? '✅ Standalone (already installed)' : '🌐 Browser tab');
      
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}