import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

export default function PWASetup() {
  const [manifestURL, setManifestURL] = useState("");
  const [iconURL, setIconURL] = useState("");

  useEffect(() => {
    // Create icon
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 512, 512);
    
    // Circle
    ctx.strokeStyle = '#00caff';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(256, 256, 180, 0, Math.PI * 2);
    ctx.stroke();
    
    // Emoji (approximate with text)
    ctx.font = 'bold 200px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00caff';
    ctx.fillText('🎤', 256, 256);
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setIconURL(url);
      
      // Create manifest
      const manifest = {
        name: "Apiryon - מערכת קריוקי",
        short_name: "Apiryon",
        description: "מערכת ניהול קריוקי מתקדמת",
        start_url: window.location.origin + "/",
        scope: "/",
        display: "standalone",
        background_color: "#020617",
        theme_color: "#00caff",
        orientation: "any",
        icons: [
          {
            src: url,
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: url,
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          }
        ]
      };
      
      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      setManifestURL(manifestUrl);
    }, 'image/png');

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  if (!manifestURL) return null;

  return (
    <Helmet>
      <link rel="manifest" href={manifestURL} />
      <meta name="theme-color" content="#00caff" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Apiryon" />
      <link rel="apple-touch-icon" href={iconURL} />
      <meta name="mobile-web-app-capable" content="yes" />
    </Helmet>
  );
}