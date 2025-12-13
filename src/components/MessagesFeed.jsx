import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessagesFeed({ messages }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  // Filter messages created in the last 60 seconds only
  const now = Date.now();
  const recentMessages = messages.filter(m => {
    if (!m.message || !m.message.trim()) return false;
    const created = new Date(m.created_date).getTime();
    const ageInSeconds = (now - created) / 1000;
    return ageInSeconds <= 60;
  });
  
  if (recentMessages.length === 0) {
    return null;
  }

  return (
    <div style={{
      width: "100%",
      background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(0, 202, 255, 0.2))",
      borderTop: "3px solid rgba(139, 92, 246, 0.5)",
      padding: "30px 20px",
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 -10px 40px rgba(139, 92, 246, 0.3)"
    }}>
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          textShadow: [
            "0 0 20px rgba(139, 92, 246, 0.8)",
            "0 0 30px rgba(139, 92, 246, 1)",
            "0 0 20px rgba(139, 92, 246, 0.8)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          fontSize: "1.8rem",
          color: "#a78bfa",
          textAlign: "center",
          marginBottom: "25px",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.2em"
        }}
      >
        💬 הודעות חמות מהקהל 🔥
      </motion.div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <AnimatePresence>
          {recentMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.8, x: -100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              transition={{ type: "spring", damping: 20 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "20px 30px",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(0, 202, 255, 0.3))",
                border: "2px solid rgba(139, 92, 246, 0.5)",
                borderRadius: "24px",
                boxShadow: "0 0 30px rgba(139, 92, 246, 0.4), 0 5px 20px rgba(0, 0, 0, 0.3)"
              }}
            >
              {msg.photo_url && (
                <motion.img
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  src={msg.photo_url}
                  alt={msg.singer_name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #a78bfa",
                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)"
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "1.4rem",
                  color: "#a78bfa",
                  fontWeight: "900",
                  marginBottom: "8px",
                  textShadow: "0 0 15px rgba(139, 92, 246, 0.8)"
                }}>
                  {msg.singer_name}
                </div>
                <div style={{
                  fontSize: "1.6rem",
                  color: "#ffffff",
                  fontWeight: "700",
                  lineHeight: "1.4"
                }}>
                  "{msg.message}"
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                  fontSize: "3rem"
                }}
              >
                💬
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{
        textAlign: "center",
        marginTop: "20px",
        fontSize: "0.9rem",
        color: "#94a3b8",
        fontWeight: "600"
      }}>
        ההודעות נעלמות אחרי דקה • שולפים טלפון ושולחים הודעה! 📱
      </div>
    </div>
  );
}