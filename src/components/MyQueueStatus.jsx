import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Trash2, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MyQueueStatus({ requests, onRequestDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const userEmail = localStorage.getItem('apiryon_user_email');
  
  if (!userEmail) return null;

  const myRequests = requests.filter(r => r.email === userEmail);
  const waitingRequests = requests.filter(r => r.status === 'waiting');
  const performingRequest = requests.find(r => r.status === 'performing');
  
  // בדיקה אם יש לי בקשה שממתינה
  const myWaitingRequest = myRequests.find(r => r.status === 'waiting');
  const myPerformingRequest = myRequests.find(r => r.status === 'performing');
  
  if (!myWaitingRequest && !myPerformingRequest) return null;

  // חישוב מיקום בתור
  const myPosition = waitingRequests.findIndex(r => r.id === myWaitingRequest?.id);
  const totalWaiting = waitingRequests.length;

  // חישוב זמן משוער (ממוצע 3 דקות לשיר)
  const estimatedMinutes = myPosition >= 0 ? (myPosition + 1) * 3 : 0;

  const handleDelete = async () => {
    if (!myWaitingRequest) return;
    
    const confirmed = window.confirm('בטוח שאתה רוצה לבטל את התור? לא תוכל לחזור!');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await base44.entities.KaraokeRequest.delete(myWaitingRequest.id);
      localStorage.removeItem('apiryon_user_email');
      if (onRequestDeleted) onRequestDeleted();
    } catch (error) {
      alert('שגיאה בביטול התור, נסה שוב');
    }
    setIsDeleting(false);
  };

  // אם אני מבצע עכשיו
  if (myPerformingRequest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "20px",
          border: "2px solid rgba(16, 185, 129, 0.5)",
          boxShadow: "0 0 40px rgba(16, 185, 129, 0.3)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            fontSize: "2rem"
          }}
        >
          🎤
        </motion.div>

        <div style={{ textAlign: "center" }}>
          <CheckCircle className="w-16 h-16 mx-auto mb-3" style={{ color: "#10b981" }} />
          <div style={{
            fontSize: "1.8rem",
            fontWeight: "900",
            color: "#10b981",
            marginBottom: "8px",
            textShadow: "0 0 20px rgba(16, 185, 129, 0.6)"
          }}>
            🎉 התור שלך הגיע! 🎉
          </div>
          <div style={{
            fontSize: "1.3rem",
            color: "#e2e8f0",
            fontWeight: "600"
          }}>
            אתה על הבמה עכשיו - בהצלחה!
          </div>
        </div>
      </motion.div>
    );
  }

  // אם אני ממתין בתור
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(10, 25, 41, 0.98))",
        borderRadius: "24px",
        padding: "24px",
        marginBottom: "20px",
        border: "2px solid rgba(0, 202, 255, 0.3)",
        boxShadow: "0 10px 50px rgba(0, 202, 255, 0.2), 0 0 80px rgba(0, 136, 255, 0.1)",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Animated glow background */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 30% 20%, rgba(0, 202, 255, 0.08) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px"
        }}>
          <div style={{
            fontSize: "1.4rem",
            fontWeight: "900",
            color: "#00caff",
            textShadow: "0 0 20px rgba(0, 202, 255, 0.6)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📋
            </motion.span>
            התור שלי
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="בטל את התור שלי"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "12px",
              padding: "10px 16px",
              color: "#ef4444",
              cursor: isDeleting ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: isDeleting ? 0.5 : 1,
              transition: "all 0.2s",
              boxShadow: "0 4px 15px rgba(239, 68, 68, 0.2)"
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.25))";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>בטל תור</span>
          </button>
        </div>

        {/* מיקום בתור - Card גדול ומרשים */}
        <div style={{
          background: "linear-gradient(135deg, rgba(0, 202, 255, 0.15), rgba(0, 136, 255, 0.1))",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "16px",
          border: "1px solid rgba(0, 202, 255, 0.3)",
          boxShadow: "inset 0 0 40px rgba(0, 202, 255, 0.1)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #00caff, #0088ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
              }}>
                <Users className="w-6 h-6" style={{ color: "#001a2e" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "2px", fontWeight: "600" }}>
                  המיקום שלך בתור
                </div>
                <div style={{
                  fontSize: "2.5rem",
                  fontWeight: "900",
                  background: "linear-gradient(90deg, #00caff, #0088ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: "1"
                }}>
                  {myPosition + 1}
                </div>
              </div>
            </div>
            <div style={{
              textAlign: "center",
              padding: "12px 20px",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: "14px"
            }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "2px" }}>
                סה"כ ממתינים
              </div>
              <div style={{
                fontSize: "1.8rem",
                fontWeight: "800",
                color: "#cbd5e1"
              }}>
                {totalWaiting}
              </div>
            </div>
          </div>

          {/* התקדמות ויזואלית משופרת */}
          <div style={{
            background: "rgba(0, 0, 0, 0.4)",
            borderRadius: "14px",
            height: "16px",
            overflow: "hidden",
            position: "relative",
            boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)"
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${((totalWaiting - myPosition) / totalWaiting) * 100}%` 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                background: "linear-gradient(90deg, #00caff 0%, #0088ff 50%, #00d4ff 100%)",
                height: "100%",
                borderRadius: "14px",
                boxShadow: "0 0 20px rgba(0, 202, 255, 0.6)",
                position: "relative"
              }}
            >
              <motion.div
                animate={{
                  x: ["-100%", "200%"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "50%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)"
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* זמן משוער */}
        <div style={{
          background: "linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(245, 158, 11, 0.08))",
          borderRadius: "20px",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          border: "1px solid rgba(251, 191, 36, 0.25)",
          boxShadow: "0 4px 20px rgba(251, 191, 36, 0.15)"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 25px rgba(251, 191, 36, 0.5)"
          }}>
            <Clock className="w-6 h-6" style={{ color: "#001a2e" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "4px", fontWeight: "600" }}>
              זמן משוער עד התור שלך
            </div>
            <div style={{
              fontSize: "1.8rem",
              fontWeight: "900",
              color: "#fbbf24",
              textShadow: "0 0 15px rgba(251, 191, 36, 0.4)"
            }}>
              ~{estimatedMinutes} דקות
            </div>
          </div>
        </div>

        {/* התראות */}
        {myPosition <= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: "16px",
              padding: "16px",
              background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15))",
              border: "2px solid rgba(251, 191, 36, 0.5)",
              borderRadius: "16px",
              textAlign: "center",
              boxShadow: "0 0 30px rgba(251, 191, 36, 0.2)"
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 10px rgba(251, 191, 36, 0.4)",
                  "0 0 20px rgba(251, 191, 36, 0.6)",
                  "0 0 10px rgba(251, 191, 36, 0.4)"
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: "#fbbf24"
              }}
            >
              ⚠️ התור שלך מתקרב - התכונן! ⚠️
            </motion.div>
          </motion.div>
        )}

        {/* פרטי השיר */}
        <div style={{
          marginTop: "20px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(0, 202, 255, 0.2)"
        }}>
          <div style={{ 
            fontSize: "0.8rem", 
            color: "#64748b", 
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: "700"
          }}>
            🎵 השיר שלך
          </div>
          <div style={{
            background: "rgba(0, 202, 255, 0.08)",
            borderRadius: "14px",
            padding: "16px",
            border: "1px solid rgba(0, 202, 255, 0.2)"
          }}>
            <div style={{
              fontSize: "1.2rem",
              fontWeight: "800",
              color: "#e2e8f0",
              marginBottom: "6px"
            }}>
              {myWaitingRequest.song_title}
            </div>
            {myWaitingRequest.song_artist && (
              <div style={{ 
                fontSize: "1rem", 
                color: "#94a3b8",
                fontWeight: "600"
              }}>
                {myWaitingRequest.song_artist}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}