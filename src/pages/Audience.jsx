import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize, Minimize, Camera, MessageCircle, Home } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ApyironLogo from "../components/ApyironLogo";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// --- 1. Hook לניהול תור חכם ---
const useSmartQueue = () => {
  const [mediaQueue, setMediaQueue] = useState([]);
  const [messageQueue, setMessageQueue] = useState([]);
  const [processedIds, setProcessedIds] = useState(new Set());

  useQuery({
    queryKey: ['incoming-data'],
    queryFn: async () => {
      // שליפת מדיה (FIFO - ישנים קודם)
      const newMedia = await base44.entities.MediaUpload.filter({ is_active: true }, 'created_date', 20);
      // שליפת הודעות
      const newMessages = await base44.entities.Message.list('created_date', 20);

      handleNewItems(newMedia, newMessages);
      return { newMedia, newMessages };
    },
    refetchInterval: 3000
  });

  const handleNewItems = useCallback((serverMedia, serverMessages) => {
    setProcessedIds(prevIds => {
      const newIds = new Set(prevIds);
      let hasChanges = false;

      const freshMedia = serverMedia.filter(m => !newIds.has(m.id));
      if (freshMedia.length > 0) {
        freshMedia.forEach(m => newIds.add(m.id));
        setMediaQueue(prev => [...prev, ...freshMedia]);
        hasChanges = true;
      }

      const freshMessages = serverMessages.filter(m => !newIds.has(m.id));
      if (freshMessages.length > 0) {
        freshMessages.forEach(m => newIds.add(m.id));
        setMessageQueue(prev => [...prev, ...freshMessages]);
        hasChanges = true;
      }

      return hasChanges ? newIds : prevIds;
    });
  }, []);

  const deleteItem = async (type, id) => {
    try {
      if (type === 'media') await base44.entities.MediaUpload.delete(id);
      if (type === 'message') await base44.entities.Message.delete(id);
    } catch (err) {
      console.error(`Failed to delete ${type} ${id}`, err);
    }
  };

  return { mediaQueue, setMediaQueue, messageQueue, setMessageQueue, deleteItem };
};

// --- 2. תצוגות משנה (Views) ---

// תצוגת מדיה (תמונה/וידאו)
const MediaView = ({ data, queueLength }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.8 }}
    className="w-full h-full relative flex items-center justify-center bg-black"
  >
    {queueLength > 0 && (
      <div className="absolute top-8 right-8 bg-black/70 border border-cyan-500/50 px-6 py-3 rounded-full flex items-center gap-3 z-50">
        <Camera className="w-6 h-6 text-cyan-400 animate-pulse" />
        <span className="text-white font-bold text-xl">עוד {queueLength} בתור...</span>
      </div>
    )}
    
    {data.media_type === 'video' ? (
      <video src={data.media_url} autoPlay muted className="w-full h-full object-contain" />
    ) : (
      <img src={data.media_url} alt="User upload" className="w-full h-full object-contain" />
    )}
    
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/80 to-transparent px-10 py-4 text-white text-2xl font-bold rounded-xl">
      הועלה ע"י האורחים באפריון ❤️
    </div>
  </motion.div>
);

