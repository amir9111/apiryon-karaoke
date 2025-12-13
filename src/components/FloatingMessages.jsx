import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function FloatingMessages({ isPerforming }) {
  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 20),
    refetchInterval: 3000,
    staleTime: 2000,
  });

  // Don't show messages if no one is performing
  if (!isPerforming) {
    return null;
  }

  if (!messages || messages.length === 0) {
    return null;
  }

  // Filter messages created in the last 30 seconds only
  const now = Date.now();
  const recentMessages = messages.filter(m => {
    if (!m.message || !m.message.trim()) return false;
    const created = new Date(m.created_date).getTime();
    const ageInSeconds = (now - created) / 1000;
    return ageInSeconds <= 30;
  });
  
  if (recentMessages.length === 0) {
    return null;
  }

  // Create 3 rows of messages with different speeds
  const rows = [
    { messages: recentMessages, duration: 40, direction: 1 },
    { messages: recentMessages, duration: 50, direction: -1 },
    { messages: recentMessages, duration: 45, direction: 1 }
  ];

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0
    }}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            position: "absolute",
            top: `${20 + rowIndex * 30}%`,
            width: "100%",
            overflow: "hidden"
          }}
        >
          <motion.div
            animate={{
              x: row.direction > 0 ? ["-100%", "100%"] : ["100%", "-100%"]
            }}
            transition={{
              duration: row.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              display: "flex",
              gap: "30px",
              whiteSpace: "nowrap"
            }}
          >
            {[...row.messages, ...row.messages, ...row.messages].map((msg, idx) => (
              <motion.div
                key={`${msg.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.25, scale: 1 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 24px",
                  background: "rgba(139, 92, 246, 0.3)",
                  border: "2px solid rgba(139, 92, 246, 0.5)",
                  borderRadius: "20px",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
                }}
              >
                {msg.photo_url && (
                  <img
                    src={msg.photo_url}
                    alt=""
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(167, 139, 250, 0.8)"
                    }}
                  />
                )}
                <div>
                  <div style={{
                    fontSize: "0.9rem",
                    color: "#a78bfa",
                    fontWeight: "800",
                    marginBottom: "2px"
                  }}>
                    {msg.sender_name}
                  </div>
                  <div style={{
                    fontSize: "1rem",
                    color: "#e2e8f0",
                    fontWeight: "600"
                  }}>
                    "{msg.message}"
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem" }}>💬</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}