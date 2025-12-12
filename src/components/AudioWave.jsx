import React from "react";
import { motion } from "framer-motion";

export default function AudioWave({ isPlaying = true }) {
  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-gradient-to-t from-[#00caff] to-[#0088ff] rounded-full"
          animate={isPlaying ? {
            height: ["8px", "24px", "12px", "28px", "8px"],
          } : {
            height: "8px"
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          style={{
            boxShadow: "0 0 8px rgba(0, 202, 255, 0.6)"
          }}
        />
      ))}
    </div>
  );
}