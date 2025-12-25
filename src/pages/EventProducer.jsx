import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toPng } from "html-to-image";
import { Sparkles, Download, Share2, Loader2, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EventProducer() {
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    location: "",
    phone: "",
    style: "karaoke"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef(null);

  const styles = [
    { id: "karaoke", label: "🎤 קריוקי", color: "#FFA500" },
    { id: "birthday", label: "🎂 יום הולדת", color: "#F472B6" },
    { id: "mizrahi", label: "🔥 מזרחי/חפלה", color: "#FFD700" },
    { id: "club", label: "✨ מועדון/טכנו", color: "#00CAFF" },
    { id: "premium", label: "💎 פרימיום", color: "#D6B36A" },
    { id: "holiday", label: "🎉 חג", color: "#F472B6" }
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

      // ייצור טקסט שיווקי
      const textPrompt = `
אתה קופירייטר למועדונים בישראל.
צור טקסט שיווקי קצר ומושך לאירוע עם הפרטים הבאים:
- שם: ${formData.eventName}
- סגנון: ${selectedStyle.label}
- תאריך: ${formData.date || "לא צוין"}
- שעה: ${formData.time || "לא צוין"}
- מיקום: ${formData.location || "לא צוין"}

החזר:
- כותרת קצרה וחזקה (3-5 מילים)
- תת-כותרת מושכת
- 3-4 Highlights
- CTA עם FOMO עדין

JSON בלבד.
`;

      const textResult = await base44.integrations.Core.InvokeLLM({
        prompt: textPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            highlights: { type: "array", items: { type: "string" } },
            cta: { type: "string" }
          },
          required: ["title", "subtitle", "cta"]
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

  const exportPng = async (w, h, filename) => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        width: w,
        height: h
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

            <div style={{ marginBottom: "24px" }}>
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

            <div style={{ marginBottom: "28px" }}>
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
              <button onClick={() => exportPng(1080, 1350, "apiryon-invitation.png")} disabled={isExporting} style={btnStyle("green")}>
                <Download size={18} /> הורד תמונה
              </button>
              <button onClick={() => exportPng(1080, 1920, "apiryon-story.png")} disabled={isExporting} style={btnStyle("purple")}>
                <Download size={18} /> הורד סטורי
              </button>
              <button onClick={shareImage} style={btnStyle("cyanOutline")}>
                <Share2 size={18} /> שתף
              </button>
              <button onClick={() => { setInvitation(null); setFormData({ ...formData, eventName: "", date: "", time: "", location: "", phone: "" }); }} style={btnStyle("redOutline")}>
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
  const accent = data.accentColor;
  
  return (
    <div
      ref={refObj}
      style={{
        width: "min(1080px, 100%)",
        aspectRatio: "1080 / 1350",
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        background: "#000",
        border: `3px solid ${rgba(accent, 0.4)}`,
        boxShadow: `0 0 60px ${rgba(accent, 0.2)}`
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

      {/* שכבת קריאות */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at 30% 25%, ${rgba(accent, 0.35)}, transparent 55%),
          radial-gradient(circle at 70% 80%, ${rgba(accent, 0.25)}, transparent 50%),
          linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.3) 45%, rgba(0,0,0,.75) 100%)
        `
      }} />

      {/* תוכן חופשי */}
      <div style={{
        position: "relative",
        height: "100%",
        padding: "clamp(35px, 5.5%, 65px)"
      }}>
        
        {/* כותרת ענקית */}
        <div style={{
          transform: "rotate(-3deg)",
          marginBottom: "clamp(18px, 3%, 30px)",
          position: "relative",
          zIndex: 2
        }}>
          <h1 style={{
            fontSize: "clamp(3.5rem, 8vw, 6.5rem)",
            fontWeight: "900",
            lineHeight: 0.95,
            textAlign: "right",
            margin: 0,
            textTransform: "uppercase",
            color: "#fff",
            textShadow: `
              4px 4px 0px ${rgba(accent, 0.9)},
              8px 8px 0px rgba(0,0,0,0.5),
              0 0 60px ${rgba(accent, 0.7)},
              0 0 100px ${rgba(accent, 0.4)}
            `,
            letterSpacing: "-0.02em",
            WebkitTextStroke: `2px ${rgba(accent, 0.3)}`
          }}>
            {data.title}
          </h1>
        </div>

        {/* תת-כותרת */}
        <div style={{
          fontSize: "clamp(1.8rem, 3.8vw, 3rem)",
          fontWeight: "900",
          color: accent,
          textAlign: "right",
          marginBottom: "clamp(25px, 4%, 40px)",
          textShadow: `
            2px 2px 0px rgba(0,0,0,0.8),
            0 0 30px ${rgba(accent, 0.8)}
          `,
          transform: "rotate(-1deg)",
          lineHeight: 1.15
        }}>
          {data.subtitle}
        </div>

        {/* פרטי אירוע - פיזור חופשי */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(16px, 3%, 24px)",
          marginBottom: "clamp(25px, 4%, 35px)"
        }}>
          {data.date && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transform: "rotate(1deg)"
            }}>
              <div style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                filter: `drop-shadow(0 0 15px ${rgba(accent, 0.7)})`
              }}>📅</div>
              <div>
                <div style={{
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  fontWeight: "900",
                  color: "#fff",
                  lineHeight: 1,
                  textShadow: `2px 2px 0px rgba(0,0,0,0.7), 0 0 20px ${rgba(accent, 0.6)}`
                }}>
                  {data.date}
                </div>
              </div>
            </div>
          )}

          {data.time && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transform: "rotate(-1.5deg)"
            }}>
              <div style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                filter: `drop-shadow(0 0 15px ${rgba(accent, 0.7)})`
              }}>⏰</div>
              <div>
                <div style={{
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  fontWeight: "900",
                  color: "#fff",
                  lineHeight: 1,
                  textShadow: `2px 2px 0px rgba(0,0,0,0.7), 0 0 20px ${rgba(accent, 0.6)}`
                }}>
                  {data.time}
                </div>
              </div>
            </div>
          )}

          {data.location && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transform: "rotate(0.8deg)"
            }}>
              <div style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                filter: `drop-shadow(0 0 15px ${rgba(accent, 0.7)})`
              }}>📍</div>
              <div>
                <div style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                  fontWeight: "900",
                  color: "#fff",
                  lineHeight: 1,
                  textShadow: `2px 2px 0px rgba(0,0,0,0.7), 0 0 20px ${rgba(accent, 0.6)}`
                }}>
                  {data.location}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Highlights */}
        {data.highlights?.length > 0 && (
          <div style={{
            marginBottom: "clamp(25px, 4%, 35px)",
            transform: "rotate(-0.5deg)"
          }}>
            {data.highlights.map((h, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px"
              }}>
                <span style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                  color: accent,
                  filter: `drop-shadow(0 0 12px ${rgba(accent, 0.8)})`
                }}>★</span>
                <span style={{
                  fontSize: "clamp(1.3rem, 2.6vw, 2rem)",
                  fontWeight: "900",
                  color: "#fff",
                  textShadow: `2px 2px 0px rgba(0,0,0,0.8), 0 0 15px ${rgba(accent, 0.5)}`
                }}>
                  {h}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* טלפון */}
        {data.phone && (
          <div style={{
            fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)",
            color: "#fbbf24",
            fontWeight: "900",
            textAlign: "center",
            marginBottom: "clamp(20px, 3%, 30px)",
            textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 25px rgba(251, 191, 36, 0.7)",
            transform: "rotate(-1deg)"
          }}>
            📞 {data.phone}
          </div>
        )}

        {/* CTA ענק */}
        <div style={{
          position: "relative",
          transform: "rotate(1.5deg)"
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${accent}, #FFD700)`,
            padding: "clamp(20px, 4%, 30px) clamp(18px, 3.5%, 28px)",
            borderRadius: "20px",
            textAlign: "center",
            fontSize: "clamp(1.8rem, 3.8vw, 3rem)",
            fontWeight: "900",
            color: "#000",
            textTransform: "uppercase",
            boxShadow: `
              5px 5px 0px rgba(0,0,0,0.4),
              0 0 50px ${rgba(accent, 0.7)},
              inset 0 3px 15px rgba(255,255,255,0.3)
            `,
            border: "4px solid #000",
            letterSpacing: "0.02em"
          }}>
            {data.cta}
          </div>
        </div>

        {/* לוגו קטן למטה */}
        <div style={{
          position: "absolute",
          bottom: "clamp(20px, 3%, 30px)",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
          color: "rgba(255,255,255,0.6)",
          fontWeight: "900",
          letterSpacing: "0.15em",
          textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
        }}>
          APIRYON CLUB
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
    karaoke: "Vibrant karaoke club atmosphere with stage lights, microphones, neon glow, warm orange and gold lighting, energetic nightlife vibe, professional photography",
    birthday: "Festive birthday party atmosphere with colorful balloons, confetti, warm lighting, celebration vibes, joyful energy, professional event photography",
    mizrahi: "Middle Eastern party celebration, warm stage lights, traditional ornate decorations, golden and orange hues, festive dance floor, oriental patterns, premium club atmosphere",
    club: "Modern nightclub with laser lights, DJ booth, neon blue and purple lighting, fog effects, energetic dance floor, techno atmosphere, professional club photography",
    premium: "Luxury elegant venue, sophisticated golden lighting, premium interior, champagne vibes, classy atmosphere, high-end event space",
    holiday: "Festive celebration atmosphere, decorative lights, party decorations, warm joyful colors, celebratory mood, special occasion vibes"
  };

  return `${prompts[styleId] || prompts.karaoke}. High quality, professional event photography, 4K resolution, cinematic lighting. Event theme: ${eventName}`;
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