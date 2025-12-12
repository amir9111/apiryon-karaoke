import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('he-IL', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 100,
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        padding: "20px 30px",
        border: "2px solid rgba(0, 202, 255, 0.4)",
        boxShadow: "0 0 40px rgba(0, 202, 255, 0.3), inset 0 0 20px rgba(0, 202, 255, 0.1)"
      }}
    >
      {/* Time */}
      <motion.div
        animate={{
          textShadow: [
            "0 0 20px rgba(0, 202, 255, 0.8), 0 0 40px rgba(0, 202, 255, 0.5)",
            "0 0 30px rgba(0, 202, 255, 1), 0 0 60px rgba(0, 202, 255, 0.7)",
            "0 0 20px rgba(0, 202, 255, 0.8), 0 0 40px rgba(0, 202, 255, 0.5)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: "900",
          color: "#00caff",
          letterSpacing: "0.1em",
          fontFamily: "monospace",
          textAlign: "center",
          marginBottom: "10px"
        }}
      >
        {formatTime(time)}
      </motion.div>

      {/* Date */}
      <div
        style={{
          fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
          fontWeight: "600",
          color: "#cbd5e1",
          textAlign: "center",
          letterSpacing: "0.05em",
          textShadow: "0 0 15px rgba(0, 202, 255, 0.3)"
        }}
      >
        {formatDate(time)}
      </div>
    </motion.div>
  );
}