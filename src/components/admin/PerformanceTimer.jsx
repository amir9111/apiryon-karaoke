import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function PerformanceTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const interval = setInterval(() => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!startedAt) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "rgba(16, 185, 129, 0.2)",
        border: "2px solid rgba(16, 185, 129, 0.4)",
        borderRadius: "12px",
        marginTop: "8px"
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#10b981",
          boxShadow: "0 0 10px #10b981"
        }}
      />
      <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "#10b981", fontFamily: "monospace" }}>
        {formatTime(elapsed)}
      </span>
    </motion.div>
  );
}