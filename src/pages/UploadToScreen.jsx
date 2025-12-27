import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Upload, Send, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ApyironLogo from "../components/ApyironLogo";
import MenuButton from "../components/MenuButton";

export default function UploadToScreen() {
  const [activeTab, setActiveTab] = useState("photo");
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [status, setStatus] = useState({ type: null, message: "" });
  
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const savedName = localStorage.getItem('apiryon_user_name');
    if (savedName) {
      setSenderName(savedName);
    }
  }, []);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setStatus({ type: "error", message: "לא ניתן לגשת למצלמה" });
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoData);
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const handlePhotoUpload = async () => {
    if (!capturedPhoto) {
      setStatus({ type: "error", message: "נא לצלם או להעלות תמונה" });
      return;
    }

    setIsUploading(true);
    try {
      const blob = await fetch(capturedPhoto).then(r => r.blob());
      const file = new File([blob], "audience.jpg", { type: "image/jpeg" });
      const upload = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.MediaUpload.create({
        media_url: upload.file_url,
        media_type: "image",
        is_active: true
      });

      await queryClient.invalidateQueries({ queryKey: ['media-uploads'] });

      setStatus({ type: "ok", message: "✅ התמונה הועלתה למסך הקהל!" });
      setCapturedPhoto(null);
      setTimeout(() => setStatus({ type: null, message: "" }), 3000);
    } catch (err) {
      setStatus({ type: "error", message: "שגיאה בהעלאת התמונה" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMessageSend = async () => {
    if (!message.trim() || !senderName.trim()) {
      setStatus({ type: "error", message: "נא למלא שם והודעה" });
      return;
    }

    setIsUploading(true);
    try {
      await base44.entities.Message.create({
        sender_name: senderName.trim(),
        message: message.trim()
      });

      setStatus({ type: "ok", message: "✅ ההודעה נשלחה למסך!" });
      setMessage("");
      setTimeout(() => setStatus({ type: null, message: "" }), 3000);
    } catch (err) {
      setStatus({ type: "error", message: "שגיאה בשליחת ההודעה" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      dir="rtl"
      className="min-h-screen w-full flex justify-center p-4"
      style={{ 
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", 
        color: "#f9fafb" 
      }}
    >
      <div className="w-full max-w-[480px]">
        {/* Back Button */}
        <Link
          to={createPageUrl("Home")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#00caff",
            fontSize: "0.95rem",
            fontWeight: "600",
            marginBottom: "16px",
            textDecoration: "none"
          }}
        >
          <ArrowRight className="w-5 h-5" />
          חזרה לתור
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <ApyironLogo size="medium" showCircle={true} />
        </div>

        <div
          className="rounded-[18px] p-5"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            boxShadow: "0 10px 30px rgba(0, 202, 255, 0.2)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 202, 255, 0.2)"
          }}
        >
          <h1 
            className="text-[1.6rem] font-bold text-center mb-2"
            style={{
              color: "#00caff",
              textShadow: "0 0 20px rgba(0, 202, 255, 0.5)"
            }}
          >
            📺 העלה למסך הקהל
          </h1>
          <p className="text-[0.9rem] text-center mb-6" style={{ color: "#cbd5e1" }}>
            שלח תמונה או הודעה שיופיעו על המסכים
          </p>

          {/* Tabs */}
          <div style={{ 
            display: "flex", 
            gap: "12px", 
            marginBottom: "24px" 
          }}>
            <button
              onClick={() => setActiveTab("photo")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: activeTab === "photo" 
                  ? "2px solid rgba(0, 202, 255, 0.5)" 
                  : "1px solid rgba(51, 65, 85, 0.5)",
                background: activeTab === "photo" 
                  ? "rgba(0, 202, 255, 0.15)" 
                  : "rgba(30, 41, 59, 0.3)",
                color: activeTab === "photo" ? "#00caff" : "#94a3b8",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <Camera className="w-5 h-5" />
              תמונה
            </button>
            <button
              onClick={() => setActiveTab("message")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: activeTab === "message" 
                  ? "2px solid rgba(139, 92, 246, 0.5)" 
                  : "1px solid rgba(51, 65, 85, 0.5)",
                background: activeTab === "message" 
                  ? "rgba(139, 92, 246, 0.15)" 
                  : "rgba(30, 41, 59, 0.3)",
                color: activeTab === "message" ? "#a78bfa" : "#94a3b8",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <Send className="w-5 h-5" />
              הודעה
            </button>
          </div>

          {/* Photo Upload Tab */}
          {activeTab === "photo" && (
            <div>
              {!capturedPhoto ? (
                <div>
                  {!showCamera ? (
                    <div style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "12px" 
                    }}>
                      <button
                        onClick={startCamera}
                        style={{
                          padding: "16px",
                          background: "linear-gradient(135deg, #00caff, #0088ff)",
                          color: "#001a2e",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "1.1rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 0 30px rgba(0, 202, 255, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px"
                        }}
                      >
                        <Camera className="w-5 h-5" />
                        פתח מצלמה
                      </button>

                      <div style={{ 
                        textAlign: "center", 
                        color: "#94a3b8", 
                        fontSize: "0.9rem" 
                      }}>
                        או
                      </div>

                      <label
                        htmlFor="photo-upload"
                        style={{
                          padding: "16px",
                          background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "1.1rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px"
                        }}
                      >
                        <Upload className="w-5 h-5" />
                        העלה תמונה
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCapturedPhoto(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        style={{ 
                          width: "100%", 
                          borderRadius: "16px", 
                          marginBottom: "16px" 
                        }} 
                      />
                      <canvas ref={canvasRef} style={{ display: "none" }} />
                      <div style={{ display: "flex", gap: "12px" }}>
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
                            cursor: "pointer"
                          }}
                        >
                          ✓ צלם
                        </button>
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
                          ביטול
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <img 
                    src={capturedPhoto} 
                    alt="תמונה" 
                    style={{ 
                      width: "100%", 
                      borderRadius: "16px", 
                      marginBottom: "16px" 
                    }} 
                  />
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={handlePhotoUpload}
                      disabled={isUploading}
                      style={{
                        flex: 1,
                        padding: "14px",
                        background: isUploading 
                          ? "rgba(100, 116, 139, 0.5)" 
                          : "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: "700",
                        cursor: isUploading ? "not-allowed" : "pointer"
                      }}
                    >
                      {isUploading ? "מעלה..." : "✓ העלה למסך"}
                    </button>
                    <button
                      onClick={() => setCapturedPhoto(null)}
                      disabled={isUploading}
                      style={{
                        padding: "14px 20px",
                        background: "rgba(248, 113, 113, 0.2)",
                        color: "#f87171",
                        border: "2px solid rgba(248, 113, 113, 0.4)",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: "700",
                        cursor: isUploading ? "not-allowed" : "pointer"
                      }}
                    >
                      מחק
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message Tab */}
          {activeTab === "message" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label 
                  htmlFor="sender-name" 
                  style={{ 
                    display: "block", 
                    fontSize: "0.9rem", 
                    marginBottom: "6px",
                    color: "#cbd5e1"
                  }}
                >
                  השם שלך
                </label>
                <input
                  id="sender-name"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="לדוגמה: יוסי כהן"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #1f2937",
                    background: "rgba(15,23,42,0.9)",
                    color: "#f9fafb",
                    fontSize: "0.95rem"
                  }}
                />
              </div>

              <div>
                <label 
                  htmlFor="message-text" 
                  style={{ 
                    display: "block", 
                    fontSize: "0.9rem", 
                    marginBottom: "6px",
                    color: "#cbd5e1"
                  }}
                >
                  ההודעה שלך
                </label>
                <textarea
                  id="message-text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="כתוב הודעה שתופיע על המסך..."
                  maxLength={100}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #1f2937",
                    background: "rgba(15,23,42,0.9)",
                    color: "#f9fafb",
                    fontSize: "0.95rem",
                    resize: "none"
                  }}
                />
                <div 
                  style={{ 
                    fontSize: "0.8rem", 
                    color: "#64748b", 
                    marginTop: "4px",
                    textAlign: "left"
                  }}
                >
                  {message.length}/100
                </div>
              </div>

              <button
                onClick={handleMessageSend}
                disabled={isUploading}
                style={{
                  padding: "14px",
                  background: isUploading 
                    ? "rgba(100, 116, 139, 0.5)" 
                    : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  boxShadow: isUploading 
                    ? "none" 
                    : "0 0 30px rgba(139, 92, 246, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <Send className="w-5 h-5" />
                {isUploading ? "שולח..." : "שלח למסך"}
              </button>
            </div>
          )}

          {status.type && (
            <div 
              style={{ 
                marginTop: "16px", 
                textAlign: "center",
                fontSize: "0.9rem",
                color: status.type === "ok" ? "#10b981" : "#f87171",
                fontWeight: "600"
              }}
            >
              {status.message}
            </div>
          )}
        </div>
      </div>

      <MenuButton />
    </div>
  );
}

UploadToScreen.isPublic = true;