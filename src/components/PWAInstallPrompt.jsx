import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const dismissed = localStorage.getItem('pwa_install_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
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