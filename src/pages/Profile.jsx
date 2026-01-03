import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Camera, User, Save } from "lucide-react";
import ApyironLogo from "../components/ApyironLogo";

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: "",
    photo: null
  });
  const [showCamera, setShowCamera] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem('apiryon_user_name');
    const savedPhoto = localStorage.getItem('apiryon_user_photo');
    
    if (savedName) setProfileData(prev => ({ ...prev, name: savedName }));
    if (savedPhoto) setProfileData(prev => ({ ...prev, photo: savedPhoto }));
  }, []);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("לא ניתן לגשת למצלמה");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      setProfileData(prev => ({ ...prev, photo: photoData }));
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profileData.name.trim()) {
      setSaveMessage("נא למלא את השם");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setIsSaving(true);
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('apiryon_user_name', profileData.name);
        if (profileData.photo) {
          localStorage.setItem('apiryon_user_photo', profileData.photo);
        }
        setSaveMessage("הפרטים נשמרו בהצלחה! ✓");
      } else {
        setSaveMessage("שגיאה: אחסון לא זמין");
      }
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage(`שגיאה בשמירה: ${error.message || 'אחסון מלא'}`);
      setTimeout(() => setSaveMessage(""), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      dir="rtl"
      className="min-h-screen w-full flex justify-center p-4"
      style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", color: "#f9fafb" }}
    >
      <div className="w-full max-w-[500px]">
        <Link
          to={createPageUrl("Home")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#00caff",
            textDecoration: "none",
            fontSize: "0.95rem",
            fontWeight: "600",
            marginBottom: "20px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "rgba(0, 202, 255, 0.1)",
            border: "1px solid rgba(0, 202, 255, 0.3)"
          }}
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה לדף הבית</span>
        </Link>

        <div className="flex justify-center mb-6">
          <ApyironLogo size="medium" showCircle={true} />
        </div>

        <div
          className="rounded-[18px] p-6"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            boxShadow: "0 10px 30px rgba(0, 202, 255, 0.2)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 202, 255, 0.2)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
            <User className="w-8 h-8" style={{ color: "#00caff" }} />
            <h1 className="text-[1.8rem] font-bold" style={{ color: "#00caff", textShadow: "0 0 20px rgba(0, 202, 255, 0.5)" }}>
              הפרופיל שלי
            </h1>
          </div>

          <p style={{ color: "#cbd5e1", marginBottom: "30px", fontSize: "0.95rem", lineHeight: "1.6" }}>
            הפרטים שלך נשמרים במכשיר שלך בלבד ויעזרו לך להירשם מהר יותר בפעם הבאה.
          </p>

          {/* Photo Section */}
          <div style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", fontSize: "1rem", fontWeight: "600", marginBottom: "12px", color: "#e2e8f0" }}>
              התמונה שלך
            </label>

            {profileData.photo ? (
              <div style={{ textAlign: "center" }}>
                <img 
                  src={profileData.photo} 
                  alt="Profile" 
                  style={{ 
                    width: "200px", 
                    height: "200px", 
                    borderRadius: "50%", 
                    objectFit: "cover",
                    border: "4px solid #00caff",
                    boxShadow: "0 0 30px rgba(0, 202, 255, 0.4)",
                    marginBottom: "20px"
                  }} 
                />
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      padding: "12px 24px",
                      background: "linear-gradient(135deg, #00caff, #0088ff)",
                      color: "#001a2e",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 0 20px rgba(0, 202, 255, 0.4)"
                    }}
                  >
                    <Camera className="w-4 h-4 inline-block ml-2" />
                    צלם מחדש
                  </button>
                  
                  <label style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
                    display: "inline-block"
                  }}>
                    📤 העלה מחדש
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div style={{
                padding: "40px 20px",
                background: "rgba(0, 202, 255, 0.1)",
                border: "2px dashed rgba(0, 202, 255, 0.4)",
                borderRadius: "16px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📸</div>
                <p style={{ color: "#cbd5e1", marginBottom: "20px" }}>
                  עדיין לא העלית תמונה
                </p>
                
                {!showCamera ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={startCamera}
                      style={{
                        padding: "14px 28px",
                        background: "linear-gradient(135deg, #00caff, #0088ff)",
                        color: "#001a2e",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 0 25px rgba(0, 202, 255, 0.5)",
                        width: "100%",
                        maxWidth: "250px"
                      }}
                    >
                      📸 פתח מצלמה
                    </button>
                    
                    <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>או</div>
                    
                    <label style={{
                      padding: "14px 28px",
                      background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "1rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 0 25px rgba(139, 92, 246, 0.5)",
                      width: "100%",
                      maxWidth: "250px",
                      textAlign: "center",
                      display: "inline-block"
                    }}>
                      📤 העלה תמונה
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "350px", borderRadius: "16px", marginBottom: "16px", border: "3px solid #00caff" }} />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        style={{
                          padding: "12px 24px",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "0.95rem",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        ✓ צלם תמונה
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        style={{
                          padding: "12px 24px",
                          background: "rgba(248, 113, 113, 0.2)",
                          color: "#f87171",
                          border: "2px solid rgba(248, 113, 113, 0.4)",
                          borderRadius: "10px",
                          fontSize: "0.95rem",
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
            )}
          </div>

          {/* Name Input */}
          <div style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", fontSize: "1rem", fontWeight: "600", marginBottom: "8px", color: "#e2e8f0" }}>
              השם שלך
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="לדוגמה: יהושע דבוש"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #1f2937",
                background: "rgba(15,23,42,0.9)",
                color: "#f9fafb",
                fontSize: "1rem",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#00caff";
                e.target.style.boxShadow = "0 0 0 2px rgba(0, 202, 255, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#1f2937";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #00caff, #0088ff)",
              color: "#001a2e",
              fontSize: "1.1rem",
              fontWeight: "800",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.7 : 1,
              boxShadow: "0 0 25px rgba(0, 202, 255, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            }}
          >
            <Save className="w-5 h-5" />
            {isSaving ? "שומר..." : "שמור פרטים"}
          </button>

          {saveMessage && (
            <div style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "10px",
              background: saveMessage.includes("בהצלחה") ? "rgba(16, 185, 129, 0.2)" : "rgba(248, 113, 113, 0.2)",
              border: `1px solid ${saveMessage.includes("בהצלחה") ? "rgba(16, 185, 129, 0.4)" : "rgba(248, 113, 113, 0.4)"}`,
              color: saveMessage.includes("בהצלחה") ? "#10b981" : "#f87171",
              textAlign: "center",
              fontWeight: "600"
            }}>
              {saveMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Profile.isPublic = true;