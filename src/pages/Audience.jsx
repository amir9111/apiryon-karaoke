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

  const [currentMode, setCurrentMode] = useState("queue"); // "media", "queue", "qr"
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState([]);

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const { data: mediaUploads = [] } = useQuery({
    queryKey: ['media-uploads'],
    queryFn: async () => {
      const data = await base44.entities.MediaUpload.filter({ is_active: true }, '-created_date', 50);
      return data;
    },
    refetchInterval: 5000,
    staleTime: 4000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 20),
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const currentSong = requests.find(r => r.status === "performing");
  const waitingQueue = requests.filter(r => r.status === "waiting").slice(0, 4);

  // Delete displayed messages when mode changes
  React.useEffect(() => {
    const deleteMessages = async () => {
      if (displayedMessages.length > 0) {
        for (const msgId of displayedMessages) {
          try {
            await base44.entities.Message.delete(msgId);
          } catch (err) {
            console.error("Failed to delete message:", err);
          }
        }
        setDisplayedMessages([]);
      }
    };

    if (currentMode !== "messages") {
      deleteMessages();
    }
  }, [currentMode]);

  // Smart rotation logic - Show each media only once per cycle
  React.useEffect(() => {
    // Check for new media uploads
    const newMediaIds = new Set(mediaUploads.map(m => m.id));
    const hasNewMedia = mediaUploads.some(m => !displayedMediaIds.has(m.id));
    
    // Reset displayed media if all current media is new
    if (hasNewMedia && displayedMediaIds.size > 0 && !Array.from(displayedMediaIds).some(id => newMediaIds.has(id))) {
      setDisplayedMediaIds(new Set());
    }
  }, [mediaUploads, displayedMediaIds]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMode(prev => {
        // Find undisplayed media
        const undisplayedMedia = mediaUploads.filter(m => !displayedMediaIds.has(m.id));
        
        // If we have undisplayed media and we're coming from queue or QR
        if ((prev === "queue" || prev === "qr") && undisplayedMedia.length > 0) {
          const firstUndisplayed = mediaUploads.findIndex(m => !displayedMediaIds.has(m.id));
          setCurrentMediaIndex(firstUndisplayed);
          // Mark this media as displayed
          setDisplayedMediaIds(prevSet => new Set([...prevSet, mediaUploads[firstUndisplayed].id]));
          return "media";
        }
        
        // After media, check if there's more undisplayed media
        if (prev === "media") {
          const nextUndisplayed = mediaUploads.slice(currentMediaIndex + 1).find(m => !displayedMediaIds.has(m.id));
          if (nextUndisplayed) {
            const nextIndex = mediaUploads.indexOf(nextUndisplayed);
            setCurrentMediaIndex(nextIndex);
            setDisplayedMediaIds(prevSet => new Set([...prevSet, nextUndisplayed.id]));
            return "media";
          }
          // All media shown, go to queue
          return "queue";
        }
        
        // After queue, show QR codes
        if (prev === "queue") return "qr";
        
        // After QR, go back to queue (don't repeat media)
        return "queue";
      });
    }, currentMode === "media" ? 30000 : currentMode === "queue" ? 25000 : 15000);

    return () => clearInterval(interval);
  }, [currentMode, mediaUploads, currentMediaIndex, displayedMediaIds]);

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

          {/* Mode 1: Media Display (30 seconds each) */}
          {currentMode === "media" && mediaUploads[currentMediaIndex] && (
            <motion.div
              key={`media-${currentMediaIndex}`}
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
              {mediaUploads[currentMediaIndex].media_type === 'video' ? (
                <video
                  key={mediaUploads[currentMediaIndex].media_url}
                  src={mediaUploads[currentMediaIndex].media_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                  }}
                />
              ) : (
                <img
                  src={mediaUploads[currentMediaIndex].media_url}
                  alt="מהקהל"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                  }}
                />
              )}
              
              {/* Flash Text */}
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
                  position: "absolute",
                  top: "40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "clamp(1.5rem, 4vw, 3rem)",
                  fontWeight: "900",
                  color: "#fff",
                  textShadow: "0 0 40px rgba(0, 202, 255, 0.8), 0 0 80px rgba(0, 202, 255, 0.5)",
                  background: "rgba(0, 0, 0, 0.6)",
                  padding: "12px 32px",
                  borderRadius: "20px"
                }}
              >
                📸 אתה במצלמה! 🎉
              </motion.div>
            </motion.div>
          )}

          {/* Mode 2: Queue (25 seconds) */}
          {currentMode === "queue" && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
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
            </motion.div>
          )}

          {/* Mode 2.5: Big Bold Messages (20 seconds) */}
          {currentMode === "messages" && messages.length > 0 && (
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

          {/* Mode 3: QR Codes (15 seconds) */}
          {currentMode === "qr" && (
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
                gap: "30px",
                maxWidth: "1200px",
                width: "100%"
              }}>
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

                {/* QR Code for Upload to Screen */}
                <div style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    borderRadius: "24px",
                    padding: "30px",
                    border: "3px solid rgba(139, 92, 246, 0.5)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 60px rgba(139, 92, 246, 0.3)",
                    backdropFilter: "blur(30px)"
                  }}
                >
                  <div style={{ 
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)", 
                    color: "#a78bfa", 
                    marginBottom: "20px",
                    fontWeight: "800",
                    textShadow: "0 0 20px rgba(139, 92, 246, 0.8)"
                  }}>
                    📺 הופיעו פה!
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
                    boxShadow: "0 0 40px rgba(139, 92, 246, 0.4)",
                    border: "4px solid #a78bfa"
                  }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${window.location.origin}/UploadToScreen`}
                      alt="QR Code העלאה למסך"
                      style={{ width: "90%", height: "90%" }}
                    />
                  </div>

                  <div style={{ 
                    fontSize: "clamp(1.2rem, 2vw, 1.8rem)", 
                    color: "#cbd5e1",
                    fontWeight: "700",
                    lineHeight: "1.4"
                  }}>
                    העלה תמונות והודעות למסך!
                  </div>
                </div>
              </div>

              {/* Rating Reminder */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
                style={{
                  marginTop: "40px",
                  padding: "20px 40px",
                  background: "rgba(251, 191, 36, 0.15)",
                  border: "2px solid rgba(251, 191, 36, 0.4)",
                  borderRadius: "20px",
                  textAlign: "center"
                }}
              >
                <div style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  fontWeight: "900",
                  color: "#fbbf24",
                  marginBottom: "10px"
                }}>
                  ⭐ אל תשכחו לדרג את הזמרים! ⭐
                </div>
                <div style={{
                  fontSize: "clamp(1rem, 2vw, 1.5rem)",
                  color: "#cbd5e1"
                }}>
                  סרקו את הQR בתור והצביעו לזמרים האהובים עליכם
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

Audience.isPublic = true;