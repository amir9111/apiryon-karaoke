import React from "react";
import { motion } from "framer-motion";

export default function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0
    }}>
      {particles.map((i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.3 + 0.1
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            scale: [null, Math.random() * 0.8 + 0.4],
            opacity: [null, Math.random() * 0.4 + 0.1]
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${
              Math.random() > 0.5 ? "#00caff" : "#0088ff"
            }, transparent)`,
            boxShadow: `0 0 ${Math.random() * 20 + 10}px ${
              Math.random() > 0.5 ? "#00caff" : "#0088ff"
            }`
          }}
        />
      ))}
    </div>
  );
}