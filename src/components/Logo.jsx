import React from "react";

export default function Logo({ size = "medium", showCircle = true }) {
  const sizes = {
    small: {
      container: "w-20 h-20",
      text: "text-xl",
      border: "border-4"
    },
    medium: {
      container: "w-32 h-32",
      text: "text-3xl",
      border: "border-8"
    },
    large: {
      container: "w-48 h-48",
      text: "text-5xl",
      border: "border-[12px]"
    }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <div className="flex items-center justify-center">
      <style>{`
        .neon-blue-text {
          color: #ffffff;
          text-shadow: 
            0 0 7px #00caff,
            0 0 10px #00caff,
            0 0 21px #00caff,
            0 0 42px #00aaff,
            0 0 82px #0088ff,
            0 0 92px #0088ff,
            0 0 102px #0088ff,
            0 0 151px #0088ff;
        }

        .neon-blue-circle {
          border-color: #00caff;
          box-shadow: 
            0 0 10px rgba(0, 202, 255, 0.8),
            0 0 20px rgba(0, 202, 255, 0.6),
            0 0 40px rgba(0, 170, 255, 0.4),
            0 0 80px rgba(0, 136, 255, 0.2);
          background-color: rgba(0, 202, 255, 0.1);
        }

        .logo-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
      
      {showCircle ? (
        <div className={`${sizeConfig.container} rounded-full ${sizeConfig.border} neon-blue-circle flex items-center justify-center transition-transform duration-300 hover:scale-105`}>
          <h1 className={`${sizeConfig.text} font-extrabold neon-blue-text tracking-widest text-center select-none`}>
            APIRYON
          </h1>
        </div>
      ) : (
        <h1 className={`${sizeConfig.text} font-extrabold neon-blue-text tracking-widest text-center select-none logo-pulse`}>
          APIRYON
        </h1>
      )}
    </div>
  );
}