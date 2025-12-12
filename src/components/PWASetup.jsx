import React, { useEffect } from "react";
import { Helmet } from "react-helmet";

export default function PWASetup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const manifest = {
    name: "Apiryon - מערכת קריוקי",
    short_name: "Apiryon",
    description: "מערכת ניהול קריוקי מתקדמת",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#00caff",
    orientation: "any",
    icons: [
      {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23020617'/%3E%3Ccircle cx='256' cy='256' r='180' fill='none' stroke='%2300caff' stroke-width='20'/%3E%3Ctext x='256' y='300' font-size='180' font-weight='900' text-anchor='middle' fill='%2300caff' font-family='Arial'%3E🎤%3C/text%3E%3C/svg%3E",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ]
  };

  const manifestString = JSON.stringify(manifest);
  const manifestBlob = new Blob([manifestString], { type: 'application/json' });
  const manifestURL = URL.createObjectURL(manifestBlob);

  return (
    <Helmet>
      <link rel="manifest" href={manifestURL} />
      <meta name="theme-color" content="#00caff" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Apiryon" />
      <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23020617'/%3E%3Ccircle cx='256' cy='256' r='180' fill='none' stroke='%2300caff' stroke-width='20'/%3E%3Ctext x='256' y='300' font-size='180' font-weight='900' text-anchor='middle' fill='%2300caff' font-family='Arial'%3E🎤%3C/text%3E%3C/svg%3E" />
      <meta name="mobile-web-app-capable" content="yes" />
    </Helmet>
  );
}