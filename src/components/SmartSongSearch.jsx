import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Music, Loader } from "lucide-react";

export default function SmartSongSearch({ onSongSelect, disabled }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  const { data: songs = [] } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('-created_date', 1000),
    initialData: [],
  });

  useEffect(() => {
    if (searchTerm.length < 2) {
      setAiResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      
      // חיפוש מקומי במאגר
      const localResults = songs.filter(song => 
        song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.search_keywords?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setAiResults(localResults.slice(0, 5));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, songs]);

  const handleSelectSong = (song) => {
    setSelectedSong(song);
    setSearchTerm(song.title);
    setAiResults([]);
    onSongSelect(song);
  };

  const handleClearSelection = () => {
    setSelectedSong(null);
    setSearchTerm("");
    onSongSelect(null);
  };

  return (
    <div className="relative">
      <label className="block text-[0.9rem] mb-0.5">
        שם השיר <span style={{ color: "#00caff" }}>*</span>
      </label>
      
      {selectedSong ? (
        <div 
          className="p-4 rounded-xl border-2 mb-2"
          style={{
            background: "rgba(0, 202, 255, 0.1)",
            borderColor: "#00caff"
          }}
        >
          <div className="flex items-center gap-3">
            {selectedSong.thumbnail_url ? (
              <img 
                src={selectedSong.thumbnail_url} 
                alt={selectedSong.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0, 202, 255, 0.2)" }}
              >
                <Music className="w-8 h-8" style={{ color: "#00caff" }} />
              </div>
            )}
            
            <div className="flex-1">
              <div className="font-bold" style={{ color: "#e2e8f0" }}>
                {selectedSong.title}
              </div>
              <div className="text-sm" style={{ color: "#94a3b8" }}>
                {selectedSong.artist}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleClearSelection}
              disabled={disabled}
              className="px-4 py-2 rounded-lg text-sm font-bold"
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.3)"
              }}
            >
              שנה
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{ color: "#64748b" }} 
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={disabled}
              required
              placeholder="חפש שיר... לדוגמה: הנה זה בא"
              className="w-full pr-10 pl-3 py-2.5 rounded-xl border outline-none text-[0.95rem]"
              style={{
                borderColor: "#1f2937",
                background: "rgba(15,23,42,0.9)",
                color: "#f9fafb"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#00caff";
                e.target.style.boxShadow = "0 0 0 1px rgba(0, 202, 255, 0.5)";
              }}
              onBlur={(e) => {
                setTimeout(() => {
                  e.target.style.borderColor = "#1f2937";
                  e.target.style.boxShadow = "none";
                }, 200);
              }}
            />
            {isSearching && (
              <Loader 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin" 
                style={{ color: "#00caff" }} 
              />
            )}
          </div>

          {aiResults.length > 0 && (
            <div 
              className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden border"
              style={{
                background: "rgba(15, 23, 42, 0.98)",
                borderColor: "#334155",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
                maxHeight: "400px",
                overflowY: "auto"
              }}
            >
              {aiResults.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => handleSelectSong(song)}
                  className="w-full p-3 flex items-center gap-3 transition-all hover:bg-opacity-50"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(51, 65, 85, 0.5)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 202, 255, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {song.thumbnail_url ? (
                    <img 
                      src={song.thumbnail_url} 
                      alt={song.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(0, 202, 255, 0.2)" }}
                    >
                      <Music className="w-6 h-6" style={{ color: "#00caff" }} />
                    </div>
                  )}
                  
                  <div className="flex-1 text-right">
                    <div className="font-bold text-sm" style={{ color: "#e2e8f0" }}>
                      {song.title}
                    </div>
                    <div className="text-xs" style={{ color: "#94a3b8" }}>
                      {song.artist}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchTerm.length >= 2 && aiResults.length === 0 && !isSearching && (
            <div 
              className="mt-2 p-3 rounded-lg text-sm text-center"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444"
              }}
            >
              לא נמצאו שירים. נסה מילים אחרות או פנה למנהל להוסיף את השיר למאגר.
            </div>
          )}
        </>
      )}

      <div className="text-xs mt-1" style={{ color: "#64748b" }}>
        💡 מערכת חכמה מוצאת את השיר המתאים מהמאגר
      </div>
    </div>
  );
}