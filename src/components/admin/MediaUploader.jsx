import React, { useState } from "react";
import { Upload, Image, Video, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function MediaUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const queryClient = useQueryClient();

  const { data: mediaList = [] } = useQuery({
    queryKey: ['media-uploads'],
    queryFn: () => base44.entities.MediaUpload.list('-created_date', 10),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MediaUpload.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-uploads'] });
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📤 Uploading file:', file.name, 'Type:', file.type);

    const isVideo = file.type.startsWith('video/') || 
                    file.name.toLowerCase().match(/\.(mp4|mov|avi|webm|mkv)$/);
    const isImage = file.type.startsWith('image/') || 
                    file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);

    if (!isVideo && !isImage) {
      setUploadStatus("❌ ניתן להעלות רק תמונות או סרטונים");
      setTimeout(() => setUploadStatus(""), 3000);
      return;
    }

    setIsUploading(true);
    setUploadStatus("מעלה קובץ...");

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const mediaType = isVideo ? 'video' : 'image';
      console.log('✅ File uploaded:', file_url, 'Detected type:', mediaType);
      
      await base44.entities.MediaUpload.create({
        media_url: file_url,
        media_type: mediaType,
        is_active: true
      });

      queryClient.invalidateQueries({ queryKey: ['media-uploads'] });
      setUploadStatus("✅ הקובץ הועלה בהצלחה!");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadStatus("❌ שגיאה בהעלאה");
      setTimeout(() => setUploadStatus(""), 3000);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{
      background: "rgba(15, 23, 42, 0.95)",
      borderRadius: "20px",
      padding: "24px",
      border: "2px solid rgba(0, 202, 255, 0.3)",
      boxShadow: "0 10px 40px rgba(0, 202, 255, 0.2)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px"
      }}>
        <Upload className="w-6 h-6" style={{ color: "#00caff" }} />
        <h2 style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "#00caff",
          textShadow: "0 0 20px rgba(0, 202, 255, 0.5)"
        }}>
          העלאת מדיה למסך קהל
        </h2>
      </div>

      <p style={{ color: "#cbd5e1", marginBottom: "20px", fontSize: "0.95rem" }}>
        העלה תמונות או סרטונים שיוצגו במסך הקהל. הקובץ האחרון שהועלה יוצג אוטומטית.
      </p>

      <label style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "20px",
        background: isUploading ? "rgba(100, 116, 139, 0.3)" : "linear-gradient(135deg, #00caff, #0088ff)",
        color: isUploading ? "#94a3b8" : "#001a2e",
        borderRadius: "14px",
        fontSize: "1.1rem",
        fontWeight: "700",
        cursor: isUploading ? "not-allowed" : "pointer",
        border: isUploading ? "2px dashed rgba(0, 202, 255, 0.3)" : "none",
        boxShadow: isUploading ? "none" : "0 0 25px rgba(0, 202, 255, 0.5)",
        transition: "all 0.3s",
        marginBottom: "16px"
      }}>
        {isUploading ? (
          <>
            <div className="spinner" style={{
              width: "20px",
              height: "20px",
              border: "3px solid rgba(0, 202, 255, 0.3)",
              borderTop: "3px solid #00caff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            מעלה...
          </>
        ) : (
          <>
            <Image className="w-5 h-5" />
            <Video className="w-5 h-5" />
            בחר תמונה או וידאו קצר
          </>
        )}
        <input
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime,video/x-msvideo"
          capture="environment"
          onChange={handleFileUpload}
          disabled={isUploading}
          style={{ display: "none" }}
        />
      </label>

      {uploadStatus && (
        <div style={{
          padding: "12px",
          borderRadius: "10px",
          background: uploadStatus.includes("✅") ? "rgba(16, 185, 129, 0.2)" : "rgba(248, 113, 113, 0.2)",
          border: `1px solid ${uploadStatus.includes("✅") ? "rgba(16, 185, 129, 0.4)" : "rgba(248, 113, 113, 0.4)"}`,
          color: uploadStatus.includes("✅") ? "#10b981" : "#f87171",
          textAlign: "center",
          fontWeight: "600",
          marginBottom: "16px"
        }}>
          {uploadStatus}
        </div>
      )}

      {/* Media List */}
      {mediaList.length > 0 && (
        <div>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "700",
            color: "#e2e8f0",
            marginBottom: "12px",
            marginTop: "24px"
          }}>
            קבצים שהועלו ({mediaList.length})
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "12px"
          }}>
            {mediaList.map((media, index) => (
              <div key={media.id} style={{
                position: "relative",
                background: "rgba(30, 41, 59, 0.5)",
                borderRadius: "12px",
                overflow: "hidden",
                border: index === 0 ? "2px solid #00caff" : "1px solid rgba(0, 202, 255, 0.2)"
              }}>
                {media.media_type === 'video' ? (
                  <video
                    src={media.media_url}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <img
                    src={media.media_url}
                    alt="תמונה"
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover"
                    }}
                  />
                )}
                {index === 0 && (
                  <div style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "#00caff",
                    color: "#001a2e",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: "700"
                  }}>
                    מוצג עכשיו
                  </div>
                )}
                <button
                  onClick={() => deleteMutation.mutate(media.id)}
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "4px",
                    background: "rgba(248, 113, 113, 0.9)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Trash2 className="w-4 h-4" style={{ color: "#fff" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}