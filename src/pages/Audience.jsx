import React, { useState } from "react";
import NavigationMenu from "../components/NavigationMenu";
import ApyironLogo from "../components/ApyironLogo";
import AudioWave from "../components/AudioWave";
import EventSummaryModal from "../components/EventSummaryModal";
import PerformanceTimer from "../components/PerformanceTimer";
import FloatingMessages from "../components/FloatingMessages";
import SingleQRDisplay from "../components/SingleQRDisplay";
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

  const [currentMode, setCurrentMode] = useState("idle"); // "current_song", "idle"
  const [idleSubMode, setIdleSubMode] = useState("audience_media"); // "audience_media", "floating_messages", "qr", "gallery"
  const [displayedAudienceMedia, setDisplayedAudienceMedia] = useState(new Set());
  const [currentQRIndex, setCurrentQRIndex] = useState(0);

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const { data: audienceMedia = [] } = useQuery({
    queryKey: ['audience-media'],
    queryFn: async () => {
      const data = await base44.entities.MediaUpload.filter({ is_active: true }, '-created_date', 50);
      return data;
    },
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 20),
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const { data: galleryImages = [] } = useQuery({
    queryKey: ['gallery-images-audience'],
    queryFn: async () => {
      const images = await base44.entities.GalleryImage.list('-created_date', 100);
      
      // מחיקה אוטומטית של תמונות ישנות מעל שעה
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      for (const img of images) {
        const imgTime = new Date(img.created_date).getTime();
        if (imgTime < oneHourAgo) {
          try {
            await base44.entities.GalleryImage.delete(img.id);
          } catch (err) {
            console.error('Failed to delete old image:', err);
          }
        }
      }
      
      return images.filter(img => img.image_url && new Date(img.created_date).getTime() >= oneHourAgo);
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });

  const currentSong = requests.find(r => r.status === "performing");
  const waitingQueue = requests.filter(r => r.status === "waiting").slice(0, 4);
  const [currentGalleryImageIndex, setCurrentGalleryImageIndex] = useState(0);

  // Smart rotation logic
  React.useEffect(() => {
    let timeout;
    
    const deleteUsedMedia = async (mediaId) => {
      try {
        await base44.entities.MediaUpload.delete(mediaId);
      } catch (err) {
        console.error("Failed to delete media:", err);
      }
    };
    
    const getNextIdleMode = (current) => {
      const hasUnseenMedia = audienceMedia.some(m => !displayedAudienceMedia.has(m.id));
      const hasMessages = messages.length > 0;
      const hasGallery = galleryImages.length > 0;
      
      // סיבוב: תמונות קהל -> הודעות מרחפות -> QR -> גלריה
      if (current === "audience_media") {
        if (hasMessages) return "floating_messages";
        setCurrentQRIndex(0);
        return "qr";
      }
      
      if (current === "floating_messages") {
        setCurrentQRIndex(0);
        return "qr";
      }
      
      if (current === "qr") {
        if (currentQRIndex < 2) {
          setCurrentQRIndex(prev => prev + 1);
          return "qr";
        }
        if (hasGallery) return "gallery";
        if (hasUnseenMedia) return "audience_media";
        if (hasMessages) return "floating_messages";
        setCurrentQRIndex(0);
        return "qr";
      }
      
      if (current === "gallery") {
        if (hasUnseenMedia) return "audience_media";
        if (hasMessages) return "floating_messages";
        setCurrentQRIndex(0);
        return "qr";
      }
      
      // התחלה
      if (hasUnseenMedia) return "audience_media";
      if (hasMessages) return "floating_messages";
      setCurrentQRIndex(0);
      return "qr";
    };
    
    const transition = () => {
      // אם יש שיר נוכחי - מסך שיר
      if (currentSong) {
        setCurrentMode("current_song");
        timeout = setTimeout(transition, 60000);
        return;
      }
      
      // אם אין שיר - מסך Idle
      setCurrentMode("idle");
      
      const nextSubMode = getNextIdleMode(idleSubMode);
      setIdleSubMode(nextSubMode);
      
      // זמנים: תמונות קהל=15s, הודעות=20s, QR=12s, גלריה=10s
      const durations = {
        audience_media: 15000,
        floating_messages: 20000,
        qr: 12000,
        gallery: 10000
      };
      
      timeout = setTimeout(transition, durations[nextSubMode] || 15000);
    };
    
    timeout = setTimeout(transition, currentMode === "current_song" ? 60000 : 15000);
    
    return () => clearTimeout(timeout);
  }, [currentMode, idleSubMode, currentSong, audienceMedia, messages, galleryImages.length, currentQRIndex, displayedAudienceMedia]);

  // Simplified rotation: Only current_song (if exists) and queue + gallery slideshow
  React.useEffect(() => {
    let timeout;
    
    const getNextMode = (current) => {
      // אם יש שיר נוכחי - תמיד נשאר עליו
      if (currentSong && current !== "current_song") {
        return { next: "current_song", duration: 0 };
      }
      
      // אם אין שיר נוכחי - מסך קבוע עם תור + גלריה מתחלפת
      if (!currentSong) {
        // החלפת תמונות גלריה כל 8 שניות ברקע
        if (galleryImages.length > 0) {
          setCurrentGalleryImageIndex(prevIdx => (prevIdx + 1) % galleryImages.length);
        }
        return { next: "queue", duration: 8000 }; // החלפת תמונה כל 8 שניות
      }
      
      // אם יש שיר נוכחי - נשאר על המסך שלו
      return { next: "current_song", duration: 60000 };
    };
    
    const transition = () => {
      const { next, duration } = getNextMode(currentMode);
      if (duration > 0) {
        setCurrentMode(next);
        timeout = setTimeout(transition, duration);
      }
    };
    
    timeout = setTimeout(transition, currentMode === "current_song" ? 60000 : 8000);
    
    return () => clearTimeout(timeout);
  }, [currentMode, currentSong, galleryImages.length]);

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

          {/* Mode 0: Current Song Performing (60 seconds) */}
          {currentMode === "current_song" && currentSong && (
            <motion.div
              key={`current-song-${currentSong.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1 }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px",
                gap: "40px",
                background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(0, 10, 41, 0.9) 50%, rgba(251, 191, 36, 0.1) 100%)"
              }}
            >
              {/* Animated Title */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  textShadow: [
                    "0 0 40px rgba(251, 191, 36, 0.8)",
                    "0 0 80px rgba(251, 191, 36, 1)",
                    "0 0 40px rgba(251, 191, 36, 0.8)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: "900",
                  color: "#fbbf24",
                  textAlign: "center",
                  marginBottom: "20px"
                }}
              >
                🎤 שר עכשיו! 🎤
              </motion.div>

              {/* Singer Photo & Info */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "30px",
                background: "rgba(15, 23, 42, 0.9)",
                padding: "60px",
                borderRadius: "40px",
                border: "4px solid rgba(251, 191, 36, 0.6)",
                boxShadow: "0 0 100px rgba(251, 191, 36, 0.5)",
                maxWidth: "1200px",
                width: "100%"
              }}>
                {/* Photo */}
                {currentSong.photo_url && (
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 40px rgba(251, 191, 36, 0.6)",
                        "0 0 80px rgba(251, 191, 36, 0.9)",
                        "0 0 40px rgba(251, 191, 36, 0.6)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: "clamp(200px, 25vw, 350px)",
                      height: "clamp(200px, 25vw, 350px)",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "6px solid #fbbf24"
                    }}
                  >
                    <img 
                      src={currentSong.photo_url} 
                      alt={currentSong.singer_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </motion.div>
                )}

                {/* Singer Name */}
                <div style={{
                  fontSize: "clamp(3rem, 7vw, 6rem)",
                  fontWeight: "900",
                  color: "#fbbf24",
                  textAlign: "center",
                  textShadow: "0 0 40px rgba(251, 191, 36, 0.8)",
                  lineHeight: "1.1"
                }}>
                  {currentSong.singer_name}
                </div>

                {/* Song Title */}
                <div style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  fontWeight: "700",
                  color: "#00caff",
                  textAlign: "center",
                  textShadow: "0 0 30px rgba(0, 202, 255, 0.6)",
                  lineHeight: "1.3"
                }}>
                  {currentSong.song_title}
                </div>

                {/* Artist */}
                {currentSong.song_artist && (
                  <div style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    color: "#cbd5e1",
                    textAlign: "center",
                    fontWeight: "600"
                  }}>
                    {currentSong.song_artist}
                  </div>
                )}

                {/* Live Rating */}
                {currentSong.average_rating > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      marginTop: "20px",
                      padding: "20px 40px",
                      background: "rgba(251, 191, 36, 0.2)",
                      borderRadius: "20px",
                      border: "2px solid rgba(251, 191, 36, 0.5)"
                    }}
                  >
                    <span style={{ fontSize: "3rem" }}>⭐</span>
                    <span style={{
                      fontSize: "clamp(2rem, 4vw, 3.5rem)",
                      fontWeight: "900",
                      color: "#fbbf24"
                    }}>
                      {currentSong.average_rating.toFixed(1)}
                    </span>
                  </motion.div>
                )}

                {/* Message from singer */}
                {currentSong.message && (
                  <div style={{
                    marginTop: "20px",
                    padding: "25px 40px",
                    background: "rgba(139, 92, 246, 0.15)",
                    borderRadius: "20px",
                    border: "2px solid rgba(139, 92, 246, 0.4)",
                    maxWidth: "800px"
                  }}>
                    <div style={{
                      fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                      color: "#a78bfa",
                      textAlign: "center",
                      fontWeight: "700",
                      lineHeight: "1.5"
                    }}>
                      💬 "{currentSong.message}"
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Timer */}
              {currentSong.started_at && (
                <PerformanceTimer startedAt={currentSong.started_at} />
              )}
            </motion.div>
          )}

          {/* Idle Mode: When no current song */}
          {currentMode === "idle" && (
            <>
              {/* Sub-mode 1: Audience Media (15s) */}
              {idleSubMode === "audience_media" && audienceMedia.length > 0 && (() => {
                const unseenMedia = audienceMedia.filter(m => !displayedAudienceMedia.has(m.id));
                const mediaToShow = unseenMedia.length > 0 ? unseenMedia[0] : audienceMedia[0];
                
                React.useEffect(() => {
                  if (mediaToShow) {
                    setDisplayedAudienceMedia(prev => new Set([...prev, mediaToShow.id]));
                    setTimeout(async () => {
                      try {
                        await base44.entities.MediaUpload.delete(mediaToShow.id);
                      } catch (err) {
                        console.error("Failed to delete media:", err);
                      }
                    }, 15000);
                  }
                }, [mediaToShow?.id]);
                
                return (
                  <motion.div
                    key={`audience-media-${mediaToShow.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1 }}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      background: "#000",
                      zIndex: 1
                    }}
                  >
                    {mediaToShow.media_type === 'video' ? (
                      <video
                        key={mediaToShow.media_url}
                        src={mediaToShow.media_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <img
                        src={mediaToShow.media_url}
                        alt="תמונה מהקהל"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </motion.div>
                );
              })()}

              {/* Sub-mode 2: Floating Messages (20s) */}
              {idleSubMode === "floating_messages" && messages.length > 0 && (
                <FloatingMessages messages={messages.slice(0, 4)} onComplete={async (msgIds) => {
                  for (const id of msgIds) {
                    try {
                      await base44.entities.Message.delete(id);
                    } catch (err) {
                      console.error("Failed to delete message:", err);
                    }
                  }
                }} />
              )}

              {/* Sub-mode 3: Single QR (12s per QR) */}
              {idleSubMode === "qr" && (
                <SingleQRDisplay qrIndex={currentQRIndex} />
              )}

              {/* Sub-mode 4: Gallery Image (10s) */}
              {idleSubMode === "gallery" && galleryImages.length > 0 && (() => {
                const currentImg = galleryImages[Math.floor(Math.random() * galleryImages.length)];
                return (
                  <motion.div
                    key={`gallery-idle-${currentImg.id}`}
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
                      background: "#000",
                      zIndex: 1
                    }}
                  >
                    <img
                      src={currentImg.image_url}
                      alt="מהגלריה"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{
                      position: "absolute",
                      bottom: "40px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0, 202, 255, 0.9)",
                      padding: "15px 40px",
                      borderRadius: "50px",
                      fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                      fontWeight: "800",
                      color: "#001a2e",
                      boxShadow: "0 0 40px rgba(0, 202, 255, 0.6)"
                    }}>
                      📸 מהגלריה שלנו
                    </div>
                  </motion.div>
                );
              })()}
            </>
          )}

          {/* Old modes removed - replaced with idle system */}
          {false && currentMode === "queue" && (
            <motion.div
              key="queue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px",
                gap: "40px"
              }}
            >
              {/* Background Gallery Slideshow */}
              {galleryImages.length > 0 && (
                <motion.div
                  key={`bg-gallery-${currentGalleryImageIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 0
                  }}
                >
                  <img
                    src={galleryImages[currentGalleryImageIndex]?.image_url}
                    alt="רקע"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "blur(20px)"
                    }}
                  />
                </motion.div>
              )}

              {/* Content overlay */}
              <div style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
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
                  repeat: Infinity
                }}
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: "900",
                  color: "#fbbf24",
                  textShadow: "0 0 40px rgba(251, 191, 36, 0.8)",
                  marginBottom: "20px",
                  textAlign: "center"
                }}
              >
                🎤 הבאים בתור 🎤
              </motion.div>

              {/* Next 3 Singers */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "30px",
                width: "100%",
                maxWidth: "1400px"
              }}>
                {waitingQueue.slice(0, 3).map((req, idx) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    style={{
                      background: idx === 0 
                        ? "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))"
                        : "rgba(15, 23, 42, 0.8)",
                      border: idx === 0 
                        ? "3px solid rgba(251, 191, 36, 0.6)" 
                        : "2px solid rgba(0, 202, 255, 0.3)",
                      borderRadius: "24px",
                      padding: "40px 30px",
                      textAlign: "center",
                      boxShadow: idx === 0 
                        ? "0 0 80px rgba(251, 191, 36, 0.5)" 
                        : "0 0 40px rgba(0, 202, 255, 0.2)",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      minHeight: "350px"
                    }}
                  >
                    {/* Position Badge */}
                    <div style={{
                      position: "absolute",
                      top: "-20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: idx === 0 
                        ? "linear-gradient(135deg, #fbbf24, #f59e0b)" 
                        : "linear-gradient(135deg, #00caff, #0088ff)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      fontWeight: "900",
                      color: "#001a2e",
                      boxShadow: idx === 0 
                        ? "0 0 40px rgba(251, 191, 36, 0.6)" 
                        : "0 0 30px rgba(0, 202, 255, 0.5)",
                      border: "4px solid rgba(2, 6, 23, 0.9)"
                    }}>
                      {idx + 1}
                    </div>

                    {/* Singer Name */}
                    <div style={{
                      fontSize: idx === 0 ? "clamp(2rem, 3vw, 3rem)" : "clamp(1.5rem, 2.5vw, 2.5rem)",
                      fontWeight: "900",
                      color: idx === 0 ? "#fbbf24" : "#00caff",
                      marginBottom: "20px",
                      marginTop: "20px",
                      textShadow: idx === 0 
                        ? "0 0 30px rgba(251, 191, 36, 0.6)" 
                        : "0 0 20px rgba(0, 202, 255, 0.5)",
                      lineHeight: "1.2"
                    }}>
                      {req.singer_name}
                    </div>

                    {/* Song Title */}
                    <div style={{
                      fontSize: idx === 0 ? "clamp(1.3rem, 2vw, 2rem)" : "clamp(1.1rem, 1.8vw, 1.7rem)",
                      color: "#e2e8f0",
                      fontWeight: "700",
                      lineHeight: "1.4",
                      marginBottom: "10px"
                    }}>
                      {req.song_title}
                    </div>

                    {/* Artist Name */}
                    {req.song_artist && (
                      <div style={{
                        fontSize: "1.1rem",
                        color: "#94a3b8",
                        fontWeight: "600"
                      }}>
                        {req.song_artist}
                      </div>
                    )}

                    {/* Special Badge for First */}
                    {idx === 0 && (
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                        style={{
                          marginTop: "20px",
                          padding: "10px 20px",
                          background: "rgba(251, 191, 36, 0.2)",
                          border: "2px solid rgba(251, 191, 36, 0.5)",
                          borderRadius: "12px",
                          fontSize: "1.1rem",
                          fontWeight: "800",
                          color: "#fbbf24"
                        }}
                      >
                        🌟 הבא לבמה! 🌟
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Bottom Note */}
              {waitingQueue.length === 0 && (
                <div style={{
                  fontSize: "1.5rem",
                  color: "#64748b",
                  textAlign: "center"
                }}>
                  אין זמרים בתור כרגע 🎤
                </div>
              )}

              {/* QR Code for Queue - Fixed Bottom Right */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: "fixed",
                  bottom: "40px",
                  right: "40px",
                  background: "rgba(15, 23, 42, 0.95)",
                  padding: "20px",
                  borderRadius: "20px",
                  border: "3px solid rgba(0, 202, 255, 0.6)",
                  boxShadow: "0 0 40px rgba(0, 202, 255, 0.5)",
                  textAlign: "center",
                  zIndex: 100
                }}
              >
                <div style={{
                  fontSize: "1.3rem",
                  fontWeight: "800",
                  color: "#00caff",
                  marginBottom: "10px"
                }}>
                  🎤 הצטרף לתור
                </div>
                <div style={{
                  width: "150px",
                  height: "150px",
                  background: "#fff",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid #00caff"
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/Home`}
                    alt="QR לתור"
                    style={{ width: "90%", height: "90%" }}
                  />
                </div>
              </motion.div>
              </div>
            </motion.div>
          )}

          {false && currentMode === "gallery" && galleryImages.length > 0 && (
            <motion.div
              key={`gallery-${galleryImages[currentGalleryImageIndex]?.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
              <img
                src={galleryImages[currentGalleryImageIndex]?.image_url}
                alt="תמונה מהגלריה"
                style={{
                  width: "100vw",
                  height: "100vh",
                  objectFit: "cover"
                }}
              />
              
              {/* Gallery indicator with counter */}
              <div style={{
                position: "absolute",
                bottom: "40px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0, 202, 255, 0.9)",
                padding: "15px 40px",
                borderRadius: "50px",
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                fontWeight: "800",
                color: "#001a2e",
                boxShadow: "0 0 40px rgba(0, 202, 255, 0.6)",
                zIndex: 10
              }}>
                📸 תמונה {currentGalleryImageIndex + 1} מתוך {galleryImages.length}
              </div>
            </motion.div>
          )}

          {false && currentMode === "messages" && messages.length > 0 && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              onAnimationComplete={() => {
                // Save which messages were displayed
                const msgsToDisplay = messages.slice(0, 3);
                setDisplayedMessages(msgsToDisplay.map(m => m.id));
              }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px",
                gap: "40px"
              }}
            >
              {/* Title */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  fontWeight: "900",
                  color: "#a78bfa",
                  textShadow: "0 0 40px rgba(139, 92, 246, 0.8)",
                  marginBottom: "20px"
                }}
              >
                💬 הודעות מהקהל 💜
              </motion.div>

              {/* Display 2-3 messages in big bold format */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                width: "100%",
                maxWidth: "1200px"
              }}>
                {messages.slice(0, 3).map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.3 }}
                    style={{
                      background: "rgba(139, 92, 246, 0.2)",
                      border: "3px solid rgba(139, 92, 246, 0.5)",
                      borderRadius: "24px",
                      padding: "40px",
                      boxShadow: "0 0 60px rgba(139, 92, 246, 0.4)"
                    }}
                  >
                    <div style={{
                      fontSize: "clamp(1.5rem, 3vw, 2rem)",
                      color: "#a78bfa",
                      marginBottom: "16px",
                      fontWeight: "800"
                    }}>
                      {msg.sender_name}
                    </div>
                    <div style={{
                      fontSize: "clamp(2rem, 4vw, 3.5rem)",
                      color: "#fff",
                      fontWeight: "700",
                      lineHeight: "1.4"
                    }}>
                      {msg.message}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {false && currentMode === "qr" && (
            <motion.div
              key={`qr-${currentQRIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px",
                gap: "50px"
              }}
            >
              {/* Title */}
              <motion.div
                animate={{ 
                  scale: [1, 1.08, 1]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity
                }}
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: "900",
                  background: "linear-gradient(90deg, #00caff 0%, #0088ff 25%, #00d4ff 50%, #0088ff 75%, #00caff 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 3s linear infinite",
                  textAlign: "center",
                  marginBottom: "20px"
                }}
              >
                {currentQRIndex === 0 && "💬 הצטרפו לקבוצה!"}
                {currentQRIndex === 1 && "🎵 עקבו בטיקטוק!"}
                {currentQRIndex === 2 && "📺 הופיעו במסך!"}
              </motion.div>

              {/* Single Large QR Code */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 60px rgba(0, 202, 255, 0.4)",
                    "0 0 100px rgba(0, 202, 255, 0.7)",
                    "0 0 60px rgba(0, 202, 255, 0.4)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  background: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "40px",
                  padding: "60px",
                  border: currentQRIndex === 0 ? "5px solid rgba(0, 202, 255, 0.6)" : 
                         currentQRIndex === 1 ? "5px solid rgba(255, 0, 80, 0.6)" :
                         "5px solid rgba(139, 92, 246, 0.6)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  maxWidth: "700px"
                }}
              >
                {/* QR Icon */}
                <div style={{ 
                  fontSize: "clamp(3rem, 6vw, 5rem)", 
                  marginBottom: "30px"
                }}>
                  {currentQRIndex === 0 && "💬"}
                  {currentQRIndex === 1 && "🎵"}
                  {currentQRIndex === 2 && "📺"}
                </div>

                {/* QR Code */}
                <div style={{
                  width: "clamp(300px, 35vw, 500px)",
                  height: "clamp(300px, 35vw, 500px)",
                  background: "#fff",
                  borderRadius: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "30px",
                  border: "8px solid " + (
                    currentQRIndex === 0 ? "#00caff" : 
                    currentQRIndex === 1 ? "#ff0050" :
                    "#a78bfa"
                  )
                }}>
                  <img 
                    src={
                      currentQRIndex === 0 
                        ? "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
                        : currentQRIndex === 1
                        ? "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://www.tiktok.com/@apiryon.club"
                        : `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${window.location.origin}/UploadToScreen`
                    }
                    alt="QR Code"
                    style={{ width: "90%", height: "90%" }}
                  />
                </div>

                {/* Description */}
                <div style={{ 
                  fontSize: "clamp(1.8rem, 3.5vw, 3rem)", 
                  color: currentQRIndex === 0 ? "#00caff" : 
                         currentQRIndex === 1 ? "#ff0050" :
                         "#a78bfa",
                  fontWeight: "800",
                  textShadow: "0 0 30px currentColor",
                  lineHeight: "1.4",
                  marginBottom: "20px"
                }}>
                  {currentQRIndex === 0 && "קבוצת וואטסאפ"}
                  {currentQRIndex === 1 && "@apiryon.club"}
                  {currentQRIndex === 2 && "העלה תמונות והודעות"}
                </div>

                <div style={{ 
                  fontSize: "clamp(1.3rem, 2.5vw, 2rem)", 
                  color: "#cbd5e1",
                  fontWeight: "600",
                  lineHeight: "1.5"
                }}>
                  {currentQRIndex === 0 && "עדכונים על ערבי קריוקי הבאים"}
                  {currentQRIndex === 1 && "תראו את עצמכם בסרטונים! 📸"}
                  {currentQRIndex === 2 && "הופיעו במסך הגדול!"}
                </div>
              </motion.div>

              {/* Progress Dots */}
              <div style={{ display: "flex", gap: "15px" }}>
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: idx === currentQRIndex ? "#00caff" : "rgba(100, 116, 139, 0.5)",
                      transition: "all 0.3s",
                      boxShadow: idx === currentQRIndex ? "0 0 20px rgba(0, 202, 255, 0.8)" : "none"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

Audience.isPublic = true;