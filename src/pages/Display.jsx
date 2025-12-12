import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function Display() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth <= 850);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 3000,
  });

  if (isLoading) {
    return (
      <div dir="rtl" style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", color: "#f1f5f9", minHeight: "100vh", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#00caff" }}>טוען...</div>
      </div>
    );
  }

  const now = requests.filter(r => r.status === "performing");
  const waiting = requests.filter(r => r.status === "waiting");
  const done = requests.filter(r => r.status === "done");
  
  const currentSong = requests.find(r => r.status === "performing");
  const waitingList = requests.filter(r => r.status === "waiting");

  return (
    <div dir="rtl" style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", color: "#f1f5f9", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#00caff", textShadow: "0 0 40px rgba(0, 202, 255, 0.8)", fontWeight: "900", letterSpacing: "0.05em" }}>
              🎤 מועדון האפריון 🎤
            </h1>
            <p style={{ margin: "12px 0 0", fontSize: "clamp(1rem, 2vw, 1.3rem)", color: "#e2e8f0", fontWeight: "600" }}>
              ערב קריוקי מטורף • שרים, מדרגים ונהנים
            </p>
          </div>

          {/* Stats Bar */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "16px", 
            flexWrap: "wrap",
            marginBottom: "8px"
          }}>
            <div style={{
              background: "rgba(0, 202, 255, 0.1)",
              border: "1px solid rgba(0, 202, 255, 0.3)",
              borderRadius: "12px",
              padding: "8px 16px",
              boxShadow: "0 0 20px rgba(0, 202, 255, 0.2)"
            }}>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>זמרים הערב</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#00caff" }}>{done.length + now.length}</div>
            </div>
            <div style={{
              background: "rgba(0, 202, 255, 0.1)",
              border: "1px solid rgba(0, 202, 255, 0.3)",
              borderRadius: "12px",
              padding: "8px 16px",
              boxShadow: "0 0 20px rgba(0, 202, 255, 0.2)"
            }}>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>ממתינים</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#00caff" }}>{waiting.length}</div>
            </div>
            <div style={{
              background: "rgba(0, 202, 255, 0.1)",
              border: "1px solid rgba(0, 202, 255, 0.3)",
              borderRadius: "12px",
              padding: "8px 16px",
              boxShadow: "0 0 20px rgba(0, 202, 255, 0.2)"
            }}>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>סה"כ שירים</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#00caff" }}>{requests.length}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "minmax(0, 2fr) minmax(0, 1fr)", gap: "16px", alignItems: "start" }}>
            {/* Now Playing */}
            <div style={{
              background: "radial-gradient(ellipse at top left, rgba(0, 202, 255, 0.15), rgba(2, 6, 23, 0.95) 60%)",
              borderRadius: "24px",
              padding: "clamp(20px, 3vw, 32px)",
              border: "2px solid rgba(0, 202, 255, 0.4)",
              boxShadow: "0 0 60px rgba(0, 202, 255, 0.3), 0 20px 50px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "280px",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at 50% 50%, rgba(0, 202, 255, 0.1) 0%, transparent 50%)",
                animation: "pulse 3s ease-in-out infinite",
                pointerEvents: "none"
              }}></div>

              <div style={{ position: "relative", zIndex: 1 }}>
                {!currentSong ? (
                  <>
                    <div style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: "#00caff", marginBottom: "12px", textAlign: "center", textShadow: "0 0 10px rgba(0, 202, 255, 0.5)" }}>
                      ⏳ ממתינים לזמר הראשון
                    </div>
                    <div style={{ fontSize: "clamp(1.4rem, 2.8vw, 2rem)", fontWeight: "700", marginBottom: "8px", textAlign: "center", color: "#f1f5f9" }}>
                      הבמה מחכה לכם!
                    </div>
                    <div style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)", color: "#cbd5e1", textAlign: "center" }}>
                      לחצו "הבא בתור" להתחיל את המופע 🎭
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: "#00caff", marginBottom: "12px", textAlign: "center", textShadow: "0 0 15px rgba(0, 202, 255, 0.6)" }}>
                      🎤 כרגע על הבמה
                    </div>
                    <div style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: "800", marginBottom: "12px", textAlign: "center", color: "#ffffff", textShadow: "0 0 20px rgba(0, 202, 255, 0.4)" }}>
                      {currentSong.singer_name}
                    </div>
                    <div style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: "#e2e8f0", marginBottom: "8px", textAlign: "center", fontWeight: "600" }}>
                      {currentSong.song_title}
                    </div>
                    {currentSong.song_artist && (
                      <div style={{ fontSize: "clamp(1rem, 1.8vw, 1.3rem)", color: "#94a3b8", textAlign: "center", marginBottom: "16px" }}>
                        {currentSong.song_artist}
                      </div>
                    )}
                    {currentSong.average_rating > 0 && (
                      <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "16px",
                        padding: "12px 20px",
                        background: "rgba(251, 191, 36, 0.1)",
                        borderRadius: "16px",
                        border: "1px solid rgba(251, 191, 36, 0.3)"
                      }}>
                        <div style={{ fontSize: "2rem", color: "#fbbf24" }}>⭐ {currentSong.average_rating.toFixed(1)}</div>
                        <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                          ({currentSong.ratings?.length || 0} דירוגים)
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ 
                background: "rgba(15,23,42,0.96)", 
                borderRadius: "20px", 
                padding: "16px 14px", 
                border: "1px solid rgba(0, 202, 255, 0.3)", 
                boxShadow: "0 0 30px rgba(0, 202, 255, 0.15), 0 12px 40px rgba(0,0,0,0.5)" 
              }}>
                <div style={{ 
                  fontSize: "clamp(1rem, 1.8vw, 1.2rem)", 
                  fontWeight: "700", 
                  marginBottom: "12px",
                  color: "#00caff",
                  textShadow: "0 0 10px rgba(0, 202, 255, 0.4)"
                }}>
                  📋 הבאים בתור
                </div>
                {waitingList.length === 0 ? (
                  <div style={{ 
                    padding: "16px", 
                    borderRadius: "12px",
                    background: "rgba(0, 202, 255, 0.05)",
                    border: "1px dashed rgba(0, 202, 255, 0.3)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "6px" }}>אין כרגע שירים ממתינים</div>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>הצטרפו לתור דרך הטופס 📱</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {waitingList.slice(0, 7).map((r, i) => (
                      <div key={r.id} style={{ 
                        padding: "10px 12px",
                        borderRadius: "12px",
                        background: i === 0 ? "rgba(0, 202, 255, 0.15)" : "rgba(30, 41, 59, 0.5)",
                        border: i === 0 ? "1px solid rgba(0, 202, 255, 0.4)" : "1px solid rgba(51, 65, 85, 0.5)",
                        boxShadow: i === 0 ? "0 0 20px rgba(0, 202, 255, 0.2)" : "none"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "10px"
                        }}>
                          <div style={{
                            minWidth: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: i === 0 ? "linear-gradient(135deg, #00caff, #0088ff)" : "rgba(51, 65, 85, 0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                            color: i === 0 ? "#001a2e" : "#94a3b8",
                            boxShadow: i === 0 ? "0 0 15px rgba(0, 202, 255, 0.4)" : "none"
                          }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontSize: "0.95rem", 
                              fontWeight: "700",
                              color: i === 0 ? "#00caff" : "#f1f5f9",
                              textShadow: i === 0 ? "0 0 10px rgba(0, 202, 255, 0.3)" : "none",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {r.singer_name}
                            </div>
                            <div style={{ 
                              fontSize: "0.8rem", 
                              color: "#94a3b8",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {r.song_title}{r.song_artist ? ` · ${r.song_artist}` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ 
                  marginTop: "16px", 
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(0, 202, 255, 0.08)",
                  border: "2px solid rgba(0, 202, 255, 0.3)",
                  textAlign: "center",
                  boxShadow: "0 0 30px rgba(0, 202, 255, 0.2)"
                }}>
                  <div style={{ fontSize: "4rem", marginBottom: "12px" }}>📱</div>
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: "#00caff", marginBottom: "8px" }}>
                    סרקו להצטרפות לקבוצת הווטסאפ 💬
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                    הצטרפו לקבוצה לעדכונים על ערבים הבאים!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: "16px", 
            fontSize: "0.8rem", 
            color: "#94a3b8", 
            textAlign: "center",
            padding: "12px",
            background: "rgba(0, 202, 255, 0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(0, 202, 255, 0.2)"
          }}>
            💡 טיפ: לחץ F11 למצב מסך מלא להצגה מושלמת
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 0.6; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}