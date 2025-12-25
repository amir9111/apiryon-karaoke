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
  const [showMedia, setShowMedia] = useState(true);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
        setIsFullscreen(true);
        
        // Lock orientation to landscape for better viewing
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.log('Fullscreen error:', err);
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

  // Cycle between media and QR codes
  React.useEffect(() => {
    if (!latestMedia) return;
    
    const interval = setInterval(() => {
      setShowMedia(prev => !prev);
    }, showMedia ? 30000 : 10000); // 30 seconds media, 10 seconds QR codes
    
    return () => clearInterval(interval);
  }, [showMedia, latestMedia]);

  return (
    <div dir="rtl" style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#fff",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      margin: 0,
      padding: 0
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

        <main role="main" style={{ 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center",
          padding: "0",
          width: "100%",
          height: "100%",
          flex: 1,
          minHeight: 0,
          overflow: "hidden"
        }}>

          {/* Media Display (30 seconds) - Full Screen */}
          {latestMedia && showMedia && (
            <motion.div
              key="media"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
                zIndex: 1
              }}
            >
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
                  disablePictureInPicture
                  disableRemotePlayback
                  webkit-playsinline="true"
                  x5-playsinline="true"
                  onError={(e) => console.error('❌ Video error:', e)}
                  onLoadedData={(e) => {
                    console.log('✅ Video loaded');
                    e.target.playbackRate = 1.0;
                  }}
                  style={{
                    width: "100vw",
                    height: "100vh",
                    display: "block",
                    objectFit: "cover",
                    objectPosition: "center",
                    backgroundColor: "#000",
                    imageRendering: "high-quality",
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                    transform: "translateZ(0) scale(1.001)",
                    filter: "contrast(1.12) brightness(1.06) saturate(1.18) sharpen(1.5)",
                    WebkitFilter: "contrast(1.12) brightness(1.06) saturate(1.18)",
                    willChange: "transform"
                  }}
                />
              ) : (
<img
                  src={latestMedia.media_url}
                  alt="תמונה מהאירוע"
                  loading="eager"
                  fetchpriority="high"
                  decoding="sync"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('❌ Image error:', latestMedia.media_url);
                    e.target.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    console.log('✅ Image loaded:', latestMedia.media_url);
                    // Force maximum quality rendering
                    e.target.style.imageRendering = 'high-quality';
                    e.target.style.transform = 'translateZ(0) scale(1.0005)';
                  }}
                  style={{
                    width: "100vw",
                    height: "100vh",
                    display: "block",
                    objectFit: "cover",
                    objectPosition: "center",
                    backgroundColor: "#000",
                    imageRendering: "high-quality",
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                    transform: "translateZ(0)",
                    willChange: "transform"
                  }}
                />
              )}
            </motion.div>
          )}

          {/* QR Codes Display (10 seconds) */}
          {(!latestMedia || !showMedia) && (
            <motion.div
              key="qrcodes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px"
              }}
            >
              {/* Title */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  fontWeight: "900",
                  background: "linear-gradient(90deg, #00caff 0%, #0088ff 25%, #00d4ff 50%, #0088ff 75%, #00caff 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 3s linear infinite",
                  marginBottom: "40px",
                  textAlign: "center"
                }}
              >
                🎤 הצטרפו אלינו! 🎵
              </motion.div>

              {/* QR Codes Grid */}
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "40px",
                maxWidth: "1400px",
                width: "100%"
              }}>
                {/* QR Code for Join Queue */}
                <div style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    borderRadius: "24px",
                    padding: "30px",
                    border: "3px solid rgba(16, 185, 129, 0.5)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 60px rgba(16, 185, 129, 0.3)",
                    backdropFilter: "blur(30px)"
                  }}
                >
                  <div style={{ 
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)", 
                    color: "#10b981", 
                    marginBottom: "20px",
                    fontWeight: "800",
                    textShadow: "0 0 20px rgba(16, 185, 129, 0.8)"
                  }}>
                    🎤 הצטרף לתור
                  </div>

                  <div style={{
                    width: "clamp(200px, 20vw, 300px)",
                    height: "clamp(200px, 20vw, 300px)",
                    background: "#fff",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)",
                    border: "4px solid #10b981"
                  }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${window.location.origin}/Home`}
                      alt="QR Code להצטרפות לתור"
                      style={{ width: "90%", height: "90%" }}
                    />
                  </div>

                  <div style={{ 
                    fontSize: "clamp(1.2rem, 2vw, 1.8rem)", 
                    color: "#cbd5e1",
                    fontWeight: "700"
                  }}>
                    סרוק והצטרף לקריוקי
                  </div>
                </div>

                {/* QR Code for WhatsApp */}
                <div style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    borderRadius: "24px",
                    padding: "30px",
                    border: "3px solid rgba(0, 202, 255, 0.5)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 60px rgba(0, 202, 255, 0.3)",
                    backdropFilter: "blur(30px)"
                  }}
                >
                  <div style={{ 
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)", 
                    color: "#00caff", 
                    marginBottom: "20px",
                    fontWeight: "800",
                    textShadow: "0 0 20px rgba(0, 202, 255, 0.8)"
                  }}>
                    💬 קבוצת וואטסאפ
                  </div>

                  <div style={{
                    width: "clamp(200px, 20vw, 300px)",
                    height: "clamp(200px, 20vw, 300px)",
                    background: "#fff",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    boxShadow: "0 0 40px rgba(0, 202, 255, 0.4)",
                    border: "4px solid #00caff"
                  }}>
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
                      alt="QR Code WhatsApp"
                      style={{ width: "90%", height: "90%" }}
                    />
                  </div>

                  <div style={{ 
                    fontSize: "clamp(1.2rem, 2vw, 1.8rem)", 
                    color: "#cbd5e1",
                    fontWeight: "700"
                  }}>
                    עדכונים על ערבי קריוקי
                  </div>
                </div>

                {/* QR Code for TikTok */}
                <div style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    borderRadius: "24px",
                    padding: "30px",
                    border: "3px solid rgba(255, 0, 80, 0.5)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 60px rgba(255, 0, 80, 0.3)",
                    backdropFilter: "blur(30px)"
                  }}
                >
                  <div style={{ 
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)", 
                    color: "#ff0050", 
                    marginBottom: "20px",
                    fontWeight: "800",
                    textShadow: "0 0 20px rgba(255, 0, 80, 0.8)"
                  }}>
                    🎵 טיקטוק
                  </div>

                  <div style={{
                    width: "clamp(200px, 20vw, 300px)",
                    height: "clamp(200px, 20vw, 300px)",
                    background: "#fff",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    boxShadow: "0 0 40px rgba(255, 0, 80, 0.4)",
                    border: "4px solid #ff0050"
                  }}>
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://www.tiktok.com/@apiryon.club"
                      alt="QR Code TikTok"
                      style={{ width: "90%", height: "90%" }}
                    />
                  </div>

                  <div style={{ 
                    fontSize: "clamp(1.2rem, 2vw, 1.8rem)", 
                    color: "#cbd5e1",
                    fontWeight: "700"
                  }}>
                    תראו את עצמכם בסרטונים! 📸
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

Audience.isPublic = true;