import React, { useState } from "react";
import { Upload, Image, Video, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function MediaUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
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

  const enhanceImageWithAI = async (imageUrl) => {
    try {
      setUploadStatus("🤖 משפר תמונה באמצעות AI - שלב 1...");
      
      // First enhancement: Upscale and improve quality
      const firstPass = await base44.integrations.Core.GenerateImage({
        prompt: `ULTRA HIGH QUALITY 8K UPSCALE: Transform this image into ultra-high resolution 8K quality. Apply professional-grade enhancement: MAXIMUM sharpness and clarity, VIVID and saturated colors (boost saturation by 40%), PERFECT contrast and exposure, remove ALL noise and blur, enhance fine details and textures, professional color grading like a cinema camera, make colors POP and vibrant, crystal-clear focus, broadcast television quality, make it look STUNNING and PROFESSIONAL on giant screens and 4K/8K displays. This should look like it was shot on a RED camera with professional lighting.`,
        existing_image_urls: [imageUrl]
      });
      
      console.log('✨ First AI pass completed');
      
      setUploadStatus("🤖 משפר תמונה באמצעות AI - שלב 2...");
      
      // Second enhancement: Further refine and polish
      const secondPass = await base44.integrations.Core.GenerateImage({
        prompt: `FINAL PROFESSIONAL POLISH 8K: Take this already enhanced image to MAXIMUM quality. Apply final professional touches: razor-sharp details, MAXIMUM color vibrancy and richness, perfect lighting balance, eliminate any remaining imperfections, add depth and dimension, make it look like professional photography, suitable for large format prints and cinema displays. Colors should be incredibly rich and vivid. This is the FINAL master quality version for professional broadcast.`,
        existing_image_urls: [firstPass.url]
      });
      
      console.log('✨ AI double-enhancement completed:', secondPass.url);
      return secondPass.url;
    } catch (error) {
      console.error('⚠️ AI enhancement failed, using original:', error);
      return imageUrl;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📤 Processing file:', file.name, 'Type:', file.type);

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
    setUploadStatus("מעבד ומשפר איכות...");

    try {
      setUploadStatus("מעלה קובץ...");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const mediaType = isVideo ? 'video' : 'image';
      console.log('✅ File uploaded:', file_url, 'Type:', mediaType);
      
      let finalUrl = file_url;
      
      // Enhance images with AI
      if (isImage) {
        finalUrl = await enhanceImageWithAI(file_url);
      }
      
      await base44.entities.MediaUpload.create({
        media_url: finalUrl,
        media_type: mediaType,
        is_active: true
      });

      queryClient.invalidateQueries({ queryKey: ['media-uploads'] });
      setUploadStatus("✅ הקובץ הועלה ושופר בהצלחה!");
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

  const startCamera = async (isVideo = false) => {
    setShowCamera(true);
    try {
      const constraints = isVideo 
        ? { 
            video: { 
              facingMode: 'environment',
              width: { ideal: 3840 },
              height: { ideal: 2160 },
              frameRate: { ideal: 60 }
            }, 
            audio: false 
          }
        : { 
            video: { 
              facingMode: 'environment',
              width: { ideal: 3840 },
              height: { ideal: 2160 }
            } 
          };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Enable torch/flash if available
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: true }]
        });
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        if (isVideo) {
          const options = { 
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 8000000 // 8 Mbps for high quality
          };
          const recorder = new MediaRecorder(stream, options);
          const chunks = [];
          
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            await uploadMedia(blob, 'video');
            stopCamera();
          };
          
          setMediaRecorder(recorder);
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      setUploadStatus("❌ לא ניתן לגשת למצלמה");
      setTimeout(() => setUploadStatus(""), 3000);
      setShowCamera(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    // Use full resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { 
      alpha: false,
      willReadFrequently: false 
    });
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      await uploadMedia(blob, 'image');
      stopCamera();
    }, 'image/jpeg', 0.98);
  };

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecordingVideo(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recordingVideo) {
      mediaRecorder.stop();
      setRecordingVideo(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setRecordingVideo(false);
    setMediaRecorder(null);
  };

  const uploadMedia = async (blob, type) => {
    setIsUploading(true);
    setUploadStatus("מעלה קובץ...");
    
    try {
      const file = new File([blob], `${type}-${Date.now()}.${type === 'video' ? 'webm' : 'jpg'}`, 
        { type: type === 'video' ? 'video/webm' : 'image/jpeg' });
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      let finalUrl = file_url;
      
      // Enhance images with AI
      if (type === 'image') {
        finalUrl = await enhanceImageWithAI(file_url);
      }
      
      await base44.entities.MediaUpload.create({
        media_url: finalUrl,
        media_type: type,
        is_active: true
      });

      queryClient.invalidateQueries({ queryKey: ['media-uploads'] });
      setUploadStatus("✅ הקובץ הועלה ושופר בהצלחה!");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadStatus("❌ שגיאה בהעלאה");
      setTimeout(() => setUploadStatus(""), 3000);
    } finally {
      setIsUploading(false);
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
        צלם או העלה תמונות וסרטונים להצגה במסך הקהל
      </p>

      {!showCamera ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <button
              onClick={() => startCamera(false)}
              disabled={isUploading}
              style={{
                padding: "16px",
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: isUploading ? "not-allowed" : "pointer",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <Image className="w-5 h-5" />
              צלם תמונה
            </button>
            
            <button
              onClick={() => startCamera(true)}
              disabled={isUploading}
              style={{
                padding: "16px",
                background: "linear-gradient(135deg, #ec4899, #be185d)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: isUploading ? "not-allowed" : "pointer",
                boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <Video className="w-5 h-5" />
              צלם וידאו
            </button>
          </div>

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
        </>
      ) : (
        <div style={{ marginBottom: "16px" }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            style={{ 
              width: "100%", 
              maxHeight: "400px", 
              borderRadius: "12px", 
              marginBottom: "12px",
              backgroundColor: "#000"
            }} 
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          
          <div style={{ display: "flex", gap: "12px" }}>
            {mediaRecorder ? (
              recordingVideo ? (
                <button
                  onClick={stopRecording}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  ⏹️ עצור הקלטה
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  ⏺️ התחל הקלטה
                </button>
              )
            ) : (
              <button
                onClick={capturePhoto}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                📸 צלם
              </button>
            )}
            
            <button
              onClick={stopCamera}
              style={{
                padding: "14px 20px",
                background: "rgba(248, 113, 113, 0.2)",
                color: "#f87171",
                border: "2px solid rgba(248, 113, 113, 0.4)",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              ✕ ביטול
            </button>
          </div>
        </div>
      )}

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