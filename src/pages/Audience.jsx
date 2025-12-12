import React from "react";
import NavigationMenu from "../components/NavigationMenu";
import ApyironLogo from "../components/ApyironLogo";
import AudioWave from "../components/AudioWave";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function Audience() {
  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 2000,
  });

  const current = requests.find(r => r.status === "performing");
  const next = requests.filter(r => r.status === "waiting")[0];

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#fff",
      padding: "20px",
      position: "relative",
      overflow: "hidden"
    }}>
      <NavigationMenu />
      
      {/* Animated background effects */}
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
          0%, 100% { box-shadow: 0 0 40px rgba(0, 202, 255, 0.4), 0 0 80px rgba(0, 202, 255, 0.2); }
          50% { box-shadow: 0 0 60px rgba(0, 202, 255, 0.6), 0 0 120px rgba(0, 202, 255, 0.3); }
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* Logo at top */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
          <ApyironLogo size="large" showCircle={true} />
        </div>

        {/* Current Song - HERO SECTION */}
        {current ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              borderRadius: "40px",
              padding: "80px 60px",
              marginBottom: "50px",
              border: "3px solid #00caff",
              textAlign: "center",
              position: "relative",
              animation: "glow 3s ease-in-out infinite",
              backdropFilter: "blur(20px)"
            }}
          >
            {/* Decorative corners */}
            <div style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "60px",
              height: "60px",
              borderTop: "4px solid #00caff",
              borderRight: "4px solid #00caff",
              borderRadius: "8px"
            }} />
            <div style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              width: "60px",
              height: "60px",
              borderTop: "4px solid #00caff",
              borderLeft: "4px solid #00caff",
              borderRadius: "8px"
            }} />
            <div style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              width: "60px",
              height: "60px",
              borderBottom: "4px solid #00caff",
              borderRight: "4px solid #00caff",
              borderRadius: "8px"
            }} />
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              width: "60px",
              height: "60px",
              borderBottom: "4px solid #00caff",
              borderLeft: "4px solid #00caff",
              borderRadius: "8px"
            }} />

            <div style={{ 
              fontSize: "2rem", 
              color: "#00caff", 
              marginBottom: "30px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: "800",
              textShadow: "0 0 30px rgba(0, 202, 255, 0.8)"
            }}>
              🎤 שר עכשיו על הבמה 🎤
            </div>

            <div style={{ marginBottom: "40px" }}>
              <AudioWave isPlaying={true} />
            </div>
            
            {current.photo_url && (
              <motion.img 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                src={current.photo_url} 
                alt={current.singer_name}
                style={{
                  width: "250px",
                  height: "250px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "40px",
                  border: "8px solid #00caff",
                  boxShadow: "0 0 60px rgba(0, 202, 255, 0.6)",
                  animation: "float 4s ease-in-out infinite"
                }}
              />
            )}

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ 
                fontSize: "5rem", 
                fontWeight: "900", 
                marginBottom: "30px",
                color: "#ffffff",
                textShadow: "0 0 40px rgba(0, 202, 255, 0.5), 0 4px 20px rgba(0, 0, 0, 0.5)",
                lineHeight: "1.2"
              }}
            >
              {current.singer_name}
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ 
                fontSize: "3rem", 
                color: "#e2e8f0",
                fontWeight: "700",
                marginBottom: "15px",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"
              }}
            >
              {current.song_title}
            </motion.div>

            {current.song_artist && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ 
                  fontSize: "2rem", 
                  color: "#94a3b8",
                  fontWeight: "600"
                }}
              >
                {current.song_artist}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div style={{
            background: "rgba(15, 23, 42, 0.8)",
            borderRadius: "30px",
            padding: "80px 40px",
            marginBottom: "50px",
            border: "2px dashed #00caff",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🎵</div>
            <div style={{ fontSize: "2.5rem", color: "#00caff", fontWeight: "700" }}>
              בקרוב... הזמר הבא יעלה לבמה!
            </div>
          </div>
        )}

        {/* Top Stars of the Night */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            borderRadius: "30px",
            padding: "40px",
            marginBottom: "40px",
            border: "2px solid rgba(251, 191, 36, 0.5)",
            boxShadow: "0 10px 40px rgba(251, 191, 36, 0.2)"
          }}
        >
          <div style={{
            fontSize: "2.2rem",
            color: "#fbbf24",
            textAlign: "center",
            marginBottom: "30px",
            fontWeight: "800",
            textShadow: "0 0 20px rgba(251, 191, 36, 0.6)"
          }}>
            🌟 כוכבי הערב 🌟
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: window.innerWidth > 700 ? "repeat(3, 1fr)" : "1fr",
            gap: "25px"
          }}>
            {requests
              .filter(r => r.status === "done" && r.average_rating > 0)
              .sort((a, b) => b.average_rating - a.average_rating)
              .slice(0, 3)
              .map((singer, index) => (
                <div
                  key={singer.id}
                  style={{
                    background: index === 0 
                      ? "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))"
                      : "rgba(30, 41, 59, 0.5)",
                    borderRadius: "20px",
                    padding: "25px",
                    textAlign: "center",
                    border: index === 0 ? "3px solid #fbbf24" : "2px solid rgba(251, 191, 36, 0.3)",
                    position: "relative"
                  }}
                >
                  {index === 0 && (
                    <div style={{
                      position: "absolute",
                      top: "-15px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "2.5rem"
                    }}>
                      👑
                    </div>
                  )}
                  <div style={{
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    color: "#fbbf24",
                    marginBottom: "10px"
                  }}>
                    #{index + 1}
                  </div>
                  {singer.photo_url && (
                    <img
                      src={singer.photo_url}
                      alt={singer.singer_name}
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: "15px",
                        border: "4px solid #fbbf24",
                        boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)"
                      }}
                    />
                  )}
                  <div style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    color: "#ffffff",
                    marginBottom: "8px"
                  }}>
                    {singer.singer_name}
                  </div>
                  <div style={{
                    fontSize: "1.1rem",
                    color: "#cbd5e1",
                    marginBottom: "10px"
                  }}>
                    {singer.song_title}
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "1.4rem",
                    color: "#fbbf24",
                    fontWeight: "700"
                  }}>
                    ⭐ {singer.average_rating.toFixed(1)}
                  </div>
                </div>
              ))}
          </div>
          {requests.filter(r => r.status === "done" && r.average_rating > 0).length === 0 && (
            <div style={{
              textAlign: "center",
              color: "#64748b",
              fontSize: "1.4rem",
              padding: "40px"
            }}>
              הערב עדיין מתחיל... כוכבים בדרך! ⭐
            </div>
          )}
        </motion.div>

        {/* Song of the Night */}
        {(() => {
          const topSong = requests
            .filter(r => r.status === "done" && r.average_rating > 0)
            .sort((a, b) => b.average_rating - a.average_rating)[0];
          
          return topSong && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(167, 139, 250, 0.2))",
                borderRadius: "30px",
                padding: "40px",
                marginBottom: "40px",
                border: "3px solid #a78bfa",
                textAlign: "center",
                boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)"
              }}
            >
              <div style={{
                fontSize: "2.2rem",
                color: "#a78bfa",
                marginBottom: "25px",
                fontWeight: "800",
                textShadow: "0 0 20px rgba(139, 92, 246, 0.6)"
              }}>
                🎯 שיר האהוב של הערב 🎯
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "30px",
                flexWrap: "wrap"
              }}>
                {topSong.photo_url && (
                  <img
                    src={topSong.photo_url}
                    alt={topSong.singer_name}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "5px solid #a78bfa",
                      boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)"
                    }}
                  />
                )}
                <div style={{ textAlign: window.innerWidth > 700 ? "right" : "center" }}>
                  <div style={{
                    fontSize: "2rem",
                    fontWeight: "900",
                    color: "#ffffff",
                    marginBottom: "8px"
                  }}>
                    {topSong.song_title}
                  </div>
                  {topSong.song_artist && (
                    <div style={{
                      fontSize: "1.5rem",
                      color: "#cbd5e1",
                      marginBottom: "8px"
                    }}>
                      {topSong.song_artist}
                    </div>
                  )}
                  <div style={{
                    fontSize: "1.3rem",
                    color: "#a78bfa",
                    fontWeight: "700",
                    marginBottom: "10px"
                  }}>
                    ביצוע: {topSong.singer_name}
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: window.innerWidth > 700 ? "flex-start" : "center",
                    gap: "8px",
                    fontSize: "1.6rem",
                    color: "#fbbf24",
                    fontWeight: "700"
                  }}>
                    ⭐ {topSong.average_rating.toFixed(1)}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Bottom Section: Next + QR */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: window.innerWidth > 900 ? "1fr 1fr" : "1fr", 
          gap: "40px" 
        }}>
          
          {/* Next Singer */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              borderRadius: "30px",
              padding: "50px 40px",
              border: "2px solid rgba(0, 202, 255, 0.5)",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0, 202, 255, 0.2)"
            }}
          >
            <div style={{ 
              fontSize: "2.2rem", 
              color: "#00caff", 
              marginBottom: "35px",
              fontWeight: "800",
              textShadow: "0 0 20px rgba(0, 202, 255, 0.6)"
            }}>
              ⏭️ הבא בתור
            </div>
            
            {next ? (
              <>
                {next.photo_url && (
                  <img 
                    src={next.photo_url} 
                    alt={next.singer_name}
                    style={{
                      width: "180px",
                      height: "180px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "25px",
                      border: "5px solid #00caff",
                      boxShadow: "0 0 30px rgba(0, 202, 255, 0.4)"
                    }}
                  />
                )}
                <div style={{ 
                  fontSize: "2.5rem", 
                  fontWeight: "900", 
                  marginBottom: "15px",
                  color: "#ffffff"
                }}>
                  {next.singer_name}
                </div>
                <div style={{ 
                  fontSize: "1.8rem", 
                  color: "#cbd5e1",
                  fontWeight: "600"
                }}>
                  {next.song_title}
                </div>
                {next.song_artist && (
                  <div style={{ 
                    fontSize: "1.4rem", 
                    color: "#94a3b8", 
                    marginTop: "10px" 
                  }}>
                    {next.song_artist}
                  </div>
                )}
              </>
            ) : (
              <div style={{ 
                color: "#64748b", 
                fontSize: "1.8rem", 
                padding: "60px 20px",
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
            transition={{ delay: 0.5 }}
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              borderRadius: "30px",
              padding: "50px 40px",
              border: "2px solid rgba(0, 202, 255, 0.5)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 40px rgba(0, 202, 255, 0.2)"
            }}
          >
            <div style={{ 
              fontSize: "2.2rem", 
              color: "#00caff", 
              marginBottom: "30px",
              fontWeight: "800",
              textShadow: "0 0 20px rgba(0, 202, 255, 0.6)"
            }}>
              💬 הצטרפו לקבוצת הווצאפ
            </div>
            
            <div style={{
              width: "280px",
              height: "280px",
              background: "#fff",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "25px",
              boxShadow: "0 0 40px rgba(0, 202, 255, 0.3)",
              border: "4px solid #00caff"
            }}>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
                alt="QR Code WhatsApp"
                style={{ width: "260px", height: "260px" }}
              />
            </div>
            
            <div style={{ 
              fontSize: "1.6rem", 
              color: "#cbd5e1",
              fontWeight: "700",
              marginBottom: "15px"
            }}>
              סרקו להצטרפות מהירה
            </div>
            <div style={{
              fontSize: "1.2rem",
              color: "#94a3b8",
              fontWeight: "600"
            }}>
              התעדכנו בכל ערבי הקריוקי!
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

Audience.isPublic = true;