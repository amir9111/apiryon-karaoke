import React, { useEffect } from "react";
import { motion } from "framer-motion";

export default function FloatingMessages({ messages, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(messages.map(m => m.id));
    }, 20000);
    
    return () => clearTimeout(timer);
  }, [messages, onComplete]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      overflow: "hidden",
      zIndex: 1
    }}>
      {messages.map((msg, idx) => {
        const startX = idx % 2 === 0 ? -300 : window.innerWidth + 300;
        const endX = idx % 2 === 0 ? window.innerWidth + 300 : -300;
        const yPosition = 15 + (idx * 22);
        
        return (
          <motion.div
            key={msg.id}
            initial={{ x: startX, y: `${yPosition}%`, opacity: 0 }}
            animate={{ 
              x: endX,
              opacity: [0, 1, 1, 1, 0],
              scale: [0.9, 1, 1, 1, 0.9]
            }}
            transition={{
              duration: 20,
              ease: "linear",
              opacity: {
                times: [0, 0.1, 0.5, 0.9, 1],
                duration: 20
              }
            }}
            style={{
              position: "absolute",
              background: "rgba(139, 92, 246, 0.9)",
              border: "3px solid rgba(139, 92, 246, 1)",
              borderRadius: "30px",
              padding: "30px 50px",
              boxShadow: "0 0 60px rgba(139, 92, 246, 0.6)",
              maxWidth: "70%",
              backdropFilter: "blur(10px)"
            }}
          >
            <div style={{
              fontSize: "clamp(1.3rem, 2.5vw, 2rem)",
              color: "#e0d4ff",
              marginBottom: "10px",
              fontWeight: "800"
            }}>
              {msg.sender_name}
            </div>
            <div style={{
              fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
              color: "#fff",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              💬 {msg.message}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}