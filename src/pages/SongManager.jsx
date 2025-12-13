import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Loader, Music, Trash2, Edit2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SongManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('-created_date', 1000),
    initialData: [],
  });

  const deleteSongMutation = useMutation({
    mutationFn: (id) => base44.entities.Song.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // תומך בכל סוגי קבצי וידאו - mp4, avi, mov, mkv, webm וכו'
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.mpg', '.mpeg'];
    const fileName = file.name.toLowerCase();
    const isVideo = file.type.startsWith('video/') || videoExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isVideo) {
      setUploadStatus({ type: 'error', message: 'יש להעלות קובץ וידאו בלבד' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: 'loading', message: 'מעלה ווידאו...' });

    try {
      // העלאת הווידאו
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setUploadStatus({ type: 'loading', message: 'מנתח את השיר עם AI...' });

      // ניתוח השיר עם AI
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `זהה את השיר הזה מהווידאו. החזר JSON עם: title (שם השיר), artist (שם האמן), search_keywords (מילות חיפוש רלוונטיות). 
        אם לא ניתן לזהות - נחש לפי השם של הקובץ: ${file.name}`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            artist: { type: "string" },
            search_keywords: { type: "string" }
          }
        },
        file_urls: file_url
      });

      setUploadStatus({ type: 'loading', message: 'מחפש תמונה לשיר...' });

      // חיפוש תמונה לשיר
      const imageResult = await base44.integrations.Core.InvokeLLM({
        prompt: `מצא תמונה מתאימה לשיר "${analysisResult.title}" של ${analysisResult.artist}. החזר רק URL של תמונה איכותית.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            thumbnail_url: { type: "string" }
          }
        }
      });

      // יצירת השיר במאגר
      await base44.entities.Song.create({
        title: analysisResult.title || file.name,
        artist: analysisResult.artist || "לא ידוע",
        video_url: file_url,
        thumbnail_url: imageResult.thumbnail_url || "",
        search_keywords: analysisResult.search_keywords || "",
        is_active: true
      });

      setUploadStatus({ type: 'success', message: '✅ השיר נוסף בהצלחה!' });
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'שגיאה בהעלאת השיר: ' + error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredSongs = songs.filter(song => 
    song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      dir="rtl"
      className="min-h-screen p-6"
      style={{ 
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
        color: "#f9fafb"
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#00caff", textShadow: "0 0 20px rgba(0, 202, 255, 0.5)" }}>
              🎵 מאגר פלייבקים
            </h1>
            <p style={{ color: "#94a3b8" }}>ניהול והעלאת שירי קריוקי</p>
          </div>
          <Link
            to={createPageUrl("Admin")}
            className="px-6 py-3 rounded-xl font-bold"
            style={{
              background: "linear-gradient(135deg, #00caff, #0088ff)",
              color: "#001a2e",
              textDecoration: "none",
              boxShadow: "0 0 20px rgba(0, 202, 255, 0.4)"
            }}
          >
            ← חזרה לניהול
          </Link>
        </div>

        {/* Upload Section */}
        <div 
          className="rounded-2xl p-8 mb-8"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)"
          }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#00caff" }}>
            העלאת פלייבק חדש
          </h2>
          
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all"
            style={{
              borderColor: isUploading ? "#00caff" : "#334155",
              background: isUploading ? "rgba(0, 202, 255, 0.05)" : "rgba(30, 41, 59, 0.5)"
            }}
          >
            {isUploading ? (
              <Loader className="w-16 h-16 animate-spin mb-4" style={{ color: "#00caff" }} />
            ) : (
              <Upload className="w-16 h-16 mb-4" style={{ color: "#00caff" }} />
            )}
            
            <div className="text-xl font-bold mb-2" style={{ color: "#e2e8f0" }}>
              {isUploading ? "מעלה ומנתח..." : "לחץ להעלאת וידאו"}
            </div>
            
            <div className="text-sm" style={{ color: "#94a3b8" }}>
              {isUploading ? "המערכת מזהה את השיר אוטומטית" : "תומך בכל פורמטי וידאו"}
            </div>
            
            <input
              id="video-upload"
              type="file"
              accept="video/*,.mp4,.avi,.mov,.mkv,.webm,.flv,.wmv,.m4v,.mpg,.mpeg"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {uploadStatus && (
            <div 
              className="mt-4 p-4 rounded-xl text-center font-bold"
              style={{
                background: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' :
                           uploadStatus.type === 'error' ? 'rgba(239, 68, 68, 0.2)' :
                           'rgba(0, 202, 255, 0.2)',
                color: uploadStatus.type === 'success' ? '#10b981' :
                       uploadStatus.type === 'error' ? '#ef4444' :
                       '#00caff'
              }}
            >
              {uploadStatus.message}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#64748b" }} />
            <input
              type="text"
              placeholder="חפש שיר או אמן..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl border outline-none"
              style={{
                background: "rgba(15, 23, 42, 0.9)",
                borderColor: "#334155",
                color: "#f9fafb"
              }}
            />
          </div>
        </div>

        {/* Songs Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 animate-spin mx-auto" style={{ color: "#00caff" }} />
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12" style={{ color: "#64748b" }}>
            {searchTerm ? "לא נמצאו שירים" : "אין עדיין שירים במאגר"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="rounded-xl p-4 transition-all hover:scale-105"
                style={{
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(0, 202, 255, 0.2)",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)"
                }}
              >
                {song.thumbnail_url ? (
                  <img 
                    src={song.thumbnail_url} 
                    alt={song.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div 
                    className="w-full h-48 rounded-lg mb-4 flex items-center justify-center"
                    style={{ background: "rgba(0, 202, 255, 0.1)" }}
                  >
                    <Music className="w-16 h-16" style={{ color: "#00caff" }} />
                  </div>
                )}

                <h3 className="text-lg font-bold mb-1" style={{ color: "#e2e8f0" }}>
                  {song.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
                  {song.artist}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`למחוק את "${song.title}"?`)) {
                        deleteSongMutation.mutate(song.id);
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg font-bold transition-all"
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)"
                    }}
                  >
                    <Trash2 className="w-4 h-4 inline ml-2" />
                    מחק
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 text-center" style={{ color: "#64748b" }}>
          סה"כ שירים במאגר: {songs.length}
        </div>
      </div>
    </div>
  );
}