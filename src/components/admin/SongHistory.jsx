import React from "react";
import { motion } from "framer-motion";
import { Star, Clock, RotateCcw } from "lucide-react";

export default function SongHistory({ songs, onReturnToQueue }) {
  const formatDuration = (seconds) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {songs.length === 0 ? (
        <div style={{
          padding: "40px",
          textAlign: "center",
          color: "#64748b",
          background: "rgba(30, 41, 59, 0.3)",
          borderRadius: "12px"
        }}>
          אין שירים עדיין
        </div>
      ) : (
        songs.map((song, index) => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              borderRadius: "12px",
              padding: "14px",
              position: "relative"
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
              {song.photo_url && (
                <img
                  src={song.photo_url}
                  alt={song.singer_name}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    border: "2px solid rgba(0, 202, 255, 0.3)"
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "1rem", fontWeight: "700", color: "#f1f5f9", marginBottom: "4px" }}>
                  {song.singer_name}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "4px" }}>
                  {song.song_title}
                  {song.song_artist && <span style={{ color: "#94a3b8" }}> • {song.song_artist}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  {song.average_rating > 0 && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.85rem",
                      color: "#fbbf24"
                    }}>
                      <Star className="w-4 h-4" fill="#fbbf24" />
                      {song.average_rating.toFixed(1)}
                    </div>
                  )}
                  {song.performance_duration_seconds && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.85rem",
                      color: "#94a3b8"
                    }}>
                      <Clock className="w-4 h-4" />
                      {formatDuration(song.performance_duration_seconds)}
                    </div>
                  )}
                </div>
              </div>
              {song.status === "skipped" && onReturnToQueue && (
                <button
                  onClick={() => onReturnToQueue(song.id)}
                  style={{
                    padding: "8px",
                    background: "rgba(0, 202, 255, 0.1)",
                    border: "1px solid rgba(0, 202, 255, 0.3)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "#00caff"
                  }}
                  title="החזר לתור"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}