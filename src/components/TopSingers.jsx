import React from "react";
import { Flame, Star, Trophy } from "lucide-react";

export default function TopSingers({ requests }) {
  // Get all done requests with ratings
  const ratedSingers = requests
    .filter(r => r.status === "done" && r.average_rating > 0)
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 10);

  // Group by singer name and calculate their best performance
  const singerStats = {};
  ratedSingers.forEach(req => {
    if (!singerStats[req.singer_name] || singerStats[req.singer_name].average_rating < req.average_rating) {
      singerStats[req.singer_name] = req;
    }
  });

  const topSingers = Object.values(singerStats)
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 5);

  if (topSingers.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "#64748b"
      }}>
        <Trophy className="w-16 h-16" style={{ margin: "0 auto 16px", color: "#00caff", opacity: 0.3 }} />
        <div style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px" }}>
          עדיין אין זמרים מדורגים
        </div>
        <div style={{ fontSize: "0.9rem" }}>
          הזמרים הראשונים שיקבלו דירוג יופיעו כאן!
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{
        textAlign: "center",
        marginBottom: "32px"
      }}>
        <Trophy className="w-16 h-16" style={{ margin: "0 auto 12px", color: "#fbbf24" }} />
        <h2 style={{
          fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
          fontWeight: "900",
          color: "#fbbf24",
          textShadow: "0 0 40px rgba(251, 191, 36, 0.8)",
          marginBottom: "8px"
        }}>
          🏆 הזמרים המובילים 🏆
        </h2>
        <p style={{ fontSize: "1rem", color: "#cbd5e1" }}>
          הביצועים הכי מדהימים של הערב
        </p>
      </div>

      <div style={{
        display: "grid",
        gap: "20px",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {topSingers.map((singer, index) => (
          <div
            key={singer.id}
            style={{
              background: index === 0 
                ? "linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(217, 119, 6, 0.1))"
                : "rgba(15, 23, 42, 0.8)",
              border: index === 0 
                ? "3px solid rgba(251, 191, 36, 0.5)" 
                : "2px solid rgba(0, 202, 255, 0.3)",
              borderRadius: "24px",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
              boxShadow: index === 0
                ? "0 0 60px rgba(251, 191, 36, 0.4)"
                : "0 0 30px rgba(0, 202, 255, 0.2)"
            }}
          >
            {/* Fire animation for top 3 */}
            {index < 3 && (
              <div style={{
                position: "absolute",
                top: "-20px",
                right: "20px",
                animation: "bounce 1s ease-in-out infinite"
              }}>
                <Flame 
                  className="w-12 h-12" 
                  style={{ 
                    color: index === 0 ? "#fbbf24" : index === 1 ? "#f97316" : "#ef4444",
                    filter: "drop-shadow(0 0 10px currentColor)"
                  }} 
                />
              </div>
            )}

            {/* Rank badge */}
            <div style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: index === 0 
                ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                : index === 1
                ? "linear-gradient(135deg, #cbd5e1, #94a3b8)"
                : index === 2
                ? "linear-gradient(135deg, #d97706, #b45309)"
                : "linear-gradient(135deg, #00caff, #0088ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: "900",
              color: index < 3 ? "#0f172a" : "#fff",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)"
            }}>
              {index + 1}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: singer.photo_url ? "120px 1fr" : "1fr",
              gap: "20px",
              alignItems: "center",
              marginTop: index < 3 ? "20px" : "0"
            }}>
              {singer.photo_url && (
                <div style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: index === 0 ? "3px solid #fbbf24" : "2px solid rgba(0, 202, 255, 0.3)",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)"
                }}>
                  <img 
                    src={singer.photo_url} 
                    alt={singer.singer_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </div>
              )}

              <div style={{ paddingLeft: "60px" }}>
                <div style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: "800",
                  color: index === 0 ? "#fbbf24" : "#f1f5f9",
                  textShadow: index === 0 ? "0 0 20px rgba(251, 191, 36, 0.5)" : "none",
                  marginBottom: "8px"
                }}>
                  {singer.singer_name}
                </div>

                <div style={{
                  fontSize: "1rem",
                  color: "#94a3b8",
                  marginBottom: "12px"
                }}>
                  {singer.song_title}
                  {singer.song_artist && <span> • {singer.song_artist}</span>}
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className="w-6 h-6"
                        style={{
                          fill: star <= singer.average_rating ? "#fbbf24" : "transparent",
                          stroke: star <= singer.average_rating ? "#fbbf24" : "#64748b",
                          filter: star <= singer.average_rating ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))" : "none"
                        }}
                      />
                    ))}
                  </div>
                  <div style={{
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    color: "#fbbf24",
                    textShadow: "0 0 15px rgba(251, 191, 36, 0.6)"
                  }}>
                    {singer.average_rating.toFixed(1)}
                  </div>
                </div>

                <div style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  marginTop: "8px"
                }}>
                  {singer.ratings?.length || 0} דירוגים מהקהל
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}