import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ApyironLogo from "../components/ApyironLogo";
import TermsModal from "../components/TermsModal";
import MenuButton from "../components/MenuButton";
import AudienceRating from "../components/AudienceRating";
import AudioWave from "../components/AudioWave";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import PWASetup from "../components/PWASetup";
import ServiceWorkerRegistration from "../components/ServiceWorkerRegistration";
import PushNotifications from "../components/PushNotifications";
import AccessibilityHelper from "../components/AccessibilityHelper";
import { QrCode } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const [formData, setFormData] = useState({
    singer_name: "",
    song_title: "",
    song_artist: ""
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

  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const currentSong = requests.find(r => r.status === "performing");
  
  const hasUserRatedCurrentSong = () => {
    if (!currentSong) return false;
    const userId = localStorage.getItem('apiryon_user_id');
    if (!userId) return false;
    return currentSong.ratings?.some(r => r.user_id === userId) || false;
  };

  React.useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem('apiryon_terms_accepted');
    const hasVisited = localStorage.getItem('apiryon_visited');
    
    if (!hasAcceptedTerms) {
      setShowTerms(true);
    } else {
      setTermsAccepted(true);
      if (!hasVisited) {
        setShowWelcome(true);
        localStorage.setItem('apiryon_visited', 'true');
        
        const timer = setTimeout(() => {
          setShowWelcome(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('apiryon_terms_accepted', 'true');
    setShowTerms(false);
    setTermsAccepted(true);
    setShowWelcome(true);
    
    const timer = setTimeout(() => {
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
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
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedPhoto(photoData);
      setPhotoUploaded(true);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const [photoUploaded, setPhotoUploaded] = React.useState(false);

  React.useEffect(() => {
    const savedName = localStorage.getItem('apiryon_user_name');
    const savedPhoto = localStorage.getItem('apiryon_user_photo');
    
    if (savedName) {
      setFormData(prev => ({ ...prev, singer_name: savedName }));
    }
    if (savedPhoto) {
      setCapturedPhoto(savedPhoto);
      setPhotoUploaded(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!capturedPhoto) {
      setStatus({ type: "error", message: "נא לצלם תמונה לפני השליחה 📸" });
      return;
    }
    
    if (!formData.singer_name.trim() || !formData.song_title.trim()) {
      setStatus({ type: "error", message: "נא למלא שם ושם שיר 🙂" });
      return;
    }

    setIsSubmitting(true);
    
    let photoUrl = null;
    if (capturedPhoto) {
      const blob = await fetch(capturedPhoto).then(r => r.blob());
      const file = new File([blob], 'singer.jpg', { type: 'image/jpeg' });
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      photoUrl = uploadResult.file_url;
    }
    
    const sanitizedData = {
      singer_name: formData.singer_name.trim().substring(0, 100),
      song_title: formData.song_title.trim().substring(0, 200),
      song_artist: formData.song_artist?.trim().substring(0, 200) || "",
      status: "waiting",
      photo_url: photoUrl
    };
    
    await base44.entities.KaraokeRequest.create(sanitizedData);

    localStorage.setItem('apiryon_user_name', formData.singer_name);
    if (capturedPhoto) {
      localStorage.setItem('apiryon_user_photo', capturedPhoto);
    }

    setStatus({ type: "ok", message: "הבקשה נרשמה! בהצלחה 🎤" });
    setFormData({
      singer_name: "",
      song_title: "",
      song_artist: ""
    });
    setCapturedPhoto(null);
    setIsSubmitting(false);

    setTimeout(() => {
      setStatus({ type: null, message: "" });
    }, 3500);
  };

  return (
    <div 
      dir="rtl"
      className="min-h-screen w-full flex justify-center p-4 md:p-8"
      style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", color: "#f9fafb" }}
    >
      <PWASetup />
      <ServiceWorkerRegistration />
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

            <h2 style={{
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
        <div className="flex justify-center mb-6">
          <ApyironLogo size="medium" showCircle={true} />
        </div>

        {/* Now Playing Section */}
        {currentSong && !hasUserRatedCurrentSong() && (
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "20px",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <AudioWave isPlaying={true} />
            </div>
            <div style={{
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#00caff",
              marginBottom: "8px",
              textAlign: "center",
              textShadow: "0 0 15px rgba(0, 202, 255, 0.6)"
            }}>
              🎤 שר עכשיו על הבמה
            </div>
            <div style={{
              fontSize: "1.8rem",
              fontWeight: "800",
              marginBottom: "8px",
              textAlign: "center",
              color: "#ffffff",
              textShadow: "0 0 20px rgba(0, 202, 255, 0.4)"
            }}>
              {currentSong.singer_name}
            </div>
            <div style={{
              fontSize: "1.2rem",
              color: "#e2e8f0",
              marginBottom: "4px",
              textAlign: "center",
              fontWeight: "600"
            }}>
              {currentSong.song_title}
            </div>
            {currentSong.song_artist && (
              <div style={{
                fontSize: "1rem",
                color: "#94a3b8",
                textAlign: "center",
                marginBottom: "16px"
              }}>
                {currentSong.song_artist}
              </div>
            )}
            
            <AudienceRating 
              currentSong={currentSong}
              onRatingSubmitted={() => queryClient.invalidateQueries({ queryKey: ['karaoke-requests'] })}
            />
          </div>
        )}

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
            תור קריוקי 🎤
          </h1>
          <p className="text-[0.9rem] text-center mb-4" style={{ color: "#cbd5f5" }}>
            ממלאים, מצטרפים לתור – ומחכים שיקראו לכם
          </p>

          {!capturedPhoto && !photoUploaded ? (
            <div style={{
              padding: "40px 20px",
              background: "rgba(0, 202, 255, 0.1)",
              border: "2px solid rgba(0, 202, 255, 0.4)",
              borderRadius: "18px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📸</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#00caff", marginBottom: "12px", textShadow: "0 0 20px rgba(0, 202, 255, 0.5)" }}>
                קודם כל - סלפי!
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#cbd5e1", marginBottom: "24px", lineHeight: "1.6" }}>
                לפני שנרשום אותך לתור,<br />
                בואו נצלם תמונה יפה שתוצג על המסכים 🌟
              </p>
              
              {!showCamera ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      padding: "16px 32px",
                      background: "linear-gradient(135deg, #00caff, #0088ff)",
                      color: "#001a2e",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 0 30px rgba(0, 202, 255, 0.5)",
                      width: "100%",
                      maxWidth: "300px"
                    }}
                  >
                    📸 פתח מצלמה
                  </button>
                  
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>או</div>
                  
                  <label style={{
                    padding: "16px 32px",
                    background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
                    width: "100%",
                    maxWidth: "300px",
                    textAlign: "center",
                    display: "inline-block"
                  }}>
                    📤 העלה תמונה
                    <input
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
              ) : (
                <div>
                  <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "400px", borderRadius: "16px", marginBottom: "16px", border: "3px solid #00caff", boxShadow: "0 0 30px rgba(0, 202, 255, 0.3)" }} />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      style={{
                        padding: "14px 28px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
                      }}
                    >
                      ✓ צלם תמונה
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      style={{
                        padding: "14px 28px",
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-2">
              {!photoUploaded && capturedPhoto && (
                <div style={{
                  padding: "16px",
                  background: "rgba(0, 202, 255, 0.1)",
                  border: "2px solid rgba(0, 202, 255, 0.3)",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#00caff", marginBottom: "12px" }}>
                    ✓ תמונה צולמה בהצלחה!
                  </div>
                  <img src={capturedPhoto} alt="Captured" style={{ width: "100%", maxWidth: "250px", borderRadius: "16px", marginBottom: "12px", border: "3px solid #00caff", boxShadow: "0 0 20px rgba(0, 202, 255, 0.3)" }} />
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    style={{
                      padding: "10px 20px",
                      background: "rgba(248, 113, 113, 0.2)",
                      color: "#f87171",
                      border: "2px solid rgba(248, 113, 113, 0.4)",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    📸 צלם מחדש
                  </button>
                </div>
              )}

            <div>
              <label className="block text-[0.9rem] mb-0.5">
                שם מלא / שם במה
              </label>
              <input
                type="text"
                name="singer_name"
                value={formData.singer_name}
                onChange={handleChange}
                required
                placeholder="לדוגמה: יהושע דבוש"
                className="w-full px-3 py-2.5 rounded-xl border outline-none text-[0.95rem]"
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
                  e.target.style.borderColor = "#1f2937";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label className="block text-[0.9rem] mb-0.5">
                שם השיר
              </label>
              <input
                type="text"
                name="song_title"
                value={formData.song_title}
                onChange={handleChange}
                required
                placeholder="לדוגמה: הנה זה בא"
                className="w-full px-3 py-2.5 rounded-xl border outline-none text-[0.95rem]"
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
                  e.target.style.borderColor = "#1f2937";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label className="block text-[0.9rem] mb-0.5">
                שם האמן (לא חובה)
              </label>
              <input
                type="text"
                name="song_artist"
                value={formData.song_artist}
                onChange={handleChange}
                placeholder="לדוגמה: חדווה ודוד"
                className="w-full px-3 py-2.5 rounded-xl border outline-none text-[0.95rem]"
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
                  e.target.style.borderColor = "#1f2937";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-[11px] px-[14px] rounded-full border-none cursor-pointer font-semibold text-base"
              style={{
                background: "linear-gradient(135deg, #00caff, #0088ff)",
                color: "#001a2e",
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 0 20px rgba(0, 202, 255, 0.4)"
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              שלחו אותי לתור 🎵
            </button>

              {status.type && (
                <div 
                  className="mt-2.5 text-[0.9rem] text-center"
                  style={{ color: status.type === "ok" ? "#00caff" : "#f97373" }}
                >
                  {status.message}
                </div>
              )}
            </form>
          )}

          <hr 
            className="my-[18px] md:my-3 h-px border-0"
            style={{ background: "radial-gradient(circle, #4b5563 0, transparent 70%)" }}
          />

          <div className="flex flex-col items-center gap-3 text-[0.9rem]">
            <div className="text-center">
              <div className="mb-2">רוצים להתעדכן בכל ערבי הקריוקי?</div>
              <a
                href="https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15?mode=hqrt3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-[9px] px-[14px] rounded-full no-underline font-semibold text-[0.9rem] whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #00caff, #0088ff)",
                  color: "#001a2e",
                  boxShadow: "0 0 15px rgba(0, 202, 255, 0.3)"
                }}
              >
                <span className="text-[1.1rem]">💬</span>
                <span>להצטרפות לקבוצת הווטסאפ</span>
              </a>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-xl" style={{
              background: "rgba(0, 202, 255, 0.05)",
              border: "1px solid rgba(0, 202, 255, 0.2)"
            }}>
              <QrCode className="w-16 h-16" style={{ color: "#00caff" }} />
              <div className="text-center text-[0.85rem]" style={{ color: "#94a3b8" }}>
                סרקו להצטרפות מהירה לתור
              </div>
            </div>
          </div>
        </div>

        </div>

        {/* Hamburger Menu */}
        <MenuButton />
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    );
}