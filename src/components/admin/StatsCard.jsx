import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ icon, label, value, color = "#00caff", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: `rgba(${color === "#00caff" ? "0, 202, 255" : color === "#10b981" ? "16, 185, 129" : color === "#f59e0b" ? "245, 158, 11" : "139, 92, 246"}, 0.1)`,
        border: `2px solid rgba(${color === "#00caff" ? "0, 202, 255" : color === "#10b981" ? "16, 185, 129" : color === "#f59e0b" ? "245, 158, 11" : "139, 92, 246"}, 0.3)`,
        borderRadius: "16px",
        padding: "clamp(12px, 3vw, 20px)",
        textAlign: "center",
        boxShadow: `0 0 20px rgba(${color === "#00caff" ? "0, 202, 255" : color === "#10b981" ? "16, 185, 129" : color === "#f59e0b" ? "245, 158, 11" : "139, 92, 246"}, 0.15)`,
        minHeight: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
    >
      <div style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "clamp(1.3rem, 3.5vw, 2rem)", fontWeight: "900", color, marginBottom: "4px", textShadow: `0 0 20px ${color}80`, wordBreak: "break-word" }}>
        {value}
      </div>
      <div style={{ fontSize: "clamp(0.75rem, 2vw, 0.85rem)", color: "#94a3b8", fontWeight: "600" }}>
        {label}
      </div>
    </motion.div>
  );
}