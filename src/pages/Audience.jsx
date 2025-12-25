import React, { useState } from "react";
import NavigationMenu from "../components/NavigationMenu";
import ApyironLogo from "../components/ApyironLogo";
import AudioWave from "../components/AudioWave";
import EventSummaryModal from "../components/EventSummaryModal";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Maximize, Minimize } from "lucide-react";

export default function Audience() {
  const [showSummary, setShowSummary] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Error entering fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 5000,
    staleTime: 4000,
  });

  const { data: mediaUploads = [] } = useQuery({
    queryKey: ['media-uploads'],
    queryFn: async () => {
      const data = await base44.entities.MediaUpload.list('-created_date', 1);
      console.log('📸 Media uploads:', data);
      return data;
    },
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const latestMedia = mediaUploads[0];
  
  console.log('🎬 Latest media:', latestMedia);

  return (
    <div dir="rtl" style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Fixed Menu */}
      <div style={{ position: "fixed", top: "10px", right: "10px", zIndex: 10000 }}>
        <NavigationMenu onSummaryClick={() => setShowSummary(true)} />
      </div>

      {/* Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: "none",
          background: "rgba(15, 23, 42, 0.95)",
          color: "#00caff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          boxShadow: "0 0 20px rgba(0, 202, 255, 0.3)",
          border: "1px solid rgba(0, 202, 255, 0.3)",
          transition: "all 0.3s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0, 202, 255, 0.2)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(15, 23, 42, 0.95)";
          e.currentTarget.style.transform = "scale(1)";
        }}
        title={isFullscreen ? "צא ממסך מלא" : "הצג במסך מלא"}
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>

      {/* CONTENT */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <EventSummaryModal 
          isOpen={showSummary}
          onClose={() => setShowSummary(false)}
          requests={requests}
        />
        
        <style>{`
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 60px rgba(0, 202, 255, 0.6), 0 0 120px rgba(0, 202, 255, 0.3); }
            50% { box-shadow: 0 0 100px rgba(0, 202, 255, 0.8), 0 0 180px rgba(0, 202, 255, 0.5); }
          }
          @keyframes shimmer {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* Top Banner with Logo Background */}
        <div style={{
          position: "relative",
          width: "100%",
          padding: "5px 10px",
          marginBottom: "5px",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(0, 202, 255, 0.05) 0%, transparent 100%)",
          flexShrink: 0
        }}>
          {/* Stretched Logo Background */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(3)",
            opacity: 0.04,
            pointerEvents: "none",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 0
          }}>
            <ApyironLogo size="large" showCircle={false} />
          </div>

          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center"
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                display: "inline-block",
                fontSize: "clamp(1.2rem, 2vw, 2rem)",
                marginBottom: "0"
              }}
            >
              🎵
            </motion.div>
            
            <div style={{
              fontSize: "clamp(1.1rem, 2vw, 1.8rem)",
              fontWeight: "900",
              background: "linear-gradient(90deg, #00caff 0%, #0088ff 25%, #00d4ff 50%, #0088ff 75%, #00caff 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
              letterSpacing: "0.02em",
              lineHeight: "1.2",
              textShadow: "0 0 80px rgba(0, 202, 255, 0.5)",
              filter: "drop-shadow(0 0 30px rgba(0, 202, 255, 0.6))"
            }}>
              המוזיקה שלנו, השירה שלכם
            </div>

            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [-5, 5, -5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                display: "inline-block",
                fontSize: "clamp(1.2rem, 2vw, 2rem)",
                marginTop: "0"
              }}
            >
              🎤
            </motion.div>
          </motion.div>
        </div>

        <main role="main" style={{ 
          display: "flex", 
          flexDirection: latestMedia ? "row" : "column",
          alignItems: "stretch", 
          justifyContent: "space-between",
          padding: latestMedia ? "0 10px 10px" : "0 20px 2vh",
          width: "100%",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          gap: "10px"
        }}>

          {/* Media Display Section */}
          {latestMedia && (
            <motion.div
              key={latestMedia.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6 }}
              style={{
                flex: "1 1 65%",
                display: "flex",
                flexDirection: "column",
                minWidth: 0
              }}
            >
              <div style={{
                background: "#000",
                borderRadius: "12px",
                overflow: "hidden",
                border: "2px solid rgba(0, 202, 255, 0.4)",
                boxShadow: "0 0 40px rgba(0, 202, 255, 0.3)",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {latestMedia.media_type === 'video' ? (
                  <video
                    key={latestMedia.media_url}
                    src={latestMedia.media_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                    preload="auto"
                    onError={(e) => console.error('❌ Video error:', e)}
                    onLoadedData={() => console.log('✅ Video loaded')}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                      backgroundColor: "#000"
                    }}
                  />
                ) : (
                  <img
                    src={latestMedia.media_url}
                    alt="תמונה מהאירוע"
                    onError={(e) => {
                      console.error('❌ Image error:', latestMedia.media_url);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => console.log('✅ Image loaded:', latestMedia.media_url)}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover"
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* QR Codes Row */}
          <div style={{ 
            display: latestMedia ? "flex" : "grid",
            flexDirection: latestMedia ? "column" : undefined,
            gridTemplateColumns: latestMedia ? undefined : "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "15px",
            width: latestMedia ? "auto" : "100%",
            maxWidth: latestMedia ? "none" : "1200px",
            flex: latestMedia ? "0 0 auto" : undefined,
            minWidth: latestMedia ? "240px" : undefined
          }}>
            {/* QR Code for Join Queue */}
            <div style={{
                background: "rgba(15, 23, 42, 0.5)",
                borderRadius: "12px",
                padding: "6px",
                border: "2px solid rgba(16, 185, 129, 0.4)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 35px rgba(16, 185, 129, 0.2)",
                backdropFilter: "blur(30px)"
              }}
            >
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#10b981", 
                marginBottom: "3px",
                fontWeight: "700",
                textShadow: "0 0 10px rgba(16, 185, 129, 0.7)"
              }}>
                🎤 הצטרף לתור
              </div>

              <div style={{
                width: "100px",
                height: "100px",
                background: "#fff",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "3px",
                boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)",
                border: "2px solid #10b981"
              }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${window.location.origin}/Home`}
                  alt="QR Code להצטרפות לתור"
                  style={{ width: "90px", height: "90px" }}
                />
              </div>

              <div style={{ 
                fontSize: "0.7rem", 
                color: "#cbd5e1",
                fontWeight: "600"
              }}>
                סרוק והצטרף
              </div>
            </div>

            {/* QR Code for WhatsApp */}
            <div style={{
                background: "rgba(15, 23, 42, 0.5)",
                borderRadius: "12px",
                padding: "6px",
                border: "2px solid rgba(0, 202, 255, 0.4)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 35px rgba(0, 202, 255, 0.2)",
                backdropFilter: "blur(30px)"
              }}
            >
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#00caff", 
                marginBottom: "3px",
                fontWeight: "700",
                textShadow: "0 0 10px rgba(0, 202, 255, 0.7)"
              }}>
                💬 וואטסאפ
              </div>

              <div style={{
                width: "100px",
                height: "100px",
                background: "#fff",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "3px",
                boxShadow: "0 0 15px rgba(0, 202, 255, 0.3)",
                border: "2px solid #00caff"
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
                  alt="QR Code WhatsApp"
                  style={{ width: "90px", height: "90px" }}
                />
              </div>

              <div style={{ 
                fontSize: "0.7rem", 
                color: "#cbd5e1",
                fontWeight: "600"
              }}>
                עדכונים
              </div>
            </div>

            {/* QR Code for TikTok */}
            <div style={{
                background: "rgba(15, 23, 42, 0.5)",
                borderRadius: "12px",
                padding: "6px",
                border: "2px solid rgba(255, 0, 80, 0.4)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 35px rgba(255, 0, 80, 0.2)",
                backdropFilter: "blur(30px)"
              }}
            >
              <div style={{ 
                fontSize: "0.8rem", 
                color: "#ff0050", 
                marginBottom: "3px",
                fontWeight: "700",
                textShadow: "0 0 10px rgba(255, 0, 80, 0.7)"
              }}>
                🎵 טיקטוק
              </div>

              <div style={{
                width: "100px",
                height: "100px",
                background: "#fff",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "3px",
                boxShadow: "0 0 15px rgba(255, 0, 80, 0.3)",
                border: "2px solid #ff0050"
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://www.tiktok.com/@apiryon.club"
                  alt="QR Code TikTok"
                  style={{ width: "90px", height: "90px" }}
                />
              </div>

              <div style={{ 
                fontSize: "0.7rem", 
                color: "#cbd5e1",
                fontWeight: "600"
              }}>
                תראו אתכם! 📸
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

Audience.isPublic = true;