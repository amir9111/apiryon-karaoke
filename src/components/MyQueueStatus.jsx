import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Trash2, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MyQueueStatus({ requests, onRequestDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deviceId = localStorage.getItem('apiryon_device_id');
  
  if (!deviceId) return null;

  const myRequests = requests.filter(r => r.device_id === deviceId);
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
        background: "rgba(15, 23, 42, 0.95)",
        borderRadius: "20px",
        padding: "20px",
        marginBottom: "20px",
        border: "2px solid rgba(0, 202, 255, 0.3)",
        boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)"
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px"
      }}>
        <div style={{
          fontSize: "1.3rem",
          fontWeight: "800",
          color: "#00caff",
          textShadow: "0 0 15px rgba(0, 202, 255, 0.6)"
        }}>
          📋 התור שלי
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="בטל את התור שלי"
          style={{
            background: "rgba(239, 68, 68, 0.2)",
            border: "2px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "10px",
            padding: "8px 12px",
            color: "#ef4444",
            cursor: isDeleting ? "not-allowed" : "pointer",
            fontSize: "0.9rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: isDeleting ? 0.5 : 1
          }}
        >
          <Trash2 className="w-4 h-4" />
          <span>בטל תור</span>
        </button>
      </div>

      {/* מיקום בתור */}
      <div style={{
        background: "rgba(0, 202, 255, 0.1)",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "12px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px"
        }}>
          <Users className="w-6 h-6" style={{ color: "#00caff" }} />
          <div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "4px" }}>
              המיקום שלך בתור
            </div>
            <div style={{
              fontSize: "2rem",
              fontWeight: "900",
              color: "#00caff",
              textShadow: "0 0 20px rgba(0, 202, 255, 0.5)"
            }}>
              {myPosition + 1} / {totalWaiting}
            </div>
          </div>
        </div>

        {/* התקדמות ויזואלית */}
        <div style={{
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "10px",
          height: "12px",
          overflow: "hidden",
          position: "relative"
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${((totalWaiting - myPosition) / totalWaiting) * 100}%` 
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              background: "linear-gradient(90deg, #00caff, #0088ff)",
              height: "100%",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(0, 202, 255, 0.5)"
            }}
          />
        </div>
      </div>

      {/* זמן משוער */}
      <div style={{
        background: "rgba(0, 202, 255, 0.1)",
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <Clock className="w-6 h-6" style={{ color: "#00caff" }} />
        <div>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "4px" }}>
            זמן משוער עד התור שלך
          </div>
          <div style={{
            fontSize: "1.5rem",
            fontWeight: "800",
            color: "#e2e8f0"
          }}>
            ~{estimatedMinutes} דקות
          </div>
        </div>
      </div>

      {/* התראות */}
      {myPosition <= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "rgba(251, 191, 36, 0.2)",
            border: "2px solid rgba(251, 191, 36, 0.4)",
            borderRadius: "12px",
            textAlign: "center"
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "#fbbf24"
            }}
          >
            ⚠️ התור שלך מתקרב - התכונן!
          </motion.div>
        </motion.div>
      )}

      {/* פרטי השיר */}
      <div style={{
        marginTop: "16px",
        paddingTop: "16px",
        borderTop: "1px solid rgba(0, 202, 255, 0.2)"
      }}>
        <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "8px" }}>
          השיר שלך:
        </div>
        <div style={{
          fontSize: "1.1rem",
          fontWeight: "700",
          color: "#e2e8f0",
          marginBottom: "4px"
        }}>
          {myWaitingRequest.song_title}
        </div>
        {myWaitingRequest.song_artist && (
          <div style={{ fontSize: "0.95rem", color: "#cbd5e1" }}>
            {myWaitingRequest.song_artist}
          </div>
        )}
      </div>
    </motion.div>
  );
}