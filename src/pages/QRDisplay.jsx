import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApyironLogo from "../components/ApyironLogo";
import { Maximize, Minimize, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QRDisplay() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // רוטציה אוטומטית כל 8 שניות
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

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
        height: isFullscreen ? "100vh" : "100%",
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isFullscreen ? "center" : "flex-start",
        padding: isFullscreen ? "10px" : "20px",
        paddingBottom: isFullscreen ? "80px" : "100px",
        paddingTop: isFullscreen ? "10px" : "20px",
        position: "relative",
        overflowY: "auto",
        overflowX: "hidden"
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
        style={{ 
          marginTop: isFullscreen ? "10px" : "20px", 
          marginBottom: isFullscreen ? "15px" : "30px", 
          zIndex: 10 
        }}
      >
        <ApyironLogo size={isFullscreen ? "small" : "medium"} showCircle={true} />
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
            maxWidth: isFullscreen ? "90vw" : "700px",
            width: "100%",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: isFullscreen ? "20px" : "30px",
            padding: isFullscreen ? "20px 15px" : "30px 20px",
            border: "3px solid",
            textAlign: "center",
            position: "relative",
            zIndex: 10
          }}
        >
          {/* Icon */}
          <div style={{
            fontSize: isFullscreen ? "clamp(1.8rem, 5vw, 3rem)" : "clamp(2.5rem, 6vw, 4rem)",
            marginBottom: isFullscreen ? "10px" : "16px",
            animation: "pulse 2s ease-in-out infinite"
          }}>
            {currentQR.icon}
          </div>

          {/* Title */}
          <h1 
            className={`bg-gradient-to-r ${currentQR.gradient} bg-clip-text`}
            style={{
              fontSize: isFullscreen ? "clamp(1.2rem, 3.5vw, 2rem)" : "clamp(1.5rem, 4vw, 2.5rem)",
              fontWeight: "900",
              color: "transparent",
              marginBottom: isFullscreen ? "8px" : "12px",
              lineHeight: "1.2"
            }}
          >
            {currentQR.title}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: isFullscreen ? "clamp(0.8rem, 2vw, 1.1rem)" : "clamp(1rem, 2.5vw, 1.3rem)",
            color: "#cbd5e1",
            marginBottom: isFullscreen ? "15px" : "24px",
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
              padding: isFullscreen ? "12px" : "16px",
              background: "white",
              borderRadius: isFullscreen ? "16px" : "24px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentQR.url)}`}
              alt="QR Code"
              style={{
                width: isFullscreen ? "clamp(180px, 30vw, 250px)" : "clamp(200px, 35vw, 300px)",
                height: isFullscreen ? "clamp(180px, 30vw, 250px)" : "clamp(200px, 35vw, 300px)",
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
              marginTop: isFullscreen ? "12px" : "20px",
              fontSize: isFullscreen ? "clamp(0.75rem, 1.5vw, 1rem)" : "clamp(0.9rem, 1.8vw, 1.2rem)",
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
        gap: isFullscreen ? "8px" : "12px",
        marginTop: isFullscreen ? "12px" : "24px",
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
      {!isFullscreen && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            marginTop: "16px",
            fontSize: "0.85rem",
            color: "#64748b",
            textAlign: "center",
            zIndex: 10
          }}
        >
          ⏱️ החלפה אוטומטית כל 8 שניות
        </motion.p>
      )}

      {/* Control Buttons */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        display: "flex",
        gap: "12px",
        zIndex: 1000
      }}>
        <Link
          to={createPageUrl("Home")}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(251, 191, 36, 0.4)",
            transition: "transform 0.3s",
            color: "#1a1a1a",
            textDecoration: "none"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <Home size={28} />
        </Link>
        <button
          onClick={toggleFullscreen}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00caff, #0088ff)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0, 202, 255, 0.4)",
            transition: "transform 0.3s",
            color: "#001a2e"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {isFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
        </button>
      </div>

      {/* All QR Codes Grid (Bottom) */}
      {!isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            maxWidth: "800px",
            width: "100%",
            marginTop: "30px",
            marginBottom: "20px",
            zIndex: 10
          }}
        >
        {qrData.map((qr, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={currentIndex === index ? qr.borderColor : "border-slate-700"}
            style={{
              padding: "15px",
              background: currentIndex === index 
                ? "rgba(15, 23, 42, 0.95)" 
                : "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(10px)",
              borderRadius: "15px",
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
            <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{qr.icon}</div>
            <div style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "600" }}>
              {qr.title.split('!')[0]}
            </div>
          </button>
        ))}
        </motion.div>
      )}
    </div>
  );
}

QRDisplay.isPublic = true;