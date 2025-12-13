import React, { useState } from "react";
import NavigationMenu from "../components/NavigationMenu";
import ApyironLogo from "../components/ApyironLogo";
import AudioWave from "../components/AudioWave";
import EventSummaryModal from "../components/EventSummaryModal";
import FloatingMessages from "../components/FloatingMessages";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function Audience() {
  const [showSummary, setShowSummary] = useState(false);

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 5000,
    staleTime: 4000,
  });

  const current = requests.find(r => r.status === "performing");
  const next = requests.filter(r => r.status === "waiting")[0];

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#fff",
      position: "relative"
    }}>
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
          @keyframes shimmer {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* Top Banner with Logo Background */}
        <div style={{
          position: "relative",
          width: "100%",
          padding: "10px 20px 15px",
          marginBottom: "10px",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(0, 202, 255, 0.05) 0%, transparent 100%)"
        }}>
          {/* Stretched Logo Background */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(3)",
            opacity: 0.04,
            pointerEvents: "none",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 0
          }}>
            <ApyironLogo size="large" showCircle={false} />
          </div>

          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center"
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                display: "inline-block",
                fontSize: "clamp(1.2rem, 3vw, 2rem)",
                marginBottom: "5px"
              }}
            >
              🎵
            </motion.div>
            
            <div style={{
              fontSize: "clamp(1.2rem, 2.8vw, 2rem)",
              fontWeight: "900",
              background: "linear-gradient(90deg, #00caff 0%, #0088ff 25%, #00d4ff 50%, #0088ff 75%, #00caff 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
              letterSpacing: "0.02em",
              lineHeight: "1.3",
              textShadow: "0 0 80px rgba(0, 202, 255, 0.5)",
              filter: "drop-shadow(0 0 30px rgba(0, 202, 255, 0.6))"
            }}>
              המוזיקה שלנו, השירה שלכם
            </div>

            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [-5, 5, -5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                display: "inline-block",
                fontSize: "clamp(1.2rem, 3vw, 2rem)",
                marginTop: "3px"
              }}
            >
              🎤
            </motion.div>
          </motion.div>
        </div>

        <main role="main" style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "flex-start",
          padding: "0 15px 15px",
          width: "100%"
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
                maxWidth: "850px",
                marginBottom: "12px",
                position: "relative"
              }}
            >
              <div style={{
                background: "rgba(15, 23, 42, 0.3)",
                borderRadius: "20px",
                padding: "15px 12px",
                textAlign: "center",
                position: "relative",
                backdropFilter: "blur(30px)",
                border: "2px solid rgba(0, 202, 255, 0.3)",
                boxShadow: "0 0 50px rgba(0, 202, 255, 0.3), inset 0 0 25px rgba(0, 202, 255, 0.05)",
                overflow: "hidden"
              }}>
                <FloatingMessages messages={requests} isPerforming={!!current} />
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ 
                    fontSize: "1rem", 
                    color: "#00caff", 
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                    fontWeight: "900",
                    textShadow: "0 0 25px rgba(0, 202, 255, 1), 0 0 50px rgba(0, 202, 255, 0.5)",
                    position: "relative",
                    zIndex: 10
                  }}
                >
                  🎤 LIVE NOW 🎤
                </motion.div>

                <div style={{ 
                  position: "relative",
                  display: "inline-block",
                  marginBottom: "10px",
                  zIndex: 10
                }}>
                  {current.photo_url ? (
                    <img 
                      src={current.photo_url} 
                      alt={`תמונת פרופיל של ${current.singer_name}`}
                      role="img"
                      aria-label={`${current.singer_name} מבצע כעת על הבמה`}
                      style={{
                        width: "110px",
                        height: "110px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "4px solid #00caff",
                        animation: "glow 2s ease-in-out infinite",
                        position: "relative",
                        zIndex: 1
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "110px",
                      height: "110px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #00caff, #0088ff)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "3.5rem",
                      border: "4px solid #00caff",
                      animation: "glow 2s ease-in-out infinite"
                    }}>
                      🎤
                    </div>
                  )}
                </div>

                <div style={{ 
                  fontSize: "clamp(1.5rem, 3.5vw, 2.3rem)", 
                  fontWeight: "900", 
                  marginBottom: "8px",
                  color: "#ffffff",
                  textShadow: "0 0 25px rgba(0, 202, 255, 0.6), 0 5px 18px rgba(0, 0, 0, 0.8)",
                  lineHeight: "1.1",
                  position: "relative",
                  zIndex: 10
                }}>
                  {current.singer_name}
                </div>

                <div style={{ 
                  fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)", 
                  color: "#e2e8f0",
                  fontWeight: "700",
                  marginBottom: "6px",
                  textShadow: "0 3px 8px rgba(0, 0, 0, 0.5)",
                  position: "relative",
                  zIndex: 10
                }}>
                  {current.song_title}
                </div>

                {current.song_artist && (
                  <div style={{ 
                    fontSize: "clamp(0.85rem, 1.6vw, 1.1rem)", 
                    color: "#94a3b8",
                    fontWeight: "600",
                    position: "relative",
                    zIndex: 10
                  }}>
                    {current.song_artist}
                  </div>
                )}

                <div style={{ marginTop: "10px", position: "relative", zIndex: 10 }}>
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
                width: "100%",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Background Logo - Transparent */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.08,
                pointerEvents: "none",
                zIndex: 0
              }}>
                <ApyironLogo size="large" showCircle={true} />
              </div>

              {/* Content on top */}
              <div style={{ position: "relative", zIndex: 1 }}>
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
              </div>
            </motion.div>
          )}

          {/* Next Singer */}
          <div style={{
            width: "100%",
            maxWidth: "850px",
            marginBottom: "12px"
          }}>
            <div style={{
                background: "rgba(15, 23, 42, 0.3)",
                borderRadius: "18px",
                padding: "15px 12px",
                border: "2px solid rgba(251, 191, 36, 0.5)",
                textAlign: "center",
                boxShadow: "0 8px 30px rgba(251, 191, 36, 0.3)",
                backdropFilter: "blur(30px)"
              }}>
              <div style={{ 
                fontSize: "1.1rem", 
                color: "#fbbf24", 
                marginBottom: "10px",
                fontWeight: "800",
                textShadow: "0 0 18px rgba(251, 191, 36, 0.7)"
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
                        width: "90px",
                        height: "90px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: "8px",
                        border: "3px solid #fbbf24",
                        boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "90px",
                      height: "90px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.8rem",
                      marginBottom: "8px",
                      margin: "0 auto 8px",
                      border: "3px solid #fbbf24",
                      boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)"
                    }}>
                      🎤
                    </div>
                  )}

                  <div style={{ 
                    fontSize: "1.4rem", 
                    fontWeight: "900", 
                    marginBottom: "5px",
                    color: "#ffffff",
                    textShadow: "0 0 20px rgba(251, 191, 36, 0.5)"
                  }}>
                    {next.singer_name}
                  </div>
                  <div style={{ 
                    fontSize: "1.1rem", 
                    color: "#cbd5e1",
                    fontWeight: "700"
                  }}>
                    {next.song_title}
                  </div>
                  {next.song_artist && (
                    <div style={{ 
                      fontSize: "0.9rem", 
                      color: "#94a3b8", 
                      marginTop: "4px" 
                    }}>
                      {next.song_artist}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ 
                  color: "#64748b", 
                  fontSize: "1rem", 
                  padding: "20px 15px",
                  fontWeight: "600"
                }}>
                  אין ממתינים כרגע
                </div>
              )}
            </div>
          </div>

          {/* QR Codes Row */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", 
            gap: "12px",
            width: "100%",
            maxWidth: "850px"
          }}>
            {/* QR Code for WhatsApp */}
            <div style={{
                background: "rgba(15, 23, 42, 0.3)",
                borderRadius: "16px",
                padding: "12px 10px",
                border: "2px solid rgba(0, 202, 255, 0.3)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 25px rgba(0, 202, 255, 0.15)",
                backdropFilter: "blur(30px)"
              }}
            >
              <div style={{ 
                fontSize: "0.95rem", 
                color: "#00caff", 
                marginBottom: "8px",
                fontWeight: "700",
                textShadow: "0 0 12px rgba(0, 202, 255, 0.6)"
              }}>
                💬 הצטרפו לקבוצה
              </div>

              <div style={{
                width: "100px",
                height: "100px",
                background: "#fff",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "8px",
                boxShadow: "0 0 15px rgba(0, 202, 255, 0.3)",
                border: "2px solid #00caff"
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
                  alt="QR Code WhatsApp"
                  style={{ width: "90px", height: "90px" }}
                />
              </div>

              <div style={{ 
                fontSize: "0.75rem", 
                color: "#cbd5e1",
                fontWeight: "600"
              }}>
                עדכונים על ערבי קריוקי
              </div>
            </div>

            {/* QR Code for TikTok */}
            <div style={{
                background: "rgba(15, 23, 42, 0.3)",
                borderRadius: "16px",
                padding: "12px 10px",
                border: "2px solid rgba(255, 0, 80, 0.3)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 25px rgba(255, 0, 80, 0.15)",
                backdropFilter: "blur(30px)"
              }}
            >
              <div style={{ 
                fontSize: "0.95rem", 
                color: "#ff0050", 
                marginBottom: "8px",
                fontWeight: "700",
                textShadow: "0 0 12px rgba(255, 0, 80, 0.6)"
              }}>
                🎵 עקבו בטיקטוק
              </div>

              <div style={{
                width: "100px",
                height: "100px",
                background: "#fff",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "8px",
                boxShadow: "0 0 15px rgba(255, 0, 80, 0.3)",
                border: "2px solid #ff0050"
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https://www.tiktok.com/@apiryon.club"
                  alt="QR Code TikTok"
                  style={{ width: "90px", height: "90px" }}
                />
              </div>

              <div style={{ 
                fontSize: "0.75rem", 
                color: "#cbd5e1",
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