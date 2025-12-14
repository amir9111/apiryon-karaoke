import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Download, Share2, Image as ImageIcon, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

export default function EventProducer() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventText, setEventText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [invitationType, setInvitationType] = useState("regular");
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)" }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#00caff" }} />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#00caff" }}>גישה מוגבלת</h2>
          <p style={{ color: "#94a3b8" }}>רק מנהלים יכולים לגשת לדף זה</p>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!eventText.trim()) {
      alert("נא למלא את פרטי האירוע");
      return;
    }

    setIsGenerating(true);
    try {
      const analysisPrompt = `
אתה מעצב אירועים מקצועי למועדון קריוקי בשם "אפיריון".
המשתמש כתב את הטקסט הבא על אירוע קריוקי:

"${eventText}"

משימות שלך:
1. חלץ את הפרטים החשובים: תאריך, שעה, סוג מוזיקה, מחיר כניסה, פרטים מיוחדים
2. צור טקסט שיווקי קצר ומושך (עד 4 שורות) שמתאים להזמנה ויזואלית
3. צור תיאור קצר לתמונת רקע שמתאימה לאירוע (לדוגמה: "מסיבת קריוקי צבעונית עם מיקרופונים וזרקורים")

החזר JSON במבנה הבא:
{
  "title": "כותרת מושכת באירוע (עד 6 מילים)",
  "description": "טקסט שיווקי קצר ומושך",
  "date": "תאריך ושעה (אם צוין)",
  "price": "מחיר או 'כניסה חופשית'",
  "imagePrompt": "תיאור לתמונת רקע מעוצבת"
}
      `;

      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            date: { type: "string" },
            price: { type: "string" },
            imagePrompt: { type: "string" }
          },
          required: ["title", "description", "imagePrompt"]
        }
      });

      const imagePrompt = `${analysisResult.imagePrompt}, vibrant colors, professional event poster style, modern design, high quality, cinematic lighting, no text`;
      
      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: imagePrompt
      });

      setGeneratedContent({
        ...analysisResult,
        backgroundImage: imageResult.url
      });

    } catch (error) {
      console.error(error);
      alert("שגיאה ביצירת ההזמנה, נסה שוב");
    }
    setIsGenerating(false);
  };

  const downloadImage = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `apiryon-invitation-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error(error);
      alert("שגיאה בהורדת התמונה");
    }
  };

  const shareToWhatsApp = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      canvas.toBlob(async (blob) => {
        const file = new File([blob], "invitation.png", { type: "image/png" });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'הזמנה לאירוע אפיריון',
            text: 'בואו לחגוג איתנו! 🎤'
          });
        } else {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `apiryon-invitation-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          alert("התמונה הורדה! עכשיו אפשר לשתף אותה בוואטסאפ 📱");
        }
      });
    } catch (error) {
      console.error(error);
      alert("שגיאה בשיתוף התמונה");
    }
  };

  return (
    <div 
      dir="rtl" 
      className="min-h-screen p-4 md:p-8"
      style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", color: "#f9fafb" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-3" style={{ 
            color: "#00caff",
            textShadow: "0 0 30px rgba(0, 202, 255, 0.6)"
          }}>
            🎨 הפקת לין - יצירת הזמנות
          </h1>
          <p className="text-lg" style={{ color: "#cbd5e1" }}>
            כתוב את פרטי האירוע והבינה המלכותית תיצור לך הזמנה מעוצבת
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div 
              className="rounded-2xl p-6 mb-4"
              style={{
                background: "rgba(15, 23, 42, 0.95)",
                border: "2px solid rgba(0, 202, 255, 0.3)",
                boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)"
              }}
            >
              <label className="block text-lg font-bold mb-3" style={{ color: "#00caff" }}>
                📝 פרטי האירוע (טקסט חופשי)
              </label>
              <textarea
                value={eventText}
                onChange={(e) => setEventText(e.target.value)}
                placeholder="לדוגמה: מסיבת קריוקי ביום חמישי 20.12 בשעה 21:00, מוזיקה ישראלית ומזרחית, כניסה חופשית, יש DJ מיוחד ופרסים..."
                className="w-full h-48 p-4 rounded-xl resize-none"
                style={{
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(0, 202, 255, 0.2)",
                  color: "#f9fafb",
                  fontSize: "1rem"
                }}
              />

              <div className="mt-4 mb-4">
                <label className="block text-sm font-bold mb-2" style={{ color: "#cbd5e1" }}>
                  סוג ההזמנה:
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setInvitationType("regular")}
                    className="flex-1 py-3 px-4 rounded-xl font-bold transition-all"
                    style={{
                      background: invitationType === "regular" 
                        ? "linear-gradient(135deg, #00caff, #0088ff)" 
                        : "rgba(51, 65, 85, 0.5)",
                      color: invitationType === "regular" ? "#001a2e" : "#94a3b8",
                      border: invitationType === "regular" ? "none" : "1px solid rgba(51, 65, 85, 0.5)"
                    }}
                  >
                    📱 הזמנה רגילה (ריבוע)
                  </button>
                  <button
                    onClick={() => setInvitationType("story")}
                    className="flex-1 py-3 px-4 rounded-xl font-bold transition-all"
                    style={{
                      background: invitationType === "story" 
                        ? "linear-gradient(135deg, #00caff, #0088ff)" 
                        : "rgba(51, 65, 85, 0.5)",
                      color: invitationType === "story" ? "#001a2e" : "#94a3b8",
                      border: invitationType === "story" ? "none" : "1px solid rgba(51, 65, 85, 0.5)"
                    }}
                  >
                    📸 סטורי (אנכי)
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !eventText.trim()}
                className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                style={{
                  background: isGenerating || !eventText.trim() 
                    ? "rgba(100, 116, 139, 0.5)" 
                    : "linear-gradient(135deg, #00caff, #0088ff)",
                  color: isGenerating || !eventText.trim() ? "#64748b" : "#001a2e",
                  cursor: isGenerating || !eventText.trim() ? "not-allowed" : "pointer",
                  boxShadow: isGenerating || !eventText.trim() ? "none" : "0 0 30px rgba(0, 202, 255, 0.5)"
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>מייצר הזמנה...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>צור הזמנה עם AI 🎨</span>
                  </>
                )}
              </button>
            </div>

            <div 
              className="rounded-xl p-4"
              style={{
                background: "rgba(0, 202, 255, 0.1)",
                border: "1px solid rgba(0, 202, 255, 0.2)"
              }}
            >
              <h3 className="font-bold mb-2" style={{ color: "#00caff" }}>💡 טיפים:</h3>
              <ul className="text-sm space-y-1" style={{ color: "#cbd5e1" }}>
                <li>• כתוב בחופשיות - AI יבין הכל</li>
                <li>• ציין תאריך, שעה, מחיר, סוג מוזיקה</li>
                <li>• ההזמנה תכלול את לוגו אפיריון</li>
                <li>• אפשר להוריד או לשתף ישירות</li>
              </ul>
            </div>
          </div>

          <div>
            {generatedContent ? (
              <div className="space-y-4">
                <div 
                  className="rounded-2xl p-4 flex items-center justify-center"
                  style={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "2px solid rgba(0, 202, 255, 0.3)",
                    minHeight: "400px"
                  }}
                >
                  <div 
                    ref={canvasRef}
                    style={{
                      width: invitationType === "story" ? "300px" : "400px",
                      height: invitationType === "story" ? "533px" : "400px",
                      position: "relative",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)"
                    }}
                  >
                    <div 
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${generatedContent.backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "brightness(0.5)"
                      }}
                    />
                    
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)"
                    }} />

                    <div style={{
                      position: "relative",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "32px 24px",
                      color: "#ffffff"
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{
                          fontSize: invitationType === "story" ? "2rem" : "2.5rem",
                          fontWeight: "900",
                          color: "#ffffff",
                          textShadow: "0 0 30px rgba(0, 202, 255, 0.8), 0 0 60px rgba(0, 202, 255, 0.4)",
                          letterSpacing: "0.1em"
                        }}>
                          APIRYON
                        </div>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <h2 style={{
                          fontSize: invitationType === "story" ? "1.8rem" : "2.2rem",
                          fontWeight: "900",
                          marginBottom: "16px",
                          lineHeight: "1.2",
                          textShadow: "0 2px 20px rgba(0, 0, 0, 0.8)"
                        }}>
                          {generatedContent.title}
                        </h2>
                        
                        <p style={{
                          fontSize: invitationType === "story" ? "1rem" : "1.1rem",
                          marginBottom: "16px",
                          lineHeight: "1.6",
                          textShadow: "0 1px 10px rgba(0, 0, 0, 0.8)"
                        }}>
                          {generatedContent.description}
                        </p>

                        {generatedContent.date && (
                          <div style={{
                            display: "inline-block",
                            background: "rgba(0, 202, 255, 0.2)",
                            border: "2px solid rgba(0, 202, 255, 0.5)",
                            borderRadius: "12px",
                            padding: "8px 16px",
                            marginBottom: "8px",
                            fontSize: invitationType === "story" ? "0.9rem" : "1rem",
                            fontWeight: "700"
                          }}>
                            📅 {generatedContent.date}
                          </div>
                        )}

                        {generatedContent.price && (
                          <div style={{
                            display: "inline-block",
                            background: "rgba(16, 185, 129, 0.2)",
                            border: "2px solid rgba(16, 185, 129, 0.5)",
                            borderRadius: "12px",
                            padding: "8px 16px",
                            marginRight: "8px",
                            fontSize: invitationType === "story" ? "0.9rem" : "1rem",
                            fontWeight: "700"
                          }}>
                            💰 {generatedContent.price}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <div style={{
                          fontSize: invitationType === "story" ? "1.5rem" : "1.8rem",
                          marginBottom: "8px"
                        }}>
                          🎤 🎵 🎉
                        </div>
                        <div style={{
                          fontSize: invitationType === "story" ? "0.85rem" : "0.95rem",
                          color: "#cbd5e1"
                        }}>
                          מועדון אפיריון • המוזיקה שלנו, השירה שלכם
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={downloadImage}
                    className="py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff",
                      boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
                    }}
                  >
                    <Download className="w-5 h-5" />
                    <span>הורד</span>
                  </button>
                  <button
                    onClick={shareToWhatsApp}
                    className="py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #00caff, #0088ff)",
                      color: "#001a2e",
                      boxShadow: "0 0 20px rgba(0, 202, 255, 0.4)"
                    }}
                  >
                    <Share2 className="w-5 h-5" />
                    <span>שתף</span>
                  </button>
                </div>

                <button
                  onClick={() => setGeneratedContent(null)}
                  className="w-full py-3 rounded-xl font-bold"
                  style={{
                    background: "rgba(51, 65, 85, 0.5)",
                    color: "#94a3b8",
                    border: "1px solid rgba(51, 65, 85, 0.5)"
                  }}
                >
                  🔄 צור הזמנה חדשה
                </button>
              </div>
            ) : (
              <div 
                className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                style={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "2px dashed rgba(0, 202, 255, 0.3)",
                  minHeight: "400px"
                }}
              >
                <ImageIcon className="w-20 h-20 mb-4 opacity-50" style={{ color: "#00caff" }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: "#00caff" }}>
                  התצוגה המקדימה תופיע כאן
                </h3>
                <p style={{ color: "#94a3b8" }}>
                  מלא את פרטי האירוע והקלק על "צור הזמנה"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}