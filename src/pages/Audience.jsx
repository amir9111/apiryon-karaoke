import React, { useState } from "react";
import NavigationMenu from "../components/NavigationMenu";
import ApyironLogo from "../components/ApyironLogo";
import AudioWave from "../components/AudioWave";
import LiveClock from "../components/LiveClock";
import EventSummaryModal from "../components/EventSummaryModal";
import FloatingMessages from "../components/FloatingMessages";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function Audience() {
  const [showSummary, setShowSummary] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Clock position & size
  const [clockPos, setClockPos] = useState(() => {
    const saved = localStorage.getItem('audience_clock_pos');
    return saved ? JSON.parse(saved) : { x: 20, y: 20 };
  });
  const [clockSize, setClockSize] = useState(() => {
    const saved = localStorage.getItem('audience_clock_size');
    return saved ? parseInt(saved) : 1;
  });

  // Logo position & size
  const [logoPos, setLogoPos] = useState(() => {
    const saved = localStorage.getItem('audience_logo_pos');
    return saved ? JSON.parse(saved) : { x: window.innerWidth / 2 - 100, y: 20 };
  });
  const [logoSize, setLogoSize] = useState(() => {
    const saved = localStorage.getItem('audience_logo_size');
    return saved ? parseInt(saved) : 1;
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 5000,
    staleTime: 4000,
  });

  const current = requests.find(r => r.status === "performing");
  const next = requests.filter(r => r.status === "waiting")[0];

  const handleDrag = (type, e) => {
    if (!editMode) return;
    
    const newPos = { x: e.clientX - 50, y: e.clientY - 50 };
    
    if (type === 'clock') {
      setClockPos(newPos);
      localStorage.setItem('audience_clock_pos', JSON.stringify(newPos));
    } else if (type === 'logo') {
      setLogoPos(newPos);
      localStorage.setItem('audience_logo_pos', JSON.stringify(newPos));
    }
  };

  const handleSizeChange = (type, delta) => {
    if (type === 'clock') {
      const newSize = Math.max(0.5, Math.min(3, clockSize + delta));
      setClockSize(newSize);
      localStorage.setItem('audience_clock_size', newSize.toString());
    } else if (type === 'logo') {
      const newSize = Math.max(0.5, Math.min(3, logoSize + delta));
      setLogoSize(newSize);
      localStorage.setItem('audience_logo_size', newSize.toString());
    }
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#fff",
      position: "relative"
    }}>
      {/* Edit Mode Toggle Button */}
      <button
        onClick={() => setEditMode(!editMode)}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 10000,
          padding: "12px 24px",
          background: editMode ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #00caff, #0088ff)",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          fontSize: "0.9rem",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(0, 202, 255, 0.5)"
        }}
      >
        {editMode ? "✓ שמור מיקום" : "⚙️ ערוך תצוגה"}
      </button>

      {/* Draggable Clock */}
      <div
        draggable={editMode}
        onDragEnd={(e) => handleDrag('clock', e)}
        style={{
          position: "fixed",
          left: `${clockPos.x}px`,
          top: `${clockPos.y}px`,
          zIndex: 9999,
          cursor: editMode ? "move" : "default",
          transform: `scale(${clockSize})`,
          transformOrigin: "top left",
          border: editMode ? "2px dashed #00caff" : "none",
          padding: editMode ? "10px" : "0",
          borderRadius: "12px",
          background: editMode ? "rgba(0, 202, 255, 0.1)" : "transparent"
        }}
      >
        <LiveClock />
        {editMode && (
          <div style={{ 
            marginTop: "8px", 
            display: "flex", 
            gap: "4px", 
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.8)",
            padding: "4px",
            borderRadius: "8px"
          }}>
            <button onClick={() => handleSizeChange('clock', -0.1)} style={{ padding: "4px 8px", background: "#1f2937", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>-</button>
            <button onClick={() => handleSizeChange('clock', 0.1)} style={{ padding: "4px 8px", background: "#1f2937", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>+</button>
          </div>
        )}
      </div>

      {/* Draggable Logo */}
      <div
        draggable={editMode}
        onDragEnd={(e) => handleDrag('logo', e)}
        style={{
          position: "fixed",
          left: `${logoPos.x}px`,
          top: `${logoPos.y}px`,
          zIndex: 9998,
          cursor: editMode ? "move" : "default",
          transform: `scale(${logoSize})`,
          transformOrigin: "top center",
          border: editMode ? "2px dashed #00caff" : "none",
          padding: editMode ? "10px" : "0",
          borderRadius: "12px",
          background: editMode ? "rgba(0, 202, 255, 0.1)" : "transparent",
          textAlign: "center"
        }}
      >
        <ApyironLogo size="small" showCircle={true} />
        <div style={{
          fontSize: "clamp(0.9rem, 2vw, 1.3rem)",
          fontWeight: "800",
          color: "#00caff",
          textShadow: "0 0 20px rgba(0, 202, 255, 0.8)",
          letterSpacing: "0.08em",
          whiteSpace: "nowrap",
          marginTop: "8px"
        }}>
          המוזיקה שלנו, הקול שלך 🎵
        </div>
        {editMode && (
          <div style={{ 
            marginTop: "8px", 
            display: "flex", 
            gap: "4px", 
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.8)",
            padding: "4px",
            borderRadius: "8px"
          }}>
            <button onClick={() => handleSizeChange('logo', -0.1)} style={{ padding: "4px 8px", background: "#1f2937", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>-</button>
            <button onClick={() => handleSizeChange('logo', 0.1)} style={{ padding: "4px 8px", background: "#1f2937", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>+</button>
          </div>
        )}
      </div>

      {/* Fixed Menu */}
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10000 }}>
        <NavigationMenu onSummaryClick={() => setShowSummary(true)} />
      </div>

      {/* CONTENT */}
      <div>
        <EventSummaryModal 
          isOpen={showSummary}
          onClose={() => setShowSummary(false)}
          requests={requests}
        />
        
        <style>{`
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 60px rgba(0, 202, 255, 0.6), 0 0 120px rgba(0, 202, 255, 0.3); }
            50% { box-shadow: 0 0 100px rgba(0, 202, 255, 0.8), 0 0 180px rgba(0, 202, 255, 0.5); }
          }
        `}</style>

        <main role="main" style={{ 
          minHeight: "100vh", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "120px 20px 40px"
        }}>
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
                marginBottom: "40px",
                position: "relative"
              }}
            >
              <div style={{
                background: "rgba(15, 23, 42, 0.3)",
                borderRadius: "30px",
                padding: "30px 20px",
                textAlign: "center",
                position: "relative",
                backdropFilter: "blur(30px)",
                border: "2px solid rgba(0, 202, 255, 0.3)",
                boxShadow: "0 0 80px rgba(0, 202, 255, 0.3), inset 0 0 30px rgba(0, 202, 255, 0.05)",
                overflow: "hidden"
              }}>
                <FloatingMessages messages={requests} isPerforming={!!current} />
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ 
                    fontSize: "1.5rem", 
                    color: "#00caff", 
                    marginBottom: "20px",
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                    fontWeight: "900",
                    textShadow: "0 0 40px rgba(0, 202, 255, 1), 0 0 80px rgba(0, 202, 255, 0.5)",
                    position: "relative",
                    zIndex: 10
                  }}
                >
                  🎤 LIVE NOW 🎤
                </motion.div>

                <div style={{ 
                  position: "relative",
                  display: "inline-block",
                  marginBottom: "20px",
                  zIndex: 10
                }}>
                  {current.photo_url ? (
                    <img 
                      src={current.photo_url} 
                      alt={`תמונת פרופיל של ${current.singer_name}`}
                      role="img"
                      aria-label={`${current.singer_name} מבצע כעת על הבמה`}
                      style={{
                        width: "180px",
                        height: "180px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "6px solid #00caff",
                        animation: "glow 2s ease-in-out infinite",
                        position: "relative",
                        zIndex: 1
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "180px",
                      height: "180px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #00caff, #0088ff)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "5rem",
                      border: "6px solid #00caff",
                      animation: "glow 2s ease-in-out infinite"
                    }}>
                      🎤
                    </div>
                  )}
                </div>

                <div style={{ 
                  fontSize: "clamp(2rem, 5vw, 3.5rem)", 
                  fontWeight: "900", 
                  marginBottom: "15px",
                  color: "#ffffff",
                  textShadow: "0 0 40px rgba(0, 202, 255, 0.6), 0 5px 25px rgba(0, 0, 0, 0.8)",
                  lineHeight: "1.1",
                  position: "relative",
                  zIndex: 10
                }}>
                  {current.singer_name}
                </div>

                <div style={{ 
                  fontSize: "clamp(1.3rem, 3.5vw, 2.3rem)", 
                  color: "#e2e8f0",
                  fontWeight: "700",
                  marginBottom: "10px",
                  textShadow: "0 3px 12px rgba(0, 0, 0, 0.5)",
                  position: "relative",
                  zIndex: 10
                }}>
                  {current.song_title}
                </div>

                {current.song_artist && (
                  <div style={{ 
                    fontSize: "clamp(1rem, 2vw, 1.6rem)", 
                    color: "#94a3b8",
                    fontWeight: "600",
                    position: "relative",
                    zIndex: 10
                  }}>
                    {current.song_artist}
                  </div>
                )}

                <div style={{ marginTop: "20px", position: "relative", zIndex: 10 }}>
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
                borderRadius: "30px",
                padding: "60px 40px",
                marginBottom: "40px",
                border: "2px dashed rgba(0, 202, 255, 0.3)",
                textAlign: "center",
                backdropFilter: "blur(30px)",
                maxWidth: "700px",
                width: "100%"
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontSize: "4rem", marginBottom: "20px" }}
              >
                🎵
              </motion.div>
              <div style={{ 
                fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", 
                color: "#00caff", 
                fontWeight: "800",
                textShadow: "0 0 25px rgba(0, 202, 255, 0.8)"
              }}>
                מתכוננים לזמר הבא...
              </div>
            </motion.div>
          )}

          {/* Next + QR in a compact row */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", 
            gap: "clamp(20px, 4vw, 40px)",
            width: "100%",
            maxWidth: "1400px"
          }}>
            {/* Next Singer */}
            <div style={{
                background: "rgba(15, 23, 42, 0.3)",
                borderRadius: "30px",
                padding: "40px 30px",
                border: "2px solid rgba(251, 191, 36, 0.4)",
                textAlign: "center",
                boxShadow: "0 10px 40px rgba(251, 191, 36, 0.2)",
                backdropFilter: "blur(30px)"
              }}>
              <div style={{ 
                fontSize: "1.8rem", 
                color: "#fbbf24", 
                marginBottom: "25px",
                fontWeight: "800",
                textShadow: "0 0 20px rgba(251, 191, 36, 0.6)"
              }}>
                ⏭️ הבא בתור
              </div>

              {next ? (
                <>
                  {next.photo_url ? (
                    <img
                      src={next.photo_url} 
                      alt={next.singer_name}
                      style={{
                        width: "180px",
                        height: "180px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: "20px",
                        border: "5px solid #fbbf24",
                        boxShadow: "0 0 40px rgba(251, 191, 36, 0.5)"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "180px",
                      height: "180px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "5rem",
                      marginBottom: "20px",
                      margin: "0 auto 20px",
                      border: "5px solid #fbbf24",
                      boxShadow: "0 0 40px rgba(251, 191, 36, 0.5)"
                    }}>
                      🎤
                    </div>
                  )}

                  <div style={{
                    fontSize: "1.3rem",
                    color: "#fbbf24",
                    fontWeight: "700",
                    marginBottom: "16px",
                    textShadow: "0 0 15px rgba(251, 191, 36, 0.6)"
                  }}>
                    👋 תתחיל לחמם את הקול! 🎵
                  </div>

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
            </div>

            {/* QR Code for WhatsApp */}
            <div style={{
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
            </div>

            {/* QR Code for Website */}
            <div style={{
                background: "rgba(15, 23, 42, 0.3)",
                borderRadius: "30px",
                padding: "40px 30px",
                border: "2px solid rgba(139, 92, 246, 0.3)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 40px rgba(139, 92, 246, 0.15)",
                backdropFilter: "blur(30px)"
              }}
            >
              <div style={{ 
                fontSize: "1.8rem", 
                color: "#a78bfa", 
                marginBottom: "25px",
                fontWeight: "800",
                textShadow: "0 0 20px rgba(139, 92, 246, 0.6)"
              }}>
                🎤 הירשמו לתור
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
                boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)",
                border: "4px solid #a78bfa"
              }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin)}`}
                  alt="QR Code Website"
                  style={{ width: "200px", height: "200px" }}
                />
              </div>

              <div style={{ 
                fontSize: "1.3rem", 
                color: "#cbd5e1",
                fontWeight: "700",
                marginBottom: "10px"
              }}>
                סרקו להרשמה
              </div>
              <div style={{
                fontSize: "1rem",
                color: "#94a3b8",
                fontWeight: "600"
              }}>
                כניסה ישירה לאתר
              </div>
            </div>

            {/* QR Code for TikTok */}
            <div style={{
                background: "rgba(15, 23, 42, 0.3)",
                borderRadius: "30px",
                padding: "40px 30px",
                border: "2px solid rgba(255, 0, 80, 0.3)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 40px rgba(255, 0, 80, 0.15)",
                backdropFilter: "blur(30px)"
              }}
            >
              <div style={{ 
                fontSize: "1.8rem", 
                color: "#ff0050", 
                marginBottom: "25px",
                fontWeight: "800",
                textShadow: "0 0 20px rgba(255, 0, 80, 0.6)"
              }}>
                🎵 עקבו בטיקטוק
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
                boxShadow: "0 0 30px rgba(255, 0, 80, 0.3)",
                border: "4px solid #ff0050"
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.tiktok.com/@apiryon.club"
                  alt="QR Code TikTok"
                  style={{ width: "200px", height: "200px" }}
                />
              </div>

              <div style={{ 
                fontSize: "1.3rem", 
                color: "#cbd5e1",
                fontWeight: "700",
                marginBottom: "10px"
              }}>
                סרקו למעקב
              </div>
              <div style={{
                fontSize: "1rem",
                color: "#94a3b8",
                fontWeight: "600"
              }}>
                תראו את עצמכם בסרטונים! 📸
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

Audience.isPublic = true;