import React from "react";
import { motion } from "framer-motion";

export default function SingleQRDisplay({ qrIndex }) {
  const qrData = [
    {
      icon: "💬",
      title: "הצטרפו לקבוצה!",
      subtitle: "קבוצת וואטסאפ",
      description: "עדכונים על ערבי קריוקי הבאים",
      url: "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15",
      color: "#00caff"
    },
    {
      icon: "🎵",
      title: "עקבו בטיקטוק!",
      subtitle: "@apiryon.club",
      description: "תראו את עצמכם בסרטונים! 📸",
      url: "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://www.tiktok.com/@apiryon.club",
      color: "#ff0050"
    },
    {
      icon: "📺",
      title: "הופיעו במסך!",
      subtitle: "העלה תמונות והודעות",
      description: "הופיעו במסך הגדול!",
      url: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${window.location.origin}/UploadToScreen`,
      color: "#a78bfa"
    }
  ];

  const current = qrData[qrIndex];

  return (
    <motion.div
      key={`qr-${qrIndex}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8 }}
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
        gap: "50px",
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)"
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
          fontWeight: "900",
          color: current.color,
          textShadow: `0 0 40px ${current.color}`,
          textAlign: "center"
        }}
      >
        {current.title}
      </motion.div>

      <motion.div
        animate={{
          boxShadow: [
            `0 0 60px ${current.color}40`,
            `0 0 100px ${current.color}70`,
            `0 0 60px ${current.color}40`
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          background: "rgba(15, 23, 42, 0.9)",
          borderRadius: "40px",
          padding: "60px",
          border: `5px solid ${current.color}`,
          textAlign: "center",
          maxWidth: "700px"
        }}
      >
        <div style={{ fontSize: "clamp(3rem, 6vw, 5rem)", marginBottom: "30px" }}>
          {current.icon}
        </div>

        <div style={{
          width: "clamp(300px, 35vw, 500px)",
          height: "clamp(300px, 35vw, 500px)",
          background: "#fff",
          borderRadius: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "30px",
          border: `8px solid ${current.color}`
        }}>
          <img 
            src={current.url}
            alt="QR Code"
            style={{ width: "90%", height: "90%" }}
          />
        </div>

        <div style={{
          fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
          color: current.color,
          fontWeight: "800",
          textShadow: `0 0 30px ${current.color}`,
          marginBottom: "20px"
        }}>
          {current.subtitle}
        </div>

        <div style={{
          fontSize: "clamp(1.3rem, 2.5vw, 2rem)",
          color: "#cbd5e1",
          fontWeight: "600"
        }}>
          {current.description}
        </div>
      </motion.div>

      <div style={{ display: "flex", gap: "15px" }}>
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: idx === qrIndex ? current.color : "rgba(100, 116, 139, 0.5)",
              transition: "all 0.3s",
              boxShadow: idx === qrIndex ? `0 0 20px ${current.color}` : "none"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}