// תצוגת הודעות (Batch)
const MessagesView = ({ messages }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.8 }}
    className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-10 gap-8"
  >
    <div className="flex items-center gap-4 mb-6">
      <MessageCircle className="w-12 h-12 text-purple-400" />
      <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        הודעות מהקהל
      </h2>
    </div>
    
    <div className="w-full max-w-5xl flex flex-col gap-6">
      {messages.map((msg, idx) => (
        <motion.div 
          key={msg.id}
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.2 }}
          className="bg-white/5 border border-purple-500/30 p-8 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col gap-2"
        >
          <span className="text-2xl text-purple-300 font-bold">{msg.sender_name}:</span>
          <span className="text-4xl text-white font-bold leading-relaxed">{msg.message}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// תצוגת שיר נוכחי
const SongView = ({ song }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 1 }}
    className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
  >
    {/* Dynamic Background */}
    <div className="absolute inset-0 z-0">
      {song.photo_url ? (
        <img src={song.photo_url} className="w-full h-full object-cover blur-2xl opacity-40 scale-110" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-amber-900/40 to-slate-900" />
      )}
    </div>

    <div className="z-10 flex flex-col items-center gap-8 p-10 text-center max-w-6xl">
      <motion.div 
        animate={{ scale: [1, 1.05, 1], textShadow: ["0 0 20px #fbbf24", "0 0 50px #fbbf24", "0 0 20px #fbbf24"] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-7xl md:text-8xl font-black text-amber-400 mb-4"
      >
        🎤 שר עכשיו!
      </motion.div>

      {song.photo_url && (
        <div className="w-64 h-64 rounded-full border-4 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.6)] overflow-hidden">
          <img src={song.photo_url} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl">{song.singer_name}</h1>
        <h2 className="text-4xl md:text-5xl font-bold text-cyan-400">{song.song_title}</h2>
        {song.song_artist && <h3 className="text-3xl text-slate-300">{song.song_artist}</h3>}
      </div>

      {song.message && (
        <div className="mt-8 bg-white/10 px-8 py-6 rounded-2xl border border-white/20 text-3xl font-medium text-white italic">
          "{song.message}"
        </div>
      )}
    </div>
  </motion.div>
);

// תצוגת IDLE (QR / גלריה / לוגו)
const IdleView = ({ galleryImages }) => {
    // רוטציה פנימית ל-Idle: QR קריוקי -> QR ווטסאפ -> QR טיקטוק -> גלריה -> לוגו
    const [step, setStep] = useState(0);
    const hasGallery = galleryImages && galleryImages.length > 0;
    const totalSteps = hasGallery ? 5 : 4; // 3 QR + גלריה (אם יש) + לוגו
    
    useEffect(() => {
        const interval = setInterval(() => setStep(prev => (prev + 1) % totalSteps), 10000);
        return () => clearInterval(interval);
    }, [totalSteps]);

    const homeUrl = `${window.location.origin}/#/Home`;

    const qrData = [
        {
            title: "תרשם לתור!",
            subtitle: "סרקו לרישום שיר",
            url: homeUrl,
            borderColor: "border-cyan-500",
            shadowColor: "shadow-[0_0_100px_rgba(6,182,212,0.3)]",
            textColor: "text-cyan-400"
        },
        {
            title: "הצטרפו לקבוצה!",
            subtitle: "קבוצת עדכונים בווטסאפ",
            url: "https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15",
            borderColor: "border-green-500",
            shadowColor: "shadow-[0_0_100px_rgba(34,197,94,0.3)]",
            textColor: "text-green-400"
        },
        {
            title: "עקבו בטיקטוק!",
            subtitle: "@apiryon.club",
            url: "https://www.tiktok.com/@apiryon.club",
            borderColor: "border-pink-500",
            shadowColor: "shadow-[0_0_100px_rgba(236,72,153,0.3)]",
            textColor: "text-pink-400"
        }
    ];

    const currentQR = qrData[step];
    const isGalleryStep = step === 3 && hasGallery;
    const isLogoStep = hasGallery ? step === 4 : step === 3;

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center bg-slate-950 relative"
        >
            <AnimatePresence mode="wait">
                {step < 3 && (
                    <motion.div 
                        key={`qr-${step}`}
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                        className={`flex flex-col items-center gap-8 bg-slate-900 p-16 rounded-[3rem] border-4 ${currentQR.borderColor} ${currentQR.shadowColor}`}
                    >
                        <h2 className="text-6xl font-black text-white">{currentQR.title}</h2>
                        <div className="bg-white p-4 rounded-3xl">
                             <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${currentQR.url}`}
                                alt="QR" className="w-80 h-80"
                             />
                        </div>
                        <p className={`text-3xl ${currentQR.textColor} font-bold`}>{currentQR.subtitle}</p>
                    </motion.div>
                )}

                {isGalleryStep && galleryImages.length > 0 && (
                    <motion.div 
                        key="gallery"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="w-full h-full relative"
                    >
                        <img 
                            src={galleryImages[Math.floor(Math.random() * galleryImages.length)].image_url}
                            alt="מהגלריה"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/70 px-10 py-4 rounded-full">
                            <p className="text-4xl text-cyan-400 font-bold">📸 מהגלריה שלנו</p>
                        </div>
                    </motion.div>
                )}

                {isLogoStep && (
                    <motion.div 
                        key="logo"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center flex flex-col items-center gap-12"
                    >
                        <ApyironLogo size="large" showCircle={true} />
                        <p className="text-7xl text-slate-200 font-black tracking-wider">מועדון קריוקי</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// --- 3. קומפוננטה ראשית (The Smart Director) ---
export default function SmartAudience() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { mediaQueue, setMediaQueue, messageQueue, setMessageQueue, deleteItem } = useSmartQueue();
  const [currentView, setCurrentView] = useState({ type: 'loader', data: null });

  // שליפת שיר נוכחי
  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 50),
    refetchInterval: 3000,
  });
  const currentSong = requests.find(r => r.status === "performing");

  // שליפת תמונות גלריה
  const { data: galleryImages = [] } = useQuery({
    queryKey: ['gallery-images-audience'],
    queryFn: async () => {
      const images = await base44.entities.GalleryImage.list('-created_date', 100);
      return images.filter(img => img.image_url);
    },
    refetchInterval: 30000,
  });

  // לוגיקת הבמאי (Director)
  useEffect(() => {
    let timeoutId;
    let isActive = true;

    const playNext = async () => {
      if (!isActive) return;

      // 1. עדיפות עליונה: מדיה (תמונות/וידאו)
      if (mediaQueue.length > 0) {
        const nextMedia = mediaQueue[0];
        // חישוב זמן: אם עמוס (יותר מ-3) רוץ מהר (7 שניות), אחרת 15 שניות
        const duration = mediaQueue.length > 3 ? 7000 : 15000;
        
        setCurrentView({ type: 'media', data: nextMedia });

        await new Promise(r => timeoutId = setTimeout(r, duration));
        
        // ניקוי
        setMediaQueue(prev => prev.slice(1));
        deleteItem('media', nextMedia.id);
        playNext();
        return;
      }

      // 2. עדיפות שנייה: הודעות (Batching)
      if (messageQueue.length > 0) {
        const batch = messageQueue.slice(0, 3);
        setCurrentView({ type: 'messages', data: batch });

        await new Promise(r => timeoutId = setTimeout(r, 12000)); // 12 שניות להודעות

        setMessageQueue(prev => prev.slice(batch.length));
        batch.forEach(msg => deleteItem('message', msg.id));
        playNext();
        return;
      }

      // 3. עדיפות שלישית: שיר מתנגן
      if (currentSong) {
        // בדיקה אם השיר השתנה כדי לרנדר מחדש, אחרת נשארים באותו View
        setCurrentView(prev => (prev.type === 'song' && prev.data?.id === currentSong.id) 
            ? prev 
            : { type: 'song', data: currentSong }
        );
        
        // בדיקה חוזרת עוד 5 שניות אם נכנס משהו חדש לתור
        timeoutId = setTimeout(playNext, 5000);
        return;
      }

      // 4. ברירת מחדל: IDLE
      setCurrentView({ type: 'idle', data: null });
      timeoutId = setTimeout(playNext, 5000);
    };

    playNext();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [mediaQueue.length, messageQueue.length, currentSong?.id, deleteItem, setMediaQueue, setMessageQueue]);

  // ניהול מסך מלא
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div dir="rtl" className="fixed inset-0 bg-black text-white overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {currentView.type === 'media' && (
           <MediaView key="media" data={currentView.data} queueLength={mediaQueue.length - 1} />
        )}
        
        {currentView.type === 'messages' && (
           <MessagesView key="messages" messages={currentView.data} />
        )}

        {currentView.type === 'song' && (
           <SongView key="song" song={currentView.data} />
        )}

        {currentView.type === 'idle' && (
           <IdleView key="idle" galleryImages={galleryImages} />
        )}

        {currentView.type === 'loader' && (
            <div key="loader" className="w-full h-full flex items-center justify-center bg-black">
                <div className="text-cyan-500 animate-pulse text-2xl">טוען נתונים...</div>
            </div>
        )}
      </AnimatePresence>

      {/* כפתורי ניווט */}
      <div className="fixed bottom-4 right-4 z-[100] flex gap-3">
        <Link
          to={createPageUrl("Home")}
          className="p-3 bg-slate-900/80 rounded-xl text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
        >
          <Home size={24} />
        </Link>
        <button 
          onClick={toggleFullscreen}
          className="p-3 bg-slate-900/80 rounded-xl text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </div>
    </div>
  );
}

SmartAudience.isPublic = true;