import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function FloatingMessages({ isPerforming }) {
  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      try {
        const msgs = await base44.entities.Message.list('-created_date', 20);
        console.log('Fetched messages:', msgs);
        return msgs || [];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    refetchInterval: 2000,
    staleTime: 1000,
    enabled: isPerforming
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
    if (!m.created_date) return false;
    const created = new Date(m.created_date).getTime();
    const ageInSeconds = (now - created) / 1000;
    return ageInSeconds <= 30;
  });

  console.log('Recent messages:', recentMessages.length, 'Total messages:', messages.length);
  
  if (recentMessages.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: "absolute",
      bottom: "10px",
      left: 0,
      right: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 10
    }}>
      <motion.div
        animate={{
          x: ["100%", "-100%"]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          display: "flex",
          gap: "30px",
          whiteSpace: "nowrap"
        }}
      >
        {[...recentMessages, ...recentMessages, ...recentMessages].map((msg, idx) => (
          <div
            key={`${msg.id}-${idx}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              background: "rgba(139, 92, 246, 0.9)",
              border: "2px solid rgba(167, 139, 250, 0.8)",
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 15px rgba(139, 92, 246, 0.6)"
            }}
          >
            <span style={{
              fontSize: "1.1rem",
              color: "#fff",
              fontWeight: "800"
            }}>
              {msg.sender_name}:
            </span>
            <span style={{
              fontSize: "1rem",
              color: "#e9d5ff",
              fontWeight: "600"
            }}>
              {msg.message}
            </span>
            <span style={{ fontSize: "1.2rem" }}>💬</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}