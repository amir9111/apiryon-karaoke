import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isDismissed = localStorage.getItem('pwa_install_dismissed');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('🔍 PWA Check - Dismissed:', isDismissed, 'Installed:', isInstalled);
    
    if (isDismissed || isInstalled) return;
    
    const handler = (e) => {
      console.log('🎉 beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    setTimeout(() => {
      if (!deferredPrompt) {
        console.log('⚠️ No beforeinstallprompt event after 10s - PWA criteria not met');
        console.log('🔍 Check:');
        console.log('  - HTTPS enabled?', window.location.protocol === 'https:');
        console.log('  - Service Worker registered?', 'serviceWorker' in navigator);
        console.log('  - Manifest linked?', !!document.querySelector('link[rel="manifest"]'));
      }
    }, 10000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowPrompt(false);
      try {
        localStorage.setItem('pwa_install_dismissed', 'true');
      } catch (e) {}
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa_install_dismissed', 'true');
    } catch (e) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem('pwa_install_dismissed', 'true');
    } catch (e) {}
  };

  if (!showPrompt) return null;

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