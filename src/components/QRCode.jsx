import React from "react";

export default function QRCode({ url, size = 200 }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="p-3 rounded-2xl"
        style={{
          background: "white",
          boxShadow: "0 0 20px rgba(0, 202, 255, 0.3)"
        }}
      >
        <img 
          src={qrUrl} 
          alt="QR Code" 
          className="rounded-lg"
          style={{ width: size, height: size }}
        />
      </div>
      <p className="text-sm text-center" style={{ color: "#00caff" }}>
        סרקו להצטרפות לתור 📱
      </p>
    </div>
  );
}