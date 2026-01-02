import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function PerformanceTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(startedAt).getTime();
      const diff = Math.floor((now - start) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const isWarning = elapsed >= 180; // 3 minutes

  return (
    <motion.div
      animate={isWarning ? {
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 0 40px rgba(239, 68, 68, 0.5)",
          "0 0 80px rgba(239, 68, 68, 0.8)",
          "0 0 40px rgba(239, 68, 68, 0.5)"
        ]
      } : {}}
      transition={isWarning ? { duration: 1, repeat: Infinity } : {}}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "25px 50px",
        background: isWarning 
          ? "rgba(239, 68, 68, 0.2)" 
          : "rgba(0, 202, 255, 0.15)",
        border: isWarning 
          ? "3px solid rgba(239, 68, 68, 0.6)" 
          : "3px solid rgba(0, 202, 255, 0.4)",
        borderRadius: "25px",
        fontSize: "clamp(2rem, 4vw, 3.5rem)",
        fontWeight: "900",
        color: isWarning ? "#ef4444" : "#00caff"
      }}
    >
      <span style={{ fontSize: "3rem" }}>⏱️</span>
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isWarning && (
        <span style={{ fontSize: "2rem", marginLeft: "10px" }}>⚠️</span>
      )}
    </motion.div>
  );
}