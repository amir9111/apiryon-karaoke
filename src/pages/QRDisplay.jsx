import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApyironLogo from "../components/ApyironLogo";

export default function QRDisplay() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // רוטציה אוטומטית כל 8 שניות
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const qrData = [
    {
      icon: "📢",
      title: "הצטרפו לקבוצת העדכונים!",
      subtitle: "קבלו עדכונים על אירועים והופעות",
      url: "https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15",
      gradient: "from-green-500 to-emerald-600",
      borderColor: "border-green-400",
      shadowColor: "shadow-[0_0_100px_rgba(34,197,94,0.4)]"
    },
    {
      icon: "🎵",
      title: "עקבו אחרינו בטיקטוק!",
      subtitle: "@apiryon.club",
      url: "https://www.tiktok.com/@apiryon.club",
      gradient: "from-pink-500 to-rose-600",
      borderColor: "border-pink-400",
      shadowColor: "shadow-[0_0_100px_rgba(236,72,153,0.4)]"
    },
    {
      icon: "📸",
      title: "גלריית התמונות שלנו!",
      subtitle: "ראו את כל הרגעים המיוחדים",
      url: `${window.location.origin}/#/Gallery`,
      gradient: "from-purple-500 to-violet-600",
      borderColor: "border-purple-400",
      shadowColor: "shadow-[0_0_100px_rgba(168,85,247,0.4)]"
    }
  ];

  const currentQR = qrData[currentIndex];

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Animation */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 50% 50%, rgba(0, 202, 255, 0.1) 0%, transparent 50%)",
        animation: "pulse 4s ease-in-out infinite"
      }} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: "60px", zIndex: 10 }}
      >
        <ApyironLogo size="large" showCircle={true} />
      </motion.div>

      {/* Main QR Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: 20 }}
          transition={{ duration: 0.6 }}
          className={`${currentQR.borderColor} ${currentQR.shadowColor}`}
          style={{
            maxWidth: "800px",
            width: "100%",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "40px",
            padding: "60px 40px",
            border: "4px solid",
            textAlign: "center",
            position: "relative",
            zIndex: 10
          }}
        >
          {/* Icon */}
          <div style={{
            fontSize: "clamp(4rem, 8vw, 6rem)",
            marginBottom: "24px",
            animation: "pulse 2s ease-in-out infinite"
          }}>
            {currentQR.icon}
          </div>

          {/* Title */}
          <h1 
            className={`bg-gradient-to-r ${currentQR.gradient} bg-clip-text`}
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: "900",
              color: "transparent",
              marginBottom: "16px",
              lineHeight: "1.2"
            }}
          >
            {currentQR.title}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            color: "#cbd5e1",
            marginBottom: "48px",
            fontWeight: "600"
          }}>
            {currentQR.subtitle}
          </p>

          {/* QR Code */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              display: "inline-block",
              padding: "24px",
              background: "white",
              borderRadius: "32px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(currentQR.url)}`}
              alt="QR Code"
              style={{
                width: "clamp(250px, 40vw, 400px)",
                height: "clamp(250px, 40vw, 400px)",
                display: "block"
              }}
            />
          </motion.div>

          {/* Scan Instruction */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              marginTop: "32px",
              fontSize: "clamp(1rem, 2vw, 1.4rem)",
              color: "#94a3b8",
              fontWeight: "600"
            }}
          >
            📱 סרקו עם המצלמה שלכם
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginTop: "48px",
        zIndex: 10
      }}>
        {qrData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: currentIndex === index ? "48px" : "16px",
              height: "16px",
              borderRadius: "8px",
              background: currentIndex === index 
                ? "linear-gradient(135deg, #00caff, #0088ff)" 
                : "rgba(148, 163, 184, 0.3)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: currentIndex === index 
                ? "0 0 20px rgba(0, 202, 255, 0.6)" 
                : "none"
            }}
          />
        ))}
      </div>

      {/* Auto-rotate indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          marginTop: "24px",
          fontSize: "0.95rem",
          color: "#64748b",
          textAlign: "center",
          zIndex: 10
        }}
      >
        ⏱️ החלפה אוטומטית כל 8 שניות
      </motion.p>

      {/* All QR Codes Grid (Bottom) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          maxWidth: "1000px",
          width: "100%",
          marginTop: "60px",
          zIndex: 10
        }}
      >
        {qrData.map((qr, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={currentIndex === index ? qr.borderColor : "border-slate-700"}
            style={{
              padding: "20px",
              background: currentIndex === index 
                ? "rgba(15, 23, 42, 0.95)" 
                : "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              border: "2px solid",
              cursor: "pointer",
              transition: "all 0.3s",
              textAlign: "center"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 202, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{qr.icon}</div>
            <div style={{ fontSize: "0.9rem", color: "#cbd5e1", fontWeight: "600" }}>
              {qr.title.split('!')[0]}
            </div>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

QRDisplay.isPublic = true;