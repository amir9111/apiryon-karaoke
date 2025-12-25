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
    { id: "mizrahi", label: "🔥 חפלה מזרחית", color: "#FFD700" },
    { id: "combined", label: "⭐ קריוקי + מזרחית", color: "#FFD700" }
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

      const textPrompt = `
אתה מעצב פליירים ברמת מועדוני־על והופעות גדולות בישראל.
המטרה: לגרום לצופה לרצות להגיע – לא רק "להבין שיש אירוע".

אין לנתח את המידע ואין לשנות טקסטים.
העבודה שלך היא ליצור טקסטים שמוכרים.

עקרונות חובה:

היררכיית טקסט:
- כותרת ראשית: 2-4 מילים חזקות מאוד (מוקד העין)
- תת־כותרת: משפט רגשי אחד בלבד שגורם לרצות להגיע
- Highlights: בדיוק 3 שורות, כל אחת 3-6 מילים, דברים שגורמים לאנשים להרגיש שהם חייבים להיות שם
- CTA: משפט אחד עם FOMO חזק – "אם לא תבוא, תפספס"

פרטי האירוע:
- שם: ${formData.eventName}
- סגנון: ${selectedStyle.label}
- תאריך: ${formData.date || "לא צוין"}
- שעה: ${formData.time || "לא צוין"}
- מיקום: ${formData.location || "לא צוין"}

תחושה:
- יוקרתי
- חזק
- ביטחון עצמי
- "זה אירוע שכולם מדברים עליו"

המבחן: אם הצופה לא מרגיש FOMO תוך 2 שניות – נכשלת.

בלי emoji בטקסט. החזר JSON בלבד.
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
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
  const accent = "#FFD700";
  const primaryText = "#FFFFFF";
  
  return (
    <div
      ref={refObj}
      style={{
        width: "1080px",
        height: "1350px",
        position: "relative",
        overflow: "hidden",
        background: "#000",
        fontFamily: "'Arial', 'Helvetica', sans-serif"
      }}
    >
      {/* רקע */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${data.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.5) contrast(1.3) saturate(1.2)"
      }} />

      {/* Overlay כהה */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.85) 100%)"
      }} />

      {/* תוכן */}
      <div style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "40px 35px"
      }}>
        
        {/* לוגו אמיתי - משולב טבעי */}
        <div style={{
          position: "absolute",
          top: "30px",
          right: "30px",
          width: "150px",
          height: "150px",
          zIndex: 10,
          borderRadius: "50%",
          overflow: "hidden",
          background: "radial-gradient(circle, rgba(0,40,60,0.9) 0%, rgba(0,20,40,0.7) 50%, transparent 100%)",
          padding: "10px",
          boxShadow: "0 0 40px rgba(0, 202, 255, 0.6), 0 0 80px rgba(0, 202, 255, 0.3)"
        }}>
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c1c7149a5af7efdab4614/658f38deb_WhatsAppImage2025-12-25at033539.jpg"
            alt="APIRYON"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%"
            }}
          />
        </div>

        {/* תאריך מקצועי פינה שמאל */}
        {data.date && (
          <div style={{
            position: "absolute",
            top: "30px",
            left: "30px",
            textAlign: "left",
            zIndex: 10,
            background: "rgba(0,0,0,0.7)",
            padding: "15px 20px",
            borderRadius: "12px",
            border: `2px solid ${accent}`,
            boxShadow: `0 0 20px ${rgba(accent, 0.4)}`
          }}>
            <div style={{
              fontSize: "3.5rem",
              fontWeight: "900",
              lineHeight: 0.85,
              background: `linear-gradient(135deg, ${accent}, #FFA500)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em"
            }}>
              {data.date.split(' ')[1] || data.date}
            </div>
            <div style={{
              fontSize: "0.85rem",
              color: accent,
              fontWeight: "700",
              marginTop: "8px",
              letterSpacing: "0.15em",
              textShadow: `0 0 10px ${rgba(accent, 0.6)}`
            }}>
              OPEN DOORS
            </div>
            {data.time && (
              <div style={{
                fontSize: "1.4rem",
                color: primaryText,
                fontWeight: "900",
                marginTop: "3px",
                letterSpacing: "0.05em"
              }}>
                {data.time}
              </div>
            )}
          </div>
        )}

        {/* כותרת HERO דרמטית */}
        <div style={{
          marginTop: "200px",
          marginBottom: "50px",
          position: "relative",
          padding: "0 30px"
        }}>
          <div style={{
            fontSize: "7rem",
            fontWeight: "900",
            lineHeight: 0.85,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            textShadow: `
              0 0 60px ${accent},
              0 0 120px rgba(255, 215, 0, 0.6),
              0 10px 40px rgba(0,0,0,0.9),
              0 20px 80px rgba(0,0,0,0.7)
            `,
            marginBottom: "30px",
            fontFamily: "Impact, 'Arial Black', sans-serif"
          }}>
            {data.title}
          </div>
          
          <div style={{
            fontSize: "2rem",
            fontWeight: "700",
            textAlign: "center",
            color: accent,
            letterSpacing: "0.15em",
            textShadow: `0 0 30px ${accent}, 0 4px 20px rgba(0,0,0,0.9)`,
            lineHeight: 1.3,
            textTransform: "uppercase"
          }}>
            {data.subtitle}
          </div>
        </div>

        {/* תמונות זמרים */}
        {data.artists && data.artists.length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            marginBottom: "40px",
            flexWrap: "wrap",
            padding: "0 20px"
          }}>
            {data.artists.map((artist, i) => (
              <div key={i} style={{ textAlign: "center", position: "relative" }}>
                <div style={{
                  width: data.artists.length === 1 ? "320px" : "200px",
                  height: data.artists.length === 1 ? "320px" : "200px",
                  position: "relative"
                }}>
                  <img 
                    src={artist.image} 
                    alt={artist.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: `6px solid transparent`,
                      background: `linear-gradient(#000, #000) padding-box, linear-gradient(135deg, ${accent}, #FFA500) border-box`,
                      boxShadow: `0 0 40px ${accent}, 0 0 80px ${rgba(accent, 0.4)}, inset 0 0 20px rgba(0,0,0,0.5)`
                    }}
                  />
                </div>
                <div style={{
                  fontSize: data.artists.length === 1 ? "2.8rem" : "2rem",
                  fontWeight: "900",
                  marginTop: "20px",
                  background: `linear-gradient(135deg, ${accent}, #FFA500)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `drop-shadow(0 0 15px ${accent})`,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em"
                }}>
                  {artist.name}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Highlights - ללא קשר לזמרים */}
        {data.highlights && data.highlights.length > 0 && (
          <div style={{
            marginBottom: "30px",
            padding: "0 40px"
          }}>
            {data.highlights.map((h, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "15px",
                marginBottom: "18px"
              }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${accent}, #FFA500)`,
                  boxShadow: `0 0 15px ${accent}`,
                  flexShrink: 0
                }} />
                <div style={{
                  fontSize: "1.6rem",
                  color: primaryText,
                  fontWeight: "600",
                  textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                  textAlign: "center"
                }}>{h}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* מידע חשוב - מיקום וכניסה בשורה אחת */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "50px",
          marginBottom: "35px",
          padding: "0 30px",
          flexWrap: "wrap"
        }}>
          {data.location && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "15px",
              background: "rgba(0,0,0,0.5)",
              padding: "18px 30px",
              borderRadius: "16px",
              border: `2px solid ${rgba(accent, 0.4)}`,
              boxShadow: `0 0 25px ${rgba(accent, 0.3)}`
            }}>
              <div style={{
                fontSize: "2.5rem"
              }}>📍</div>
              <div>
                <div style={{
                  fontSize: "0.85rem",
                  color: accent,
                  fontWeight: "700",
                  marginBottom: "4px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase"
                }}>מיקום</div>
                <div style={{
                  fontSize: "1.6rem",
                  fontWeight: "900",
                  color: primaryText,
                  textShadow: "0 2px 8px rgba(0,0,0,0.7)"
                }}>{data.location}</div>
              </div>
            </div>
          )}
          {data.price && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "15px",
              background: "rgba(0,0,0,0.5)",
              padding: "18px 30px",
              borderRadius: "16px",
              border: `2px solid ${rgba(accent, 0.4)}`,
              boxShadow: `0 0 25px ${rgba(accent, 0.3)}`
            }}>
              <div style={{
                fontSize: "2.5rem"
              }}>💳</div>
              <div>
                <div style={{
                  fontSize: "0.85rem",
                  color: accent,
                  fontWeight: "700",
                  marginBottom: "4px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase"
                }}>כניסה</div>
                <div style={{
                  fontSize: "1.6rem",
                  fontWeight: "900",
                  color: primaryText,
                  textShadow: "0 2px 8px rgba(0,0,0,0.7)"
                }}>{data.price}</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* CTA מקצועי */}
        <div style={{
          background: `linear-gradient(135deg, ${accent} 0%, #FFA500 50%, ${accent} 100%)`,
          padding: "30px 25px",
          borderRadius: "16px",
          marginBottom: "25px",
          boxShadow: `0 0 50px ${accent}, 0 10px 40px rgba(0,0,0,0.7)`,
          border: "2px solid rgba(255,255,255,0.1)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15), transparent 60%)",
            pointerEvents: "none"
          }} />
          
          <div style={{
            fontSize: "2.2rem",
            fontWeight: "900",
            color: "#000",
            textAlign: "center",
            marginBottom: "20px",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            textShadow: "0 2px 4px rgba(255,255,255,0.3)",
            position: "relative"
          }}>
            {data.cta}
          </div>
          
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "40px",
            position: "relative"
          }}>
            {data.phone && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "0.85rem",
                  color: "rgba(0,0,0,0.6)",
                  fontWeight: "700",
                  marginBottom: "6px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase"
                }}>📞 להזמנות</div>
                <div style={{
                  fontSize: "1.8rem",
                  fontWeight: "900",
                  color: "#000",
                  direction: "ltr",
                  letterSpacing: "0.05em"
                }}>
                  {data.phone}
                </div>
              </div>
            )}
            {data.price && (
              <div style={{
                width: "2px",
                height: "50px",
                background: "rgba(0,0,0,0.2)"
              }} />
            )}
            {data.price && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "0.85rem",
                  color: "rgba(0,0,0,0.6)",
                  fontWeight: "700",
                  marginBottom: "6px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase"
                }}>💳 כניסה</div>
                <div style={{
                  fontSize: "1.8rem",
                  fontWeight: "900",
                  color: "#000",
                  letterSpacing: "0.05em"
                }}>
                  {data.price}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer קומפקטי בתחתית */}
        <div style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)",
          padding: "20px",
          borderRadius: "20px 20px 0 0",
          border: `2px solid ${rgba(accent, 0.3)}`,
          borderBottom: "none",
          boxShadow: `0 -5px 30px ${rgba(accent, 0.2)}`
        }}>
          {/* שורה ראשונה: אייקונים */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "30px",
            marginBottom: "18px"
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1877f2, #0d65d9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: "900",
              color: "#fff",
              boxShadow: "0 6px 20px rgba(24, 119, 242, 0.5)",
              border: "3px solid rgba(255,255,255,0.1)"
            }}>f</div>

            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #E1306C, #C13584, #833AB4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              boxShadow: "0 6px 20px rgba(193, 53, 132, 0.5)",
              border: "3px solid rgba(255,255,255,0.1)"
            }}>📷</div>

            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #25D366, #128C7E)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              boxShadow: "0 6px 20px rgba(37, 211, 102, 0.5)",
              border: "3px solid rgba(255,255,255,0.1)"
            }}>💬</div>
          </div>

          {/* קו מפריד */}
          <div style={{
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${rgba(accent, 0.5)}, transparent)`,
            margin: "15px 0"
          }} />

          {/* שורה שנייה: QR codes קטנים */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "35px",
            marginBottom: "15px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "75px",
                height: "75px",
                background: "#fff",
                padding: "5px",
                borderRadius: "10px",
                border: `2px solid ${accent}`,
                boxShadow: `0 0 15px ${rgba(accent, 0.4)}`,
                marginBottom: "6px"
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
                  style={{ width: "100%", height: "100%", display: "block" }}
                  alt="QR WhatsApp"
                />
              </div>
              <div style={{
                fontSize: "0.65rem",
                color: accent,
                fontWeight: "700",
                letterSpacing: "0.05em",
                textShadow: `0 0 10px ${accent}`
              }}>WhatsApp</div>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "75px",
                height: "75px",
                background: "#fff",
                padding: "5px",
                borderRadius: "10px",
                border: `2px solid ${accent}`,
                boxShadow: `0 0 15px ${rgba(accent, 0.4)}`,
                marginBottom: "6px"
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://www.tiktok.com/@apiryon.club"
                  style={{ width: "100%", height: "100%", display: "block" }}
                  alt="QR TikTok"
                />
              </div>
              <div style={{
                fontSize: "0.65rem",
                color: accent,
                fontWeight: "700",
                letterSpacing: "0.05em",
                textShadow: `0 0 10px ${accent}`
              }}>TikTok</div>
            </div>
          </div>

          {/* לוגו תחתון */}
          <div style={{
            textAlign: "center",
            fontSize: "1.1rem",
            fontWeight: "900",
            color: "#fff",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textShadow: `0 0 20px ${accent}, 0 0 40px ${rgba(accent, 0.3)}`,
            fontFamily: "Impact, 'Arial Black', sans-serif"
          }}>
            APIRYON CLUB
          </div>
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