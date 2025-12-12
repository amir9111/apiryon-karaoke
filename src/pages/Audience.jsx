import React, { useState } from "react";
import NavigationMenu from "../components/NavigationMenu";
import ApyironLogo from "../components/ApyironLogo";
import AudioWave from "../components/AudioWave";
import FloatingParticles from "../components/FloatingParticles";

import EventSummaryModal from "../components/EventSummaryModal";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";

export default function Audience() {
  const [showSummary, setShowSummary] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ top: 80, left: 48 });
  const [isDragging, setIsDragging] = useState(false);

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 1000,
  });

  const current = requests.find(r => r.status === "performing");
  const next = requests.filter(r => r.status === "waiting")[0];

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#fff",
      position: "relative",
      overflow: "hidden"
    }}>
      <FloatingParticles />
      <NavigationMenu />
      
      {/* Edit Mode Toggle */}
      {editMode && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0, 202, 255, 0.95)",
          color: "#001a2e",
          padding: "20px 30px",
          borderRadius: "20px",
          zIndex: 200,
          fontWeight: "700",
          fontSize: "1rem",
          boxShadow: "0 0 30px rgba(0, 202, 255, 0.6)",
          textAlign: "center"
        }}>
          <div style={{ marginBottom: "10px" }}>גרור את הלוגו למיקום הרצוי</div>
          <div style={{ fontSize: "0.9rem", marginBottom: "15px" }}>
            Top: {logoPosition.top}px, Left: {logoPosition.left}%
          </div>
          <button
            onClick={() => {
              setEditMode(false);
              alert(`שמור את הערכים:\ntop: "${logoPosition.top}px"\nleft: "${logoPosition.left}%"`);
            }}
            style={{
              background: "#001a2e",
              color: "#00caff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700"
            }}
          >
            שמור מיקום
          </button>
        </div>
      )}

      {/* APIRYON Logo - Center Top */}
      <motion.div
        drag={editMode}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(e, info) => {
          setIsDragging(false);
          const rect = e.target.getBoundingClientRect();
          const newTop = rect.top;
          const newLeft = (rect.left + rect.width / 2) / window.innerWidth * 100;
          setLogoPosition({ top: Math.round(newTop), left: Math.round(newLeft) });
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
        style={{
          position: "fixed",
          top: `${logoPosition.top}px`,
          left: `${logoPosition.left}%`,
          transform: "translateX(-50%)",
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: editMode ? "move" : "default",
          opacity: isDragging ? 0.7 : 1
        }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.08, 1],
            rotate: [0, 3, -3, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ApyironLogo size="large" showCircle={true} />
        </motion.div>
      </motion.div>
      
      {/* Edit Logo Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setEditMode(!editMode)}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          background: editMode ? "linear-gradient(135deg, #f87171, #ef4444)" : "linear-gradient(135deg, #00caff, #0088ff)",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          cursor: "pointer",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: editMode ? "0 0 30px rgba(248, 113, 113, 0.5)" : "0 0 30px rgba(0, 202, 255, 0.5)",
          color: "#fff",
          fontSize: "1.5rem",
          fontWeight: "800"
        }}
      >
        {editMode ? "✓" : "✏️"}
      </motion.button>

      {/* Summary Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSummary(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "100px",
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          border: "none",
          borderRadius: "20px",
          padding: "16px 28px",
          cursor: "pointer",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
          color: "#001a2e",
          fontSize: "1.1rem",
          fontWeight: "800"
        }}
      >
        <BarChart3 className="w-6 h-6" />
        <span>סיכום הערב</span>
      </motion.button>

      <EventSummaryModal 
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        requests={requests}
      />
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 60px rgba(0, 202, 255, 0.6), 0 0 120px rgba(0, 202, 255, 0.3); }
          50% { box-shadow: 0 0 100px rgba(0, 202, 255, 0.8), 0 0 180px rgba(0, 202, 255, 0.5); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "320px 20px 40px 20px" }}>
        {/* Current Song - HERO SECTION */}
        {current ? (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{
              width: "100%",
              maxWidth: "1000px",
              marginBottom: "60px",
              position: "relative"
            }}
          >
            {/* Rotating glow ring */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "radial-gradient(circle, transparent 40%, rgba(0, 202, 255, 0.3) 70%, transparent)",
              animation: "rotate 20s linear infinite, pulse 3s ease-in-out infinite",
              pointerEvents: "none"
            }} />

            {/* Main content */}
            <div style={{
              background: "rgba(15, 23, 42, 0.3)",
              borderRadius: "50px",
              padding: "60px 40px",
              textAlign: "center",
              position: "relative",
              backdropFilter: "blur(30px)",
              border: "2px solid rgba(0, 202, 255, 0.3)",
              boxShadow: "0 0 80px rgba(0, 202, 255, 0.3), inset 0 0 30px rgba(0, 202, 255, 0.05)"
            }}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ 
                  fontSize: "2.5rem", 
                  color: "#00caff", 
                  marginBottom: "40px",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  fontWeight: "900",
                  textShadow: "0 0 40px rgba(0, 202, 255, 1), 0 0 80px rgba(0, 202, 255, 0.5)"
                }}
              >
                🎤 LIVE NOW 🎤
              </motion.div>

              {/* Audio wave around photo */}
              <div style={{ 
                position: "relative",
                display: "inline-block",
                marginBottom: "50px"
              }}>
                {/* Multiple animated rings */}
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0, 0.6]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: ring * 0.4
                    }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "350px",
                      height: "350px",
                      borderRadius: "50%",
                      border: "4px solid #00caff",
                      pointerEvents: "none"
                    }}
                  />
                ))}

                {current.photo_url ? (
                  <motion.img 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 10 }}
                    src={current.photo_url} 
                    alt={current.singer_name}
                    style={{
                      width: "320px",
                      height: "320px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "10px solid #00caff",
                      boxShadow: "0 0 80px rgba(0, 202, 255, 0.8), inset 0 0 30px rgba(0, 202, 255, 0.3)",
                      position: "relative",
                      zIndex: 1
                    }}
                  />
                ) : (
                  <div style={{
                    width: "320px",
                    height: "320px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00caff, #0088ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "8rem",
                    border: "10px solid #00caff",
                    boxShadow: "0 0 80px rgba(0, 202, 255, 0.8)"
                  }}>
                    🎤
                  </div>
                )}
              </div>

              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ 
                  fontSize: "clamp(3rem, 8vw, 6rem)", 
                  fontWeight: "900", 
                  marginBottom: "30px",
                  color: "#ffffff",
                  textShadow: "0 0 50px rgba(0, 202, 255, 0.6), 0 5px 30px rgba(0, 0, 0, 0.8)",
                  lineHeight: "1.1"
                }}
              >
                {current.singer_name}
              </motion.div>

              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ 
                  fontSize: "clamp(2rem, 5vw, 3.5rem)", 
                  color: "#e2e8f0",
                  fontWeight: "700",
                  marginBottom: "15px",
                  textShadow: "0 3px 15px rgba(0, 0, 0, 0.5)"
                }}
              >
                {current.song_title}
              </motion.div>

              {current.song_artist && (
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{ 
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)", 
                    color: "#94a3b8",
                    fontWeight: "600"
                  }}
                >
                  {current.song_artist}
                </motion.div>
              )}

              <div style={{ marginTop: "40px" }}>
                <AudioWave isPlaying={true} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "rgba(15, 23, 42, 0.3)",
              borderRadius: "40px",
              padding: "100px 60px",
              marginBottom: "60px",
              border: "2px dashed rgba(0, 202, 255, 0.3)",
              textAlign: "center",
              backdropFilter: "blur(30px)",
              maxWidth: "800px",
              width: "100%"
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: "5rem", marginBottom: "30px" }}
            >
              🎵
            </motion.div>
            <div style={{ 
              fontSize: "clamp(2rem, 4vw, 3rem)", 
              color: "#00caff", 
              fontWeight: "800",
              textShadow: "0 0 30px rgba(0, 202, 255, 0.8)"
            }}>
              מתכוננים לזמר הבא...
            </div>
          </motion.div>
        )}

        {/* Next + QR in a compact row */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: window.innerWidth > 900 ? "1fr 1fr" : "1fr", 
          gap: "40px",
          width: "100%",
          maxWidth: "1000px"
        }}>
          {/* Next Singer */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              background: "rgba(15, 23, 42, 0.3)",
              borderRadius: "30px",
              padding: "40px 30px",
              border: "2px solid rgba(0, 202, 255, 0.3)",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0, 202, 255, 0.15)",
              backdropFilter: "blur(30px)"
            }}
          >
            <div style={{ 
              fontSize: "1.8rem", 
              color: "#00caff", 
              marginBottom: "25px",
              fontWeight: "800",
              textShadow: "0 0 20px rgba(0, 202, 255, 0.6)"
            }}>
              ⏭️ הבא בתור
            </div>

            {next ? (
              <>
                {next.photo_url && (
                  <motion.img
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    src={next.photo_url} 
                    alt={next.singer_name}
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "20px",
                      border: "5px solid #00caff",
                      boxShadow: "0 0 30px rgba(0, 202, 255, 0.4)"
                    }}
                  />
                )}
                <div style={{ 
                  fontSize: "2rem", 
                  fontWeight: "900", 
                  marginBottom: "12px",
                  color: "#ffffff"
                }}>
                  {next.singer_name}
                </div>
                <div style={{ 
                  fontSize: "1.5rem", 
                  color: "#cbd5e1",
                  fontWeight: "600"
                }}>
                  {next.song_title}
                </div>
                {next.song_artist && (
                  <div style={{ 
                    fontSize: "1.2rem", 
                    color: "#94a3b8", 
                    marginTop: "8px" 
                  }}>
                    {next.song_artist}
                  </div>
                )}
              </>
            ) : (
              <div style={{ 
                color: "#64748b", 
                fontSize: "1.4rem", 
                padding: "40px 20px",
                fontWeight: "600"
              }}>
                אין ממתינים כרגע
              </div>
            )}
          </motion.div>

          {/* QR Code for WhatsApp */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              background: "rgba(15, 23, 42, 0.3)",
              borderRadius: "30px",
              padding: "40px 30px",
              border: "2px solid rgba(0, 202, 255, 0.3)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 40px rgba(0, 202, 255, 0.15)",
              backdropFilter: "blur(30px)"
            }}
          >
            <div style={{ 
              fontSize: "1.8rem", 
              color: "#00caff", 
              marginBottom: "25px",
              fontWeight: "800",
              textShadow: "0 0 20px rgba(0, 202, 255, 0.6)"
            }}>
              💬 הצטרפו לקבוצה
            </div>

            <div style={{
              width: "220px",
              height: "220px",
              background: "#fff",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              boxShadow: "0 0 30px rgba(0, 202, 255, 0.3)",
              border: "4px solid #00caff"
            }}>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
                alt="QR Code WhatsApp"
                style={{ width: "200px", height: "200px" }}
              />
            </div>

            <div style={{ 
              fontSize: "1.3rem", 
              color: "#cbd5e1",
              fontWeight: "700",
              marginBottom: "10px"
            }}>
              סרקו להצטרפות
            </div>
            <div style={{
              fontSize: "1rem",
              color: "#94a3b8",
              fontWeight: "600"
            }}>
              עדכונים על ערבי קריוקי
            </div>
          </motion.div>
          </div>
      </div>
    </div>
  );
}

Audience.isPublic = true;