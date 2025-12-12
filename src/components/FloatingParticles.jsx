import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function FloatingParticles() {
  const particles = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      targetY: Math.random() * window.innerHeight,
      targetX: Math.random() * window.innerWidth,
      targetScale: Math.random() * 0.8 + 0.4,
      targetOpacity: Math.random() * 0.4 + 0.1,
      duration: Math.random() * 20 + 15,
      color: Math.random() > 0.5 ? "#00caff" : "#0088ff",
      glow: Math.random() * 20 + 10
    }));
  }, []);

  if (typeof window === 'undefined') return null;

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
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: particle.x,
            y: particle.y,
            scale: particle.scale,
            opacity: particle.opacity
          }}
          animate={{
            y: [null, particle.targetY],
            x: [null, particle.targetX],
            scale: [null, particle.targetScale],
            opacity: [null, particle.targetOpacity]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${particle.color}, transparent)`,
            boxShadow: `0 0 ${particle.glow}px ${particle.color}`
          }}
        />
      ))}
    </div>
  );
}