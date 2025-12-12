import React from "react";

export default function ApyironLogo({ size = "medium", showCircle = true }) {
  const sizeClasses = {
    small: "text-xl sm:text-2xl",
    medium: "text-3xl sm:text-4xl md:text-5xl",
    large: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
  };

  const circleSize = {
    small: "w-24 h-24 sm:w-32 sm:h-32",
    medium: "w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48",
    large: "w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64"
  };

  const neonStyles = {
    text: {
      color: "#ffffff",
      textShadow: `
        0 0 7px #00caff,
        0 0 10px #00caff,
        0 0 21px #00caff,
        0 0 42px #00aaff,
        0 0 82px #0088ff,
        0 0 92px #0088ff,
        0 0 102px #0088ff,
        0 0 151px #0088ff
      `
    },
    circle: {
      border: "8px solid #00caff",
      boxShadow: `
        0 0 10px rgba(0, 202, 255, 0.8),
        0 0 20px rgba(0, 202, 255, 0.6),
        0 0 40px rgba(0, 170, 255, 0.4),
        0 0 80px rgba(0, 136, 255, 0.2)
      `,
      backgroundColor: "rgba(0, 202, 255, 0.1)"
    }
  };

  if (showCircle) {
    return (
      <div 
        className={`${circleSize[size]} rounded-full flex items-center justify-center`}
        style={neonStyles.circle}
      >
        <h1 
          className={`${sizeClasses[size]} font-extrabold tracking-widest text-center select-none`}
          style={neonStyles.text}
        >
          APIRYON
        </h1>
      </div>
    );
  }

  return (
    <h1 
      className={`${sizeClasses[size]} font-extrabold tracking-widest text-center select-none`}
      style={neonStyles.text}
    >
      APIRYON
    </h1>
  );
}