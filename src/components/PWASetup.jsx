import React from "react";
import { Helmet } from "react-helmet";

export default function PWASetup() {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const siteName = "Apiryon - מערכת קריוקי";
  const siteDescription = "מערכת ניהול קריוקי מתקדמת עם מסך קהל חי, דירוגים ואנליטיקס";
  
  const iconSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3CradialGradient id='bg'%3E%3Cstop offset='0%25' style='stop-color:%230a1929'/%3E%3Cstop offset='100%25' style='stop-color:%23020617'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='512' height='512'/%3E%3Ccircle cx='256' cy='256' r='200' fill='none' stroke='%2300caff' stroke-width='16' filter='drop-shadow(0 0 20px %2300caff)'/%3E%3Ctext x='256' y='280' font-family='Arial' font-size='80' font-weight='bold' text-anchor='middle' fill='%23ffffff' filter='drop-shadow(0 0 10px %2300caff)'%3EAPIRYON%3C/text%3E%3C/svg%3E`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteName}</title>
      <meta name="description" content={siteDescription} />
      <link rel="canonical" href={siteUrl} />
      
      {/* PWA - Critical for Chrome PWA detection */}
      <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
      <meta name="theme-color" content="#00caff" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#020617" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Apiryon" />
      <link rel="apple-touch-icon" href={iconSvg} />
      <link rel="icon" type="image/svg+xml" href={iconSvg} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteName} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={iconSvg} />
      <meta property="og:site_name" content="Apiryon" />
      <meta property="og:locale" content="he_IL" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={siteName} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={iconSvg} />
      
      {/* TikTok */}
      <meta name="tiktok:app:name" content="Apiryon" />
      <meta name="tiktok:app:url" content="https://www.tiktok.com/@apiryon.club" />
      
      {/* Structured Data - JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Apiryon",
          "description": siteDescription,
          "url": siteUrl,
          "applicationCategory": "EntertainmentApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "ILS"
          },
          "sameAs": [
            "https://www.tiktok.com/@apiryon.club"
          ]
        })}
      </script>
      
      {/* Accessibility */}
      <html lang="he" dir="rtl" />
    </Helmet>
  );
}