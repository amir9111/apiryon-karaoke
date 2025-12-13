import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Music, Volume2, VolumeX } from "lucide-react";

export default function Player() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 2000,
    initialData: [],
  });

  const { data: songs = [] } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('-created_date', 1000),
    initialData: [],
  });

  const performingRequest = requests.find(r => r.status === "performing");

  useEffect(() => {
    if (performingRequest && performingRequest.song_id) {
      const song = songs.find(s => s.id === performingRequest.song_id);
      if (song && song.id !== currentSong?.id) {
        setCurrentSong(song);
        
        // הפעלת הווידאו אוטומטית
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.log("Autoplay prevented:", err);
            });
          }
        }, 500);
      }
    } else if (!performingRequest) {
      setCurrentSong(null);
    }
  }, [performingRequest, songs]);

  return (
    <div 
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center"
      style={{ 
        background: "#000000",
        color: "#ffffff"
      }}
    >
      {currentSong ? (
        <div className="w-full h-screen relative">
          {/* Video Player */}
          <video
            ref={videoRef}
            src={currentSong.video_url}
            className="w-full h-full object-contain"
            controls
            autoPlay
            muted={isMuted}
            style={{ background: "#000" }}
          />

          {/* Info Overlay */}
          <div 
            className="absolute top-8 right-8 p-6 rounded-2xl max-w-md"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(0, 202, 255, 0.5)",
              boxShadow: "0 0 40px rgba(0, 202, 255, 0.3)"
            }}
          >
            <div className="text-sm mb-2" style={{ color: "#00caff", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              🎤 מתבצע עכשיו
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: "#ffffff", textShadow: "0 0 20px rgba(0, 202, 255, 0.5)" }}>
              {performingRequest.singer_name}
            </h2>
            <div className="text-xl mb-1" style={{ color: "#e2e8f0" }}>
              {currentSong.title}
            </div>
            <div className="text-lg" style={{ color: "#94a3b8" }}>
              {currentSong.artist}
            </div>
          </div>

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-8 left-8 p-4 rounded-full transition-all"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              border: "2px solid rgba(0, 202, 255, 0.5)",
              boxShadow: "0 0 20px rgba(0, 202, 255, 0.3)"
            }}
          >
            {isMuted ? (
              <VolumeX className="w-8 h-8" style={{ color: "#ef4444" }} />
            ) : (
              <Volume2 className="w-8 h-8" style={{ color: "#00caff" }} />
            )}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div 
            className="w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center"
            style={{
              background: "rgba(0, 202, 255, 0.1)",
              border: "3px solid rgba(0, 202, 255, 0.3)",
              boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)"
            }}
          >
            <Music className="w-16 h-16 animate-pulse" style={{ color: "#00caff" }} />
          </div>
          
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#00caff", textShadow: "0 0 20px rgba(0, 202, 255, 0.5)" }}>
            מחכה לשיר הבא...
          </h2>
          
          <p className="text-xl" style={{ color: "#94a3b8" }}>
            המסך יתעדכן אוטומטית כשהמנהל יאשר שיר
          </p>

          <div className="mt-8 p-4 rounded-xl max-w-md mx-auto" style={{ background: "rgba(0, 202, 255, 0.05)", border: "1px solid rgba(0, 202, 255, 0.2)" }}>
            <p className="text-sm" style={{ color: "#64748b" }}>
              💡 טיפ: השאר את המסך פתוח לצפייה רציפה בבלייבקים
            </p>
          </div>
        </div>
      )}
    </div>
  );
}