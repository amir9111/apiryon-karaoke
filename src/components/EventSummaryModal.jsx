import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Star } from "lucide-react";

export default function EventSummaryModal({ isOpen, onClose, requests }) {
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      import('canvas-confetti').then(confetti => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      });
    }
  }, [isOpen]);

  const topSingers = requests
    .filter(r => r.status === "done" && r.average_rating > 0)
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 3);

  const topSong = requests
    .filter(r => r.status === "done" && r.average_rating > 0)
    .sort((a, b) => b.average_rating - a.average_rating)[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflow: "auto"
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 25, 41, 0.98) 100%)",
              borderRadius: "30px",
              padding: "40px",
              maxWidth: "1200px",
              width: "100%",
              border: "3px solid rgba(0, 202, 255, 0.5)",
              boxShadow: "0 0 100px rgba(0, 202, 255, 0.4)",
              position: "relative"
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(248, 113, 113, 0.2)",
                border: "2px solid rgba(248, 113, 113, 0.4)",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#f87171"
              }}
            >
              <X className="w-6 h-6" />
            </button>

            <h1 style={{
              fontSize: "3rem",
              fontWeight: "900",
              textAlign: "center",
              color: "#fbbf24",
              textShadow: "0 0 40px rgba(251, 191, 36, 0.6)",
              marginBottom: "50px"
            }}>
              🎉 סיכום הערב 🎉
            </h1>

            {/* Top 3 Singers */}
            <div style={{ marginBottom: "50px" }}>
              <h2 style={{
                fontSize: "2rem",
                fontWeight: "800",
                textAlign: "center",
                color: "#00caff",
                marginBottom: "30px"
              }}>
                🌟 כוכבי הערב 🌟
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth > 800 ? "repeat(3, 1fr)" : "1fr",
                gap: "30px"
              }}>
                {topSingers.map((singer, index) => (
                  <motion.div
                    key={singer.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    style={{
                      background: index === 0 
                        ? "linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))"
                        : "rgba(30, 41, 59, 0.6)",
                      borderRadius: "25px",
                      padding: "30px",
                      textAlign: "center",
                      border: index === 0 ? "4px solid #fbbf24" : "3px solid rgba(251, 191, 36, 0.3)",
                      position: "relative",
                      boxShadow: index === 0 ? "0 0 50px rgba(251, 191, 36, 0.4)" : "none"
                    }}
                  >
                    {index === 0 && (
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          position: "absolute",
                          top: "-25px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "3rem"
                        }}
                      >
                        👑
                      </motion.div>
                    )}
                    <Trophy
                      className="w-12 h-12 mx-auto mb-4"
                      style={{ color: index === 0 ? "#fbbf24" : index === 1 ? "#94a3b8" : "#cd7f32" }}
                    />
                    <div style={{
                      fontSize: "2.5rem",
                      fontWeight: "900",
                      color: "#fbbf24",
                      marginBottom: "15px"
                    }}>
                      #{index + 1}
                    </div>
                    {singer.photo_url && (
                      <img
                        src={singer.photo_url}
                        alt={singer.singer_name}
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginBottom: "20px",
                          border: "5px solid #fbbf24",
                          boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)"
                        }}
                      />
                    )}
                    <div style={{
                      fontSize: "1.8rem",
                      fontWeight: "900",
                      color: "#ffffff",
                      marginBottom: "10px"
                    }}>
                      {singer.singer_name}
                    </div>
                    <div style={{
                      fontSize: "1.2rem",
                      color: "#cbd5e1",
                      marginBottom: "15px"
                    }}>
                      {singer.song_title}
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      fontSize: "1.8rem",
                      color: "#fbbf24",
                      fontWeight: "700"
                    }}>
                      <Star className="w-7 h-7" fill="#fbbf24" />
                      {singer.average_rating.toFixed(1)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Top Song */}
            {topSong && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(167, 139, 250, 0.3))",
                  borderRadius: "25px",
                  padding: "40px",
                  border: "4px solid #a78bfa",
                  textAlign: "center",
                  boxShadow: "0 0 50px rgba(139, 92, 246, 0.4)"
                }}
              >
                <h2 style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  color: "#a78bfa",
                  marginBottom: "25px",
                  textShadow: "0 0 20px rgba(139, 92, 246, 0.6)"
                }}>
                  🎯 שיר האהוב של הערב 🎯
                </h2>
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
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "6px solid #a78bfa",
                        boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)"
                      }}
                    />
                  )}
                  <div style={{ textAlign: typeof window !== 'undefined' && window.innerWidth > 700 ? "right" : "center" }}>
                    <div style={{
                      fontSize: "2.5rem",
                      fontWeight: "900",
                      color: "#ffffff",
                      marginBottom: "10px"
                    }}>
                      {topSong.song_title}
                    </div>
                    {topSong.song_artist && (
                      <div style={{
                        fontSize: "1.8rem",
                        color: "#cbd5e1",
                        marginBottom: "10px"
                      }}>
                        {topSong.song_artist}
                      </div>
                    )}
                    <div style={{
                      fontSize: "1.5rem",
                      color: "#a78bfa",
                      fontWeight: "700",
                      marginBottom: "15px"
                    }}>
                      ביצוע: {topSong.singer_name}
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: typeof window !== 'undefined' && window.innerWidth > 700 ? "flex-start" : "center",
                      gap: "10px",
                      fontSize: "2rem",
                      color: "#fbbf24",
                      fontWeight: "700"
                    }}>
                      <Star className="w-8 h-8" fill="#fbbf24" />
                      {topSong.average_rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}