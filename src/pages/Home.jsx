import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ApyironLogo from "../components/ApyironLogo";
import TermsModal from "../components/TermsModal";
import MenuButton from "../components/MenuButton";
import PWAManager from "../components/PWAManager";

import PWAInstallPrompt from "../components/PWAInstallPrompt";
import PWASetup from "../components/PWASetup";
import ServiceWorkerRegistration from "../components/ServiceWorkerRegistration";
import PushNotifications from "../components/PushNotifications";
import AccessibilityHelper from "../components/AccessibilityHelper";
import PWADebugger from "../components/PWADebugger";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const [formData, setFormData] = useState({
    singer_name: "",
    song_title: "",
    song_artist: "",
    song_id: null,
    message: ""
  });

  const [status, setStatus] = useState({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [namePlaceholder, setNamePlaceholder] = useState("לדוגמה: יהושע דבוש");

  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const currentSong = requests.find(r => r.status === "performing");
  const waitingCount = requests.filter(r => r.status === "waiting").length;

  React.useEffect(() => {
    let timer;
    try {
      if (typeof window === 'undefined') return;
      const hasAcceptedTerms = localStorage.getItem('apiryon_terms_accepted');
      const hasVisited = localStorage.getItem('apiryon_visited');
      
      if (!hasAcceptedTerms) {
        setShowTerms(true);
      } else {
        setTermsAccepted(true);
        if (!hasVisited) {
          localStorage.setItem('apiryon_visited', 'true');
          setShowWelcome(true);
          
          timer = setTimeout(() => {
            setShowWelcome(false);
          }, 5000);
        }
      }
    } catch (e) {
      setTermsAccepted(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleAcceptTerms = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('apiryon_terms_accepted', 'true');
      }
    } catch (e) {
      // Silent fail
    }
    setShowTerms(false);
    setTermsAccepted(true);
    setShowWelcome(true);
    
    setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus({ type: "error", message: "המצלמה לא נתמכת בדפדפן זה" });
        setShowCamera(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } else {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {}
        });
        setShowCamera(false);
      }
    } catch (err) {
      setStatus({ type: "error", message: "לא ניתן לגשת למצלמה" });
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
        setStatus({ type: "error", message: "נא להמתין עד שהמצלמה תהיה מוכנה" });
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setStatus({ type: "error", message: "שגיאה בצילום התמונה" });
        return;
      }
      ctx.drawImage(video, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedPhoto(photoData);
      setPhotoUploaded(true);
      stopCamera();
    } catch (e) {
      setStatus({ type: "error", message: "שגיאה בצילום התמונה" });
      stopCamera();
    }
  };

  const stopCamera = React.useCallback(() => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          try {
            track.stop();
          } catch (e) {
            // Silent fail per track
          }
        });
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      // Silent cleanup
    }
    setShowCamera(false);
  }, []);

  const [photoUploaded, setPhotoUploaded] = React.useState(false);

  React.useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const savedName = localStorage.getItem('apiryon_user_name');
      const savedPhoto = localStorage.getItem('apiryon_user_photo');
      
      if (savedName) {
        setNamePlaceholder(savedName);
      }
      if (savedPhoto) {
        setCapturedPhoto(savedPhoto);
        setPhotoUploaded(true);
      }
    } catch (e) {
      // localStorage not available
    }
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.singer_name.trim()) {
      setStatus({ type: "error", message: "נא למלא שם 🙂" });
      return;
    }

    if (!formData.song_title.trim() || !formData.song_artist.trim()) {
      setStatus({ type: "error", message: "נא למלא שם שיר ואמן 🎵" });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = null;
      if (capturedPhoto) {
        const blob = await fetch(capturedPhoto).then((r) => r.blob());
        const file = new File([blob], "singer.jpg", { type: "image/jpeg" });
        const upload = await base44.integrations.Core.UploadFile({ file });
        photoUrl = upload.file_url;
      }

      const sanitizedData = {
        singer_name: formData.singer_name.trim().substring(0, 100),
        email: `${formData.singer_name.trim()}@apiryon.local`,
        song_title: formData.song_title.trim().substring(0, 200),
        song_artist: formData.song_artist?.trim().substring(0, 200) || "",
        song_id: null,
        status: "waiting",
        photo_url: photoUrl,
        message: formData.message?.trim().substring(0, 100) || "",
      };

      await base44.entities.KaraokeRequest.create(sanitizedData);

      try {
        localStorage.setItem('apiryon_user_email', sanitizedData.email);
        localStorage.setItem('apiryon_user_name', formData.singer_name);
        localStorage.setItem('apiryon_user_photo', capturedPhoto);
      } catch (e) {
        // localStorage not available
      }

      await queryClient.invalidateQueries({ queryKey: ["karaoke-requests"] });

      setStatus({ type: "ok", message: "✅ נרשמת לתור! בהצלחה 🎤" });

      setFormData({
        singer_name: formData.singer_name,
        song_title: "",
        song_artist: "",
        song_id: null,
        message: "",
      });

      setIsSubmitting(false);

      setTimeout(() => setStatus({ type: null, message: "" }), 4000);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "שגיאה, נסה שוב" });
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      dir="rtl"
      className="min-h-screen w-full flex justify-center p-4 md:p-8"
      style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", color: "#f9fafb" }}
    >
      <ServiceWorkerRegistration />
      <PWASetup />
      <PWADebugger />
      <PushNotifications />
      <AccessibilityHelper />
      
      {/* Terms Modal - Must accept first */}
      {showTerms && <TermsModal onAccept={handleAcceptTerms} />}

      {/* Welcome Modal */}
      {showWelcome && termsAccepted && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            animation: "fadeIn 0.4s ease-out"
          }}
          onClick={() => setShowWelcome(false)}
        >
          <div 
            style={{
              background: "rgba(15, 23, 42, 0.98)",
              borderRadius: "24px",
              padding: "32px 24px",
              maxWidth: "500px",
              width: "100%",
              border: "2px solid rgba(0, 202, 255, 0.5)",
              boxShadow: "0 0 80px rgba(0, 202, 255, 0.4), 0 20px 60px rgba(0, 0, 0, 0.7)",
              textAlign: "center",
              animation: "slideUp 0.5s ease-out",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated glow effect */}
            <div style={{
              position: "absolute",
              top: "-2px",
              left: "-2px",
              right: "-2px",
              bottom: "-2px",
              background: "linear-gradient(45deg, #00caff, #0088ff, #00caff)",
              borderRadius: "24px",
              opacity: 0.3,
              filter: "blur(8px)",
              animation: "glow 2s ease-in-out infinite",
              zIndex: -1
            }}></div>

            <div style={{ marginBottom: "20px" }}>
              <ApyironLogo size="medium" showCircle={true} />
            </div>

            <h2 id="welcome-title" style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: "800",
              color: "#00caff",
              textShadow: "0 0 30px rgba(0, 202, 255, 0.6)",
              marginBottom: "16px",
              letterSpacing: "0.02em"
            }}>
              🎉 ברוכים הבאים! 🎉
            </h2>

            <p style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              color: "#e2e8f0",
              marginBottom: "12px",
              lineHeight: "1.6"
            }}>
              למועדון <span style={{ color: "#00caff", fontWeight: "700" }}>האפריון</span>
            </p>

            <p style={{
              fontSize: "clamp(0.9rem, 1.8vw, 1rem)",
              color: "#cbd5e1",
              marginBottom: "24px",
              lineHeight: "1.7"
            }}>
              המקום שבו תוכלו לשיר, לרקוד<br />
              וליהנות מערבי קריוקי מדהימים! 🎤✨
            </p>

            <button
              onClick={() => setShowWelcome(false)}
              aria-label="סגור את חלון הפתיחה והתחל להשתמש באפליקציה"
              style={{
                background: "linear-gradient(135deg, #00caff, #0088ff)",
                color: "#001a2e",
                border: "none",
                borderRadius: "16px",
                padding: "14px 32px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 0 30px rgba(0, 202, 255, 0.5)",
                transition: "transform 0.2s, box-shadow 0.2s",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(0, 202, 255, 0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 202, 255, 0.5)";
              }}
            >
              בואו נתחיל! 🚀
            </button>

            <p style={{
              fontSize: "0.8rem",
              color: "#64748b",
              marginTop: "16px"
            }}>
              החלון ייסגר אוטומטית בעוד רגעים...
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <div className="w-full max-w-[480px]">
        {/* Logo Section */}
        <div className="flex justify-center mb-4">
          <ApyironLogo size="medium" showCircle={true} />
        </div>

        {/* Now Playing + Queue Status */}
        {currentSong && (
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "20px",
            padding: "16px",
            marginBottom: "16px",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#00caff",
              marginBottom: "6px"
            }}>
              🎤 שר עכשיו
            </div>
            <div style={{
              fontSize: "1.4rem",
              fontWeight: "800",
              color: "#ffffff",
              marginBottom: "4px"
            }}>
              {currentSong.singer_name}
            </div>
            <div style={{
              fontSize: "1rem",
              color: "#cbd5e1"
            }}>
              {currentSong.song_title}
            </div>
          </div>
        )}

        {/* Waiting Count */}
        <div 
          className="rounded-[18px] p-5"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            boxShadow: "0 10px 30px rgba(0, 202, 255, 0.2), 0 0 80px rgba(0, 136, 255, 0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 202, 255, 0.2)",
            marginBottom: "20px",
            textAlign: "center"
          }}
        >
          <div style={{
            fontSize: "2.5rem",
            fontWeight: "900",
            color: "#fbbf24",
            marginBottom: "8px"
          }}>
            {waitingCount}
          </div>
          <div style={{
            fontSize: "0.95rem",
            color: "#cbd5e1"
          }}>
            ממתינים בתור
          </div>
        </div>

        <div
          className="rounded-[18px] p-5 md:p-6"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            boxShadow: "0 10px 30px rgba(0, 202, 255, 0.2), 0 0 80px rgba(0, 136, 255, 0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 202, 255, 0.2)"
          }}
        >
          <h1 className="text-[1.6rem] md:text-[1.9rem] font-bold text-center mb-2" style={{
            color: "#00caff",
            textShadow: "0 0 20px rgba(0, 202, 255, 0.5)"
          }}>
            הצטרף לתור! 🎤
          </h1>
          <p className="text-[0.9rem] text-center mb-4" style={{ color: "#cbd5f5" }}>
            מלא פרטים והצטרף למסיבה
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
            {/* Photo Section */}
            <div style={{
              padding: "20px",
              background: "rgba(0, 202, 255, 0.05)",
              border: "2px solid rgba(0, 202, 255, 0.2)",
              borderRadius: "16px",
              textAlign: "center"
            }}>
              {capturedPhoto ? (
                <div>
                  <img src={capturedPhoto} alt="תמונת הפרופיל שלך" style={{ width: "120px", height: "120px", borderRadius: "50%", margin: "0 auto 12px", border: "3px solid #00caff", boxShadow: "0 0 20px rgba(0, 202, 255, 0.3)", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedPhoto(null);
                      setPhotoUploaded(false);
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "rgba(248, 113, 113, 0.2)",
                      color: "#f87171",
                      border: "2px solid rgba(248, 113, 113, 0.4)",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    📸 שנה תמונה
                  </button>
                </div>
              ) : showCamera ? (
                <div>
                  <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "300px", borderRadius: "12px", marginBottom: "12px", border: "2px solid #00caff" }} />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      ✓ צלם
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      style={{
                        padding: "10px 20px",
                        background: "rgba(248, 113, 113, 0.2)",
                        color: "#f87171",
                        border: "2px solid rgba(248, 113, 113, 0.4)",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📸</div>
                  <div style={{ fontSize: "0.95rem", color: "#cbd5e1", marginBottom: "12px" }}>
                    הוסף תמונה (אופציונלי)
                  </div>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={startCamera}
                      style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #00caff, #0088ff)",
                        color: "#001a2e",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      📸 צלם
                    </button>
                    <label 
                      htmlFor="photo-upload"
                      style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}>
                      📤 העלה
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
                              setPhotoUploaded(true);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="singer-name-input" className="block text-[0.95rem] mb-1 font-semibold" style={{ color: "#e2e8f0" }}>
                👤 שם מלא / שם במה
              </label>
              <input
                id="singer-name-input"
                type="text"
                name="singer_name"
                value={formData.singer_name}
                onChange={handleChange}
                required
                placeholder={namePlaceholder}
                className="w-full px-4 py-3 rounded-xl border outline-none text-[1rem]"
                style={{
                  borderColor: "#1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "#f9fafb"
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

            {/* Song Title Input */}
            <div>
              <label htmlFor="manual-song-title" className="block text-[0.95rem] mb-1 font-semibold" style={{ color: "#e2e8f0" }}>
                🎵 שם השיר
              </label>
              <input
                id="manual-song-title"
                type="text"
                name="song_title"
                value={formData.song_title}
                onChange={handleChange}
                required
                placeholder="לדוגמה: אהבה ראשונה"
                className="w-full px-4 py-3 rounded-xl border outline-none text-[1rem]"
                style={{
                  borderColor: "#1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "#f9fafb"
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

            {/* Artist Input */}
            <div>
              <label htmlFor="manual-song-artist" className="block text-[0.95rem] mb-1 font-semibold" style={{ color: "#e2e8f0" }}>
                🎤 שם האמן
              </label>
              <input
                id="manual-song-artist"
                type="text"
                name="song_artist"
                value={formData.song_artist}
                onChange={handleChange}
                required
                placeholder="לדוגמה: עומר אדם"
                className="w-full px-4 py-3 rounded-xl border outline-none text-[1rem]"
                style={{
                  borderColor: "#1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "#f9fafb"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-full border-none font-bold text-[1.1rem]"
              style={{
                background: isSubmitting ? "rgba(100, 116, 139, 0.5)" : "linear-gradient(135deg, #00caff, #0088ff)",
                color: isSubmitting ? "#64748b" : "#001a2e",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: isSubmitting ? "none" : "0 0 30px rgba(0, 202, 255, 0.5)",
                pointerEvents: isSubmitting ? "none" : "auto"
              }}
              onMouseDown={(e) => !isSubmitting && (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={(e) => !isSubmitting && (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.transform = "scale(1)")}
            >
              {isSubmitting ? "שולח..." : "🎵 שלח לתור!"}
            </button>

            {/* Upload to Screen CTA */}
            <Link
              to={createPageUrl("UploadToScreen")}
              className="w-full mt-2 py-3 px-4 rounded-full border-none font-semibold text-[0.95rem] block text-center"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                color: "#fff",
                textDecoration: "none",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              📺 הופע על מסך הקהל!
            </Link>

            {status.type && (
              <div 
                className="mt-2 text-[0.95rem] text-center font-semibold"
                style={{ color: status.type === "ok" ? "#00caff" : "#f97373" }}
              >
                {status.message}
              </div>
            )}
          </form>


        </div>

        </div>

        {/* Hamburger Menu */}
        <MenuButton />
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
        <PWAManager />
      </div>
    );
}

Home.isPublic = true;