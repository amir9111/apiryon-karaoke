import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toPng } from "html-to-image";
import { Sparkles, Download, Share2, Loader2, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ArtistsUpload from "../components/ArtistsUpload";

export default function EventProducer() {
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    location: "",
    phone: "",
    price: "",
    style: "karaoke",
    artists: [] // [{name: "", image: ""}]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef(null);

  const styles = [
    { id: "karaoke", label: "🎤 קריוקי", color: "#FFA500" },
    { id: "mizrahi", label: "🔥 חפלה מזרחית", color: "#FFD700" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateInvitation = async () => {
    if (!formData.eventName.trim()) {
      alert("נא למלא שם אירוע");
      return;
    }

    setIsGenerating(true);
    try {
      const selectedStyle = styles.find(s => s.id === formData.style);
      
      // ייצור רקע אוטומטי עם AI
      const bgPrompt = getBgPrompt(formData.style, formData.eventName);
      const { url: bgImage } = await base44.integrations.Core.GenerateImage({ prompt: bgPrompt });

      // ייצור תוכן פרימיום למועדון
      const textPrompt = `
אתה מעצב פליירים ברמת "מועדוני-על" בישראל.

חוקים מחייבים:
- Title: גדול מאוד, 2-4 מילים בלבד, חד וחזק
- Subtitle: שורה אחת קצרה מתחת לכותרת
- Highlights: בדיוק 3 שורות קצרות, כל אחת 3-6 מילים
- CTA: משפט אחד עם FOMO עדין (לא נואש)

פרטי האירוע:
- שם: ${formData.eventName}
- סגנון: ${selectedStyle.label}
- תאריך: ${formData.date || "לא צוין"}
- שעה: ${formData.time || "לא צוין"}
- מיקום: ${formData.location || "לא צוין"}

סגנון: נקי, יוקרתי, לא ילדותי. בלי emoji בטקסט עצמו.

החזר JSON בלבד.
`;

      const textResult = await base44.integrations.Core.InvokeLLM({
        prompt: textPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "2-4 מילים חזקות" },
            subtitle: { type: "string", description: "שורה אחת קצרה" },
            highlights: { 
              type: "array", 
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
              description: "בדיוק 3 highlights קצרים"
            },
            cta: { type: "string", description: "משפט אחד עם FOMO עדין" }
          },
          required: ["title", "subtitle", "highlights", "cta"]
        }
      });

      setInvitation({
        ...formData,
        bgImage,
        ...textResult,
        accentColor: selectedStyle.color
      });
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצירת ההזמנה. נסה שוב.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPng = async (format) => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      let width, height, filename;
      
      if (format === 'whatsapp') {
        width = 1080;
        height = 1080; // ריבועי לווטסאפ
        filename = 'apiryon-whatsapp.png';
      } else if (format === 'story') {
        width = 1080;
        height = 1920; // 9:16 לסטורי
        filename = 'apiryon-story.png';
      } else {
        width = 1080;
        height = 1350; // ברירת מחדל
        filename = 'apiryon-invitation.png';
      }
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        width,
        height
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצוא");
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
        await exportPng(1080, 1350, "apiryon-invitation.png");
      }
    } catch {
      await exportPng(1080, 1350, "apiryon-invitation.png");
    }
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      padding: "20px",
      color: "#fff"
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
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
              fontWeight: "800",
              fontSize: "1rem"
            }}
          >
            <Home className="w-5 h-5" />
            <span>חזרה לדף הבית</span>
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Sparkles size={32} style={{ color: "#00caff" }} />
            <h1 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: "900",
              background: "linear-gradient(135deg, #00caff, #0088ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0
            }}>
              יוצר הזמנות מהיר
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem" }}>
            ממלא שדות, בוחר סגנון → המערכת יוצרת הזמנה מושלמת
          </p>
        </div>

        {!invitation && (
          <div style={{
            background: "rgba(15, 23, 42, 0.9)",
            borderRadius: "20px",
            padding: "30px",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)",
            backdropFilter: "blur(10px)"
          }}>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "700", color: "#00caff", marginBottom: "8px" }}>
                שם האירוע *
              </label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                placeholder="לדוגמה: ערב קריוקי מטורף"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>תאריך</label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  placeholder="חמישי 26.12"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>שעה</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="21:00"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>מיקום</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="האפריון, תל אביב"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>טלפון</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="050-1234567"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>מחיר כניסה (₪)</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="50 ₪ / חינם"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "700", color: "#00caff", marginBottom: "12px" }}>
                בחר סגנון *
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {styles.map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, style: style.id }))}
                    style={{
                      padding: "14px 12px",
                      borderRadius: "12px",
                      border: formData.style === style.id ? `2px solid ${style.color}` : "2px solid rgba(100, 116, 139, 0.3)",
                      background: formData.style === style.id ? `${style.color}22` : "rgba(15, 23, 42, 0.5)",
                      color: formData.style === style.id ? style.color : "#94a3b8",
                      fontSize: "0.95rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: formData.style === style.id ? `0 0 20px ${style.color}44` : "none"
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "700", color: "#00caff", marginBottom: "12px" }}>
                זמרים באירוע (אופציונלי)
              </label>
              <ArtistsUpload 
                artists={formData.artists}
                onChange={(artists) => setFormData(prev => ({ ...prev, artists }))}
              />
            </div>

            <button
              onClick={generateInvitation}
              disabled={isGenerating || !formData.eventName.trim()}
              style={{
                padding: "16px 32px",
                borderRadius: "14px",
                border: "none",
                background: isGenerating ? "rgba(100, 116, 139, 0.5)" : "linear-gradient(135deg, #00caff, #0088ff)",
                color: isGenerating ? "#64748b" : "#001a2e",
                fontSize: "1.1rem",
                fontWeight: "900",
                cursor: isGenerating || !formData.eventName.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                justifyContent: "center",
                boxShadow: isGenerating ? "none" : "0 0 30px rgba(0, 202, 255, 0.4)"
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                  <span>יוצר הזמנה + רקע...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>✨ צור הזמנה</span>
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

        {invitation && (
          <div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => exportPng('whatsapp')} disabled={isExporting} style={btnStyle("green")}>
                <Download size={18} /> הורד לווטסאפ
              </button>
              <button onClick={() => exportPng('story')} disabled={isExporting} style={btnStyle("purple")}>
                <Download size={18} /> הורד סטורי
              </button>
              <button onClick={shareImage} style={btnStyle("cyanOutline")}>
                <Share2 size={18} /> שתף
              </button>
              <button onClick={() => { setInvitation(null); setFormData({ eventName: "", date: "", time: "", location: "", phone: "", price: "", style: "karaoke", artists: [] }); }} style={btnStyle("redOutline")}>
                ✕ התחל מחדש
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <InvitationCard refObj={cardRef} data={invitation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InvitationCard({ refObj, data }) {
  const accent = "#D6B36A"; // זהב פרימיום קבוע
  const primaryText = "#FFFFFF"; // לבן מלא
  
  return (
    <div
      ref={refObj}
      style={{
        width: "100%",
        maxWidth: "min(1080px, 100vw)",
        aspectRatio: "1080 / 1350",
        position: "relative",
        borderRadius: "clamp(16px, 3vw, 24px)",
        overflow: "hidden",
        background: "#000",
        border: `3px solid ${accent}`,
        boxShadow: `0 0 40px ${rgba(accent, 0.25)}`
      }}
    >
      {/* רקע שנוצר */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${data.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.7) contrast(1.15) saturate(1.1)"
      }} />

      {/* לוגו אפריון - watermark מרובד */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden"
      }}>
        {/* לוגו גדול מרכזי */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-12deg)",
          fontSize: "clamp(200px, 28vw, 400px)",
          fontWeight: "900",
          color: "rgba(255,255,255,0.03)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          lineHeight: 1
        }}>
          APIRYON
        </div>
        
        {/* לוגו קטן פינה ימין עליון */}
        <div style={{
          position: "absolute",
          top: "clamp(15px, 3%, 30px)",
          right: "clamp(15px, 3%, 30px)",
          fontSize: "clamp(1rem, 2vw, 1.4rem)",
          fontWeight: "900",
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.15em",
          textTransform: "uppercase"
        }}>
          🎤 APIRYON
        </div>
      </div>

      {/* Overlay כהה לקריאות */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.75) 100%)"
      }} />

      {/* תוכן מקצועי */}
      <div style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(40px, 6%, 70px) clamp(30px, 5%, 50px)"
      }}>
        
        {/* כותרת ראשית - נקייה ומרשימה */}
        <div style={{
          textAlign: "center",
          marginBottom: "clamp(15px, 2.5%, 25px)"
        }}>
          <h1 style={{
            fontSize: "clamp(3.5rem, 8vw, 7rem)",
            fontWeight: "900",
            lineHeight: 0.9,
            margin: 0,
            textTransform: "uppercase",
            color: primaryText,
            textShadow: "0 4px 12px rgba(0,0,0,0.6)",
            letterSpacing: "0.02em"
          }}>
            {data.title}
          </h1>
        </div>

        {/* תת-כותרת */}
        <div style={{
          fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)",
          fontWeight: "400",
          color: primaryText,
          textAlign: "center",
          marginBottom: "clamp(35px, 5%, 50px)",
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          opacity: 0.95
        }}>
          {data.subtitle}
        </div>

        {/* עמודת מידע - צד ימין */}
        <div style={{
          marginBottom: "clamp(30px, 4.5%, 45px)"
        }}>
          {data.date && (
            <div style={{
              marginBottom: "clamp(18px, 3%, 25px)",
              textAlign: "right"
            }}>
              <div style={{
                fontSize: "clamp(0.9rem, 1.6vw, 1.1rem)",
                color: accent,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "6px"
              }}>תאריך</div>
              <div style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: "700",
                color: primaryText,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)"
              }}>
                {data.date}
              </div>
            </div>
          )}

          {data.time && (
            <div style={{
              marginBottom: "clamp(18px, 3%, 25px)",
              textAlign: "right"
            }}>
              <div style={{
                fontSize: "clamp(0.9rem, 1.6vw, 1.1rem)",
                color: accent,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "6px"
              }}>שעה</div>
              <div style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: "700",
                color: primaryText,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)"
              }}>
                {data.time}
              </div>
            </div>
          )}

          {data.location && (
            <div style={{
              textAlign: "right"
            }}>
              <div style={{
                fontSize: "clamp(0.9rem, 1.6vw, 1.1rem)",
                color: accent,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "6px"
              }}>מיקום</div>
              <div style={{
                fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)",
                fontWeight: "700",
                color: primaryText,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)"
              }}>
                {data.location}
              </div>
            </div>
          )}
        </div>

        {/* Highlights Panel */}
        {data.highlights?.length > 0 && (
          <div style={{
            background: "rgba(0,0,0,0.45)",
            borderRight: `4px solid ${accent}`,
            padding: "clamp(20px, 3.5%, 30px) clamp(25px, 4%, 35px)",
            marginBottom: "clamp(25px, 4%, 35px)",
            backdropFilter: "blur(8px)"
          }}>
            {data.highlights.slice(0, 3).map((h, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: i < 2 ? "clamp(15px, 2.5%, 20px)" : "0",
                textAlign: "right"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  background: accent,
                  borderRadius: "50%",
                  flexShrink: 0,
                  boxShadow: `0 0 10px ${rgba(accent, 0.6)}`
                }} />
                <span style={{
                  fontSize: "clamp(1.2rem, 2.3vw, 1.8rem)",
                  fontWeight: "400",
                  color: primaryText,
                  textShadow: "0 2px 6px rgba(0,0,0,0.4)"
                }}>
                  {h}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* תמונות זמרים */}
        {data.artists && data.artists.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: data.artists.length === 1 ? "1fr" : data.artists.length === 2 ? "1fr 1fr" : "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "clamp(15px, 2.5%, 20px)",
            marginBottom: "clamp(25px, 4%, 35px)"
          }}>
            {data.artists.map((artist, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: `3px solid ${accent}`,
                    marginBottom: "10px",
                    boxShadow: `0 4px 15px ${rgba(accent, 0.4)}`
                  }}
                />
                <div style={{
                  fontSize: "clamp(1.2rem, 2.3vw, 1.8rem)",
                  fontWeight: "700",
                  color: accent,
                  textShadow: "0 2px 8px rgba(0,0,0,0.6)"
                }}>
                  {artist.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ספייסר אוטומטי */}
        <div style={{ flex: 1 }} />

        {/* Contact + מחיר */}
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: "clamp(20px, 3.5%, 30px)",
          gap: "20px"
        }}>
          {data.phone && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
                color: accent,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                marginBottom: "8px"
              }}>הזמנות</div>
              <div style={{
                fontSize: "clamp(1.4rem, 2.6vw, 2rem)",
                fontWeight: "700",
                color: primaryText,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                direction: "ltr"
              }}>
                {data.phone}
              </div>
            </div>
          )}
          {data.price && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
                color: accent,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                marginBottom: "8px"
              }}>כניסה</div>
              <div style={{
                fontSize: "clamp(1.4rem, 2.6vw, 2rem)",
                fontWeight: "700",
                color: primaryText,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)"
              }}>
                {data.price}
              </div>
            </div>
          )}
        </div>

        {/* CTA תחתון */}
        <div style={{
          background: accent,
          padding: "clamp(18px, 3.5%, 28px)",
          textAlign: "center",
          borderRadius: "8px",
          boxShadow: `0 4px 20px ${rgba(accent, 0.4)}`,
          marginBottom: "clamp(15px, 2.5%, 20px)"
        }}>
          <div style={{
            fontSize: "clamp(1.3rem, 2.6vw, 2rem)",
            fontWeight: "700",
            color: "#000",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            {data.cta}
          </div>
        </div>

        {/* Footer - QR Codes */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "clamp(20px, 3.5%, 30px)",
          padding: "clamp(15px, 2.5%, 20px)",
          background: "rgba(0,0,0,0.5)",
          borderRadius: "8px"
        }}>
          <div style={{ textAlign: "center" }}>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
              alt="WhatsApp QR"
              style={{
                width: "clamp(70px, 10vw, 100px)",
                height: "clamp(70px, 10vw, 100px)",
                background: "#fff",
                padding: "5px",
                borderRadius: "8px",
                marginBottom: "5px"
              }}
            />
            <div style={{
              fontSize: "clamp(0.7rem, 1.3vw, 0.9rem)",
              color: primaryText,
              fontWeight: "600"
            }}>קבוצת WhatsApp</div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://www.tiktok.com/@apiryon.club"
              alt="TikTok QR"
              style={{
                width: "clamp(70px, 10vw, 100px)",
                height: "clamp(70px, 10vw, 100px)",
                background: "#fff",
                padding: "5px",
                borderRadius: "8px",
                marginBottom: "5px"
              }}
            />
            <div style={{
              fontSize: "clamp(0.7rem, 1.3vw, 0.9rem)",
              color: primaryText,
              fontWeight: "600"
            }}>TikTok</div>
          </div>
        </div>

        {/* לוגו קטן למטה עם אייקונים */}
        <div style={{
          position: "absolute",
          bottom: "clamp(20px, 3%, 30px)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(10px, 2vw, 15px)",
          fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
          color: "rgba(255,255,255,0.7)",
          fontWeight: "900",
          letterSpacing: "0.15em",
          textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
        }}>
          <span style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)" }}>🎤</span>
          <span>APIRYON CLUB</span>
          <span style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)" }}>🎤</span>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value, accent }) {
  return (
    <div style={{
      background: rgba(accent, 0.15),
      border: `2px solid ${rgba(accent, 0.4)}`,
      borderRadius: "14px",
      padding: "14px 10px",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{icon}</div>
      <div style={{
        fontSize: "0.65rem",
        color: accent,
        fontWeight: "900",
        marginBottom: "4px",
        textTransform: "uppercase",
        letterSpacing: "0.08em"
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "1.05rem",
        color: "#fff",
        fontWeight: "900"
      }}>
        {value}
      </div>
    </div>
  );
}

function btnStyle(type) {
  const base = {
    padding: "14px 24px",
    borderRadius: "12px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };
  if (type === "green") return { ...base, background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)" };
  if (type === "purple") return { ...base, background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" };
  if (type === "cyanOutline") return { ...base, border: "2px solid rgba(0, 202, 255, 0.4)", background: "rgba(0, 202, 255, 0.1)", color: "#00caff" };
  if (type === "redOutline") return { ...base, border: "2px solid rgba(239, 68, 68, 0.4)", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" };
  return base;
}

function getBgPrompt(styleId, eventName) {
  const prompts = {
    karaoke: "Vibrant karaoke club stage lights, microphones silhouettes, neon orange gold glow, energetic nightclub atmosphere, abstract bokeh lights",
    birthday: "Festive colorful balloons, confetti particles, warm celebration lighting, joyful party atmosphere, abstract decorative elements",
    mizrahi: "Middle Eastern ornate patterns, warm golden lighting, traditional decorative motifs, festive oriental atmosphere, abstract cultural design",
    club: "Modern nightclub laser beams, DJ booth lights, neon blue purple glow, fog effects, abstract techno atmosphere",
    premium: "Luxury golden lighting, elegant champagne bubbles, sophisticated premium atmosphere, classy ambient glow, abstract luxury design",
    holiday: "Festive decorative lights, party atmosphere, warm joyful colors, celebration mood, abstract holiday design"
  };

  return `${prompts[styleId] || prompts.karaoke}. Pure abstract visual atmosphere, NO TEXT, NO HEBREW, NO ENGLISH, NO WORDS, NO LETTERS, NO WRITING, NO SIGNS, NO TYPOGRAPHY whatsoever. Only lights, colors, patterns, and atmosphere. Professional photography, 4K, cinematic. Theme: ${eventName}`;
}

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  background: "rgba(2, 6, 23, 0.7)",
  color: "#fff",
  fontSize: "1rem",
  outline: "none"
};

const labelStyle = {
  display: "block",
  fontSize: "0.9rem",
  fontWeight: "700",
  color: "#cbd5e1",
  marginBottom: "8px"
};

function rgba(hex, a) {
  const h = (hex || "#FFD700").replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

EventProducer.isPublic = true;