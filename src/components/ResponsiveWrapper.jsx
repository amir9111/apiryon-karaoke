import React, { useState, useEffect } from "react";

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024
  });

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      setDeviceType({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width
      });
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
}

export function ResponsiveContainer({ children, style = {} }) {
  return (
    <div style={{
      width: "100%",
      maxWidth: "100vw",
      overflowX: "hidden",
      padding: "clamp(12px, 3vw, 24px)",
      boxSizing: "border-box",
      ...style
    }}>
      {children}
    </div>
  );
}