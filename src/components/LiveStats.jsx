import React from "react";
import { motion } from "framer-motion";
import { Users, Music, TrendingUp } from "lucide-react";

export default function LiveStats({ requests }) {
  const waiting = requests.filter(r => r.status === "waiting").length;
  const done = requests.filter(r => r.status === "done").length;
  const avgRating = requests
    .filter(r => r.average_rating > 0)
    .reduce((sum, r) => sum + r.average_rating, 0) / 
    (requests.filter(r => r.average_rating > 0).length || 1);

  const stats = [
    { icon: Users, label: "בתור", value: waiting, color: "#00caff" },
    { icon: Music, label: "בוצעו", value: done, color: "#10b981" },
    { icon: TrendingUp, label: "אנרגיה", value: avgRating.toFixed(1), color: "#fbbf24" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        zIndex: 100
      }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "16px",
            padding: "12px 20px",
            border: `2px solid ${stat.color}40`,
            boxShadow: `0 0 20px ${stat.color}30`,
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}