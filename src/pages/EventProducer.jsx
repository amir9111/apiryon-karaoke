import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toPng } from "html-to-image";
import { Sparkles, Download, Share2, Loader2, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EventProducer() {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [templateImage, setTemplateImage] = useState(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const cardRef = React.useRef(null);

  const handleTemplateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingTemplate(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setTemplateImage(file_url);
    } catch (error) {
      console.error(error);
      alert("שגיאה בהעלאת התבנית");
    } finally {
      setIsUploadingTemplate(false);
    }
  };

  const analyzeAndBuild = async () => {
    if (!inputText.trim()) {
      alert("נא להזין טקסט קודם");
      return;
    }

    setIsAnalyzing(true);
    try {
      const basePrompt = `אתה מעצב הזמנות מקצועי למועדונים ואירועי קריוקי בישראל.

${templateImage ? `
🎨 חשוב מאוד - תבנית דוגמה צורפה!
נתח בקפידה את התבנית שצורפה:
- סגנון הכתיבה (האם זה אנרגטי? רשמי? צעיר?)
- סוג הניסוחים והמילים (למשל: "ערב קריוקי", "מסיבת חנוכה", "ביום ים תיכוני" וכו')
- מבנה המידע (איך מסודרים הפרטים?)
- טון השיווקי (האם יש התרגשות? אמוג'י?)
- סוג האירוע (קריוקי? מסיבה? ערב מוזיקה?)

צור הזמנה חדשה בדיוק באותו סגנון, טון וניסוח!
` : 'צור הזמנה מקצועית ואנרגטית למועדון/ערב קריוקי.'}

הטקסט שקיבלת מהלקוח:
"""
${inputText}
"""

המשימה שלך:
1. חלץ את כל הפרטים: תאריך, שעה, מיקום, שם המועדון/אירוע, פרטי התקשרות
2. ${templateImage ? 'צור כותרת ראשית בסגנון דומה לתבנית (סגנון הכתיבה, האנרגיה, השימוש באמוג׳י)' : 'צור כותרת ראשית מרגשת ומזמינה'}
3. ${templateImage ? 'צור תת-כותרת שמשלימה את הכותרת - באותו סגנון בדיוק' : 'צור תת-כותרת משלימה'}
4. ${templateImage ? 'רשום רשימת פרטים/highlights באותו סגנון ניסוח כמו בתבנית' : 'רשום רשימת פרטים חשובים'}
5. ${templateImage ? 'הוסף קריאה לפעולה באותו טון כמו בתבנית' : 'הוסף קריאה לפעולה'}

${templateImage ? '⚠️ קריטי: השתמש באותם ביטויים, אותו טון, אותה אנרגיה ואותו סגנון כתיבה בדיוק כמו בתבנית!' : ''}

החזר JSON בפורמט הבא:`;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: basePrompt,
        ...(templateImage && { file_urls: [templateImage] }),
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "כותרת ראשית מושכת" },
            subtitle: { type: "string", description: "תת-כותרת" },
            date: { type: "string", description: "התאריך (אם יש)" },
            time: { type: "string", description: "השעה (אם יש)" },
            location: { type: "string", description: "המיקום (אם יש)" },
            description: { type: "string", description: "תיאור האירוע (2-3 שורות)" },
            highlights: { 
              type: "array", 
              items: { type: "string" },
              description: "3-5 נקודות חשובות/מיוחדות באירוע"
            },
            contact: { type: "string", description: "פרטי התקשרות (אם יש)" },
            callToAction: { type: "string", description: "קריאה לפעולה" }
          },
          required: ["title", "subtitle", "description", "callToAction"]
        }
      });

      setInvitation(result);
    } catch (error) {
      console.error(error);
      alert("אירעה שגיאה בניתוח הטקסט. נסה שוב.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3,
        width: 1080,
        height: 1350
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "apiryon-invitation.png";
      a.click();
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצוא התמונה");
    } finally {
      setIsExporting(false);
    }
  };

  const exportStory = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3,
        width: 1080,
        height: 1920
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "apiryon-story.png";
      a.click();
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצוא הסטורי");
    } finally {
      setIsExporting(false);
    }
  };

  const shareImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "apiryon-invitation.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "הזמנה - האפריון", files: [file] });
      } else {
        await exportImage();
      }
    } catch (error) {
      await exportImage();
    }
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      padding: "20px",
      color: "#fff"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Back Button */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            to={createPageUrl("Home")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.9)",
              border: "2px solid rgba(16, 185, 129, 0.5)",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "1rem",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(15, 23, 42, 0.9)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <Home className="w-5 h-5" />
            <span>חזרה לדף הבית</span>
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "12px"
          }}>
            <Sparkles size={32} style={{ color: "#00caff" }} />
            <h1 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: "900",
              background: "linear-gradient(135deg, #00caff, #0088ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0
            }}>
              יוצר ההזמנות החכם
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
            כתוב טקסט חופשי, ה-AI יבנה לך הזמנה מקצועית 🎨
          </p>
        </div>

        {/* Input Section */}
        {!invitation && (
          <div style={{
            background: "rgba(15, 23, 42, 0.9)",
            borderRadius: "20px",
            padding: "30px",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)",
            backdropFilter: "blur(10px)"
          }}>
            
            {/* Template Upload */}
            <div style={{
              marginBottom: "25px",
              padding: "20px",
              background: "rgba(139, 92, 246, 0.1)",
              border: "2px dashed rgba(139, 92, 246, 0.4)",
              borderRadius: "16px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "15px"
              }}>
                <div>
                  <div style={{
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "#a78bfa",
                    marginBottom: "6px"
                  }}>
                    🎨 העלה תבנית להשראה (אופציונלי)
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                    ה-AI ילמד מהסגנון ויצור הזמנה דומה
                  </div>
                </div>
                
                <label style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: templateImage ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: isUploadingTemplate ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)"
                }}>
                  {isUploadingTemplate ? (
                    <>
                      <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                      <span>מעלה...</span>
                    </>
                  ) : templateImage ? (
                    <>
                      <span>✓ תבנית הועלתה</span>
                    </>
                  ) : (
                    <>
                      <span>📤 העלה תמונה</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTemplateUpload}
                    disabled={isUploadingTemplate}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {templateImage && (
                <div style={{
                  marginTop: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <img 
                    src={templateImage} 
                    alt="תבנית הזמנה"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "2px solid rgba(139, 92, 246, 0.5)"
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#10b981", fontWeight: "700", fontSize: "0.95rem" }}>
                      ✓ התבנית נטענה בהצלחה
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      ה-AI יצור הזמנה בסגנון דומה
                    </div>
                  </div>
                  <button
                    onClick={() => setTemplateImage(null)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600"
                    }}
                  >
                    הסר
                  </button>
                </div>
              )}
            </div>

            <label style={{
              display: "block",
              fontSize: "1.2rem",
              fontWeight: "700",
              color: "#00caff",
              marginBottom: "12px"
            }}>
              📝 הזן את פרטי האירוע (טקסט חופשי)
            </label>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`לדוגמה:
ערב קריוקי מטורף באפריון!
חמישי הקרוב 18.12 בשעה 21:00
במועדון האפריון בטבריה
DJ LIVE, מוזיקה מזרחית ולהיטים
להזמנות: 050-1234567
בואו לשיר ולרקוד!`}
              style={{
                width: "100%",
                minHeight: "200px",
                padding: "16px",
                borderRadius: "14px",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                background: "rgba(2, 6, 23, 0.7)",
                color: "#fff",
                fontSize: "1.05rem",
                lineHeight: "1.6",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit"
              }}
              onFocus={(e) => e.target.style.borderColor = "#00caff"}
              onBlur={(e) => e.target.style.borderColor = "rgba(148, 163, 184, 0.3)"}
            />

            <button
              onClick={analyzeAndBuild}
              disabled={isAnalyzing || !inputText.trim()}
              style={{
                marginTop: "20px",
                padding: "16px 32px",
                borderRadius: "14px",
                border: "none",
                background: isAnalyzing ? "rgba(100, 116, 139, 0.5)" : "linear-gradient(135deg, #00caff, #0088ff)",
                color: isAnalyzing ? "#64748b" : "#001a2e",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: isAnalyzing || !inputText.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: isAnalyzing ? "none" : "0 0 30px rgba(0, 202, 255, 0.4)",
                width: "100%",
                justifyContent: "center"
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                  <span>AI מנתח ובונה...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>🎨 בנה לי הזמנה מקצועית</span>
                </>
              )}
            </button>

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Invitation Preview */}
        {invitation && (
          <div>
            {/* Action Buttons */}
            <div style={{
              display: "flex",
              gap: "12px",
              marginBottom: "20px",
              flexWrap: "wrap",
              justifyContent: "center"
            }}>
              <button
                onClick={exportImage}
                disabled={isExporting}
                style={{
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)"
                }}
              >
                <Download size={18} />
                הורד תמונה (1080×1350)
              </button>

              <button
                onClick={exportStory}
                disabled={isExporting}
                style={{
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)"
                }}
              >
                <Download size={18} />
                הורד סטורי (1080×1920)
              </button>

              <button
                onClick={shareImage}
                style={{
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "2px solid rgba(0, 202, 255, 0.4)",
                  background: "rgba(0, 202, 255, 0.1)",
                  color: "#00caff",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <Share2 size={18} />
                שתף
              </button>

              <button
                onClick={() => {
                  setInvitation(null);
                  setInputText("");
                }}
                style={{
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "2px solid rgba(239, 68, 68, 0.4)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                ✕ התחל מחדש
              </button>
            </div>

            {/* Invitation Card */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                ref={cardRef}
                style={{
                  width: "min(1080px, 100%)",
                  aspectRatio: "1080 / 1350",
                  position: "relative",
                  borderRadius: "24px",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #1a0f0a 0%, #2d1810 30%, #1a0f0a 70%, #0a0604 100%)",
                  border: "3px solid rgba(255, 140, 0, 0.3)",
                  boxShadow: "0 0 60px rgba(255, 100, 0, 0.3), 0 0 100px rgba(255, 140, 0, 0.2)"
                }}
              >
                {/* Background Effects - Stage Lighting Style */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    radial-gradient(ellipse at 50% 0%, rgba(255, 140, 0, 0.3), transparent 40%),
                    radial-gradient(ellipse at 0% 50%, rgba(255, 100, 0, 0.2), transparent 50%),
                    radial-gradient(ellipse at 100% 50%, rgba(255, 100, 0, 0.2), transparent 50%),
                    radial-gradient(ellipse at 50% 100%, rgba(139, 92, 246, 0.15), transparent 50%)
                  `,
                  opacity: 0.7
                }} />

                {/* Content Container */}
                <div style={{
                  position: "relative",
                  height: "100%",
                  padding: "clamp(30px, 5%, 60px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  
                  {/* Header */}
                  <div>
                    <div style={{
                      fontSize: "clamp(0.9rem, 1.8vw, 1.2rem)",
                      color: "#FFD700",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      textAlign: "center",
                      marginBottom: "clamp(15px, 2.5%, 30px)",
                      textShadow: "0 0 25px rgba(255, 215, 0, 0.8), 0 2px 10px rgba(0, 0, 0, 0.8)",
                      background: "linear-gradient(180deg, #FFD700 0%, #FFA500 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 20px rgba(255, 140, 0, 0.6))"
                    }}>
                      🎤 APIRYON CLUB 🎤
                    </div>

                    {/* Title */}
                    <h1 style={{
                      fontSize: "clamp(2rem, 5vw, 3.8rem)",
                      fontWeight: "900",
                      background: "linear-gradient(180deg, #FFFFFF 0%, #FFD700 50%, #FFA500 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textAlign: "center",
                      marginBottom: "clamp(15px, 2%, 25px)",
                      lineHeight: "1.1",
                      textShadow: "0 6px 25px rgba(255, 140, 0, 0.5)",
                      filter: "drop-shadow(0 4px 15px rgba(0, 0, 0, 0.9))",
                      letterSpacing: "-0.02em"
                    }}>
                      {invitation.title}
                    </h1>

                    {/* Subtitle */}
                    <div style={{
                      fontSize: "clamp(1.4rem, 2.8vw, 2.3rem)",
                      fontWeight: "800",
                      color: "#FFD700",
                      textAlign: "center",
                      marginBottom: "clamp(30px, 4%, 50px)",
                      textShadow: "0 0 20px rgba(255, 215, 0, 0.6), 0 3px 15px rgba(0, 0, 0, 0.9)",
                      letterSpacing: "0.02em"
                    }}>
                      {invitation.subtitle}
                    </div>
                  </div>

                  {/* Main Info */}
                  <div style={{
                    background: "rgba(10, 6, 4, 0.85)",
                    borderRadius: "20px",
                    padding: "clamp(20px, 3%, 35px)",
                    border: "2px solid rgba(255, 140, 0, 0.4)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 0 40px rgba(255, 100, 0, 0.3), inset 0 0 30px rgba(255, 140, 0, 0.05)"
                  }}>
                    
                    {/* Date, Time, Location */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "15px",
                      marginBottom: "25px"
                    }}>
                      {invitation.date && (
                        <InfoPill icon="📅" label="תאריך" value={invitation.date} />
                      )}
                      {invitation.time && (
                        <InfoPill icon="⏰" label="שעה" value={invitation.time} />
                      )}
                      {invitation.location && (
                        <InfoPill icon="📍" label="מיקום" value={invitation.location} />
                      )}
                    </div>

                    {/* Description */}
                    <div style={{
                      fontSize: "clamp(1rem, 1.8vw, 1.3rem)",
                      color: "#e2e8f0",
                      lineHeight: "1.6",
                      marginBottom: "20px",
                      textAlign: "center",
                      fontWeight: "500"
                    }}>
                      {invitation.description}
                    </div>

                    {/* Highlights */}
                    {invitation.highlights && invitation.highlights.length > 0 && (
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        marginBottom: "20px"
                      }}>
                        {invitation.highlights.map((highlight, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
                            color: "#cbd5e1",
                            fontWeight: "600"
                          }}>
                            <span style={{ color: "#FFD700", fontSize: "1.2em" }}>✓</span>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Contact */}
                    {invitation.contact && (
                      <div style={{
                        fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                        color: "#fbbf24",
                        fontWeight: "700",
                        textAlign: "center",
                        marginBottom: "15px"
                      }}>
                        📞 {invitation.contact}
                      </div>
                    )}

                    {/* Call to Action */}
                    <div style={{
                      background: "linear-gradient(135deg, #FF8C00, #FFA500, #FFD700)",
                      padding: "clamp(14px, 2.5%, 20px) clamp(20px, 3%, 30px)",
                      borderRadius: "15px",
                      textAlign: "center",
                      fontSize: "clamp(1.2rem, 2.2vw, 1.7rem)",
                      fontWeight: "900",
                      color: "#000",
                      boxShadow: "0 0 30px rgba(255, 140, 0, 0.6), 0 4px 15px rgba(0, 0, 0, 0.5)",
                      textShadow: "0 1px 3px rgba(255, 255, 255, 0.3)"
                    }}>
                      {invitation.callToAction}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{
                    fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
                    color: "#94a3b8",
                    textAlign: "center",
                    fontWeight: "600",
                    marginTop: "20px"
                  }}>
                    ✨ APIRYON • המועדון הקריוקי שלכם ✨
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div style={{
      background: "rgba(255, 140, 0, 0.15)",
      border: "2px solid rgba(255, 140, 0, 0.4)",
      borderRadius: "14px",
      padding: "14px 12px",
      textAlign: "center",
      boxShadow: "0 0 15px rgba(255, 100, 0, 0.2)"
    }}>
      <div style={{ fontSize: "1.6rem", marginBottom: "6px" }}>{icon}</div>
      <div style={{
        fontSize: "0.7rem",
        color: "#FFA500",
        fontWeight: "700",
        marginBottom: "4px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        textShadow: "0 0 10px rgba(255, 140, 0, 0.4)"
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "1.05rem",
        color: "#FFD700",
        fontWeight: "900",
        textShadow: "0 0 10px rgba(255, 215, 0, 0.5)"
      }}>
        {value}
      </div>
    </div>
  );
}

EventProducer.isPublic = true;