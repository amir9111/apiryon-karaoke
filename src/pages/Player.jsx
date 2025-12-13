import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Maximize,
  Settings,
  Sparkles,
  Waves
} from "lucide-react";

export default function Player() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoQuality, setVideoQuality] = useState("auto");
  const [aiEnhancement, setAiEnhancement] = useState(true);
  const [pitchShift, setPitchShift] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

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

  // Initialize Web Audio API
  useEffect(() => {
    if (videoRef.current && !audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(videoRef.current);
        gainNodeRef.current = audioContextRef.current.createGain();
        
        sourceNodeRef.current
          .connect(gainNodeRef.current)
          .connect(audioContextRef.current.destination);
      } catch (error) {
        console.error("Audio context initialization failed:", error);
      }
    }
  }, []);

  // Apply pitch shift
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = Math.pow(2, pitchShift / 12);
    }
  }, [pitchShift]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle song change
  useEffect(() => {
    if (performingRequest && performingRequest.song_id) {
      const song = songs.find(s => s.id === performingRequest.song_id);
      if (song && song.id !== currentSong?.id) {
        setCurrentSong(song);
        setCurrentTime(0);
        setPitchShift(0);
        
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().then(() => {
              setIsPlaying(true);
              if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
              }
            }).catch(err => {
              console.log("Autoplay prevented:", err);
            });
          }
        }, 100);
      }
    } else if (!performingRequest) {
      setCurrentSong(null);
      setIsPlaying(false);
    }
  }, [performingRequest, songs, currentSong]);

  // Time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('durationchange', updateDuration);
    
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('durationchange', updateDuration);
    };
  }, [currentSong]);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
      }
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const toggleFullscreen = () => {
    const elem = videoRef.current;
    if (!elem) return;
    
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center relative"
      style={{ 
        background: "#000000",
        color: "#ffffff"
      }}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      {currentSong ? (
        <div className="w-full h-screen relative">
          {/* Video Player */}
          <video
            ref={videoRef}
            src={currentSong.video_url}
            className="w-full h-full object-contain"
            style={{ background: "#000" }}
            playsInline
          />



          {/* Info Overlay */}
          <div 
            className="absolute top-6 right-6 p-4 rounded-2xl max-w-sm"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(0, 202, 255, 0.5)",
              boxShadow: "0 0 40px rgba(0, 202, 255, 0.3)",
              opacity: showControls ? 1 : 0,
              transition: "opacity 0.3s"
            }}
          >
            <div className="text-xs mb-2" style={{ color: "#00caff", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              🎤 מתבצע עכשיו
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#ffffff", textShadow: "0 0 20px rgba(0, 202, 255, 0.5)" }}>
              {performingRequest.singer_name}
            </h2>
            <div className="text-lg mb-1" style={{ color: "#e2e8f0" }}>
              {currentSong.title}
            </div>
            <div className="text-sm" style={{ color: "#94a3b8" }}>
              {currentSong.artist}
            </div>
          </div>

          {/* Bottom Controls */}
          <div 
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{
              background: "linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)",
              opacity: showControls ? 1 : 0,
              transition: "opacity 0.3s"
            }}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full"
                style={{
                  appearance: "none",
                  height: "6px",
                  background: `linear-gradient(to right, #00caff ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%)`,
                  borderRadius: "3px",
                  outline: "none",
                  cursor: "pointer"
                }}
              />
              <div className="flex justify-between text-sm mt-2" style={{ color: "#94a3b8" }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="p-4 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #00caff, #0088ff)",
                    boxShadow: "0 0 20px rgba(0, 202, 255, 0.5)"
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" style={{ color: "#001a2e" }} />
                  ) : (
                    <Play className="w-6 h-6" style={{ color: "#001a2e" }} />
                  )}
                </button>

                {/* Skip buttons */}
                <button
                  onClick={() => skip(-10)}
                  className="p-3 rounded-full"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => skip(10)}
                  className="p-3 rounded-full"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Volume Control */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" style={{ color: "#ef4444" }} />
                    ) : (
                      <Volume2 className="w-5 h-5" style={{ color: "#00caff" }} />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-24"
                    style={{
                      appearance: "none",
                      height: "4px",
                      background: `linear-gradient(to right, #00caff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`,
                      borderRadius: "2px",
                      cursor: "pointer"
                    }}
                  />
                </div>

                {/* Settings */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-3 rounded-full"
                  style={{
                    background: showSettings ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.1)",
                    border: `1px solid ${showSettings ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.2)"}`
                  }}
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-3 rounded-full"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div 
              className="absolute bottom-24 left-6 p-6 rounded-2xl"
              style={{
                background: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(20px)",
                border: "2px solid rgba(139, 92, 246, 0.5)",
                boxShadow: "0 0 40px rgba(139, 92, 246, 0.3)",
                minWidth: "320px"
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#00caff" }}>
                🎵 שליטה בטון
              </h3>

              {/* Pitch Shift */}
              <div className="mb-4">
                <label className="text-base font-bold block mb-3 text-center" style={{ color: "#e2e8f0" }}>
                  {pitchShift === 0 ? "טון מקורי" : pitchShift > 0 ? `העלאה: +${pitchShift}` : `הורדה: ${pitchShift}`}
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => setPitchShift(Math.max(-6, pitchShift - 1))}
                    className="px-4 py-2 rounded-lg font-bold"
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "#fff"
                    }}
                  >
                    🔽 הורד
                  </button>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="1"
                    value={pitchShift}
                    onChange={(e) => setPitchShift(parseInt(e.target.value))}
                    className="flex-1"
                    style={{
                      appearance: "none",
                      height: "8px",
                      background: `linear-gradient(to right, #ef4444 0%, #00caff ${((pitchShift + 6) / 12) * 100}%, #10b981 100%)`,
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  />
                  <button
                    onClick={() => setPitchShift(Math.min(6, pitchShift + 1))}
                    className="px-4 py-2 rounded-lg font-bold"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff"
                    }}
                  >
                    🔼 העלה
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setPitchShift(0)}
                className="w-full py-3 rounded-lg text-base font-bold"
                style={{
                  background: "rgba(0, 202, 255, 0.2)",
                  border: "2px solid rgba(0, 202, 255, 0.5)",
                  color: "#00caff"
                }}
              >
                🔄 איפוס לטון מקורי
              </button>
            </div>
          )}
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
          
          <p className="text-xl mb-8" style={{ color: "#94a3b8" }}>
            המסך יתעדכן אוטומטית כשהמנהל יאשר שיר
          </p>

          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 rounded-xl" style={{ background: "rgba(0, 202, 255, 0.05)", border: "1px solid rgba(0, 202, 255, 0.2)" }}>
              <p className="text-sm" style={{ color: "#64748b" }}>
                💡 מסך נגן מקצועי עם Web Audio API
              </p>
            </div>
            
            <div className="p-4 rounded-lg" style={{ background: "rgba(0, 202, 255, 0.1)", border: "1px solid rgba(0, 202, 255, 0.2)" }}>
              <Music className="w-8 h-8 mb-2 mx-auto" style={{ color: "#00caff" }} />
              <div style={{ color: "#00caff", fontWeight: "600" }}>שליטה בטון השיר</div>
              <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "4px" }}>העלה או הורד עד 6 צלילים</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00caff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 202, 255, 0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00caff;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 202, 255, 0.5);
        }
      `}</style>
    </div>
  );
}