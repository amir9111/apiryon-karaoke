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
        filter: "brightness(0.85) contrast(1.1)"
      }} />

      {/* שכבת קריאות */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at 50% 20%, ${rgba(accent, 0.25)}, transparent 60%),
          linear-gradient(180deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 40%, rgba(0,0,0,.75) 100%)
        `
      }} />

      {/* תוכן */}
      <div style={{
        position: "relative",
        height: "100%",
        padding: "clamp(30px, 5%, 60px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        {/* למעלה */}
        <div>
          <div style={{
            fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            textAlign: "center",
            marginBottom: "clamp(16px, 3%, 24px)",
            color: "#fff",
            textShadow: `0 0 20px ${rgba(accent, 0.6)}`
          }}>
            🎤 APIRYON CLUB 🎤
          </div>

          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: "900",
            textAlign: "center",
            marginBottom: "clamp(12px, 2%, 20px)",
            lineHeight: 1.05,
            background: `linear-gradient(180deg, #FFFFFF 0%, ${accent} 60%, #FFD700 120%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,.9))"
          }}>
            {data.title}
          </h1>

          <div style={{
            fontSize: "clamp(1.3rem, 2.8vw, 2.2rem)",
            fontWeight: "800",
            color: "#fff",
            textAlign: "center",
            textShadow: `0 0 20px ${rgba(accent, 0.4)}, 0 4px 15px rgba(0,0,0,.9)`
          }}>
            {data.subtitle}
          </div>
        </div>

        {/* אמצע */}
        <div style={{
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: "20px",
          padding: "clamp(20px, 4%, 35px)",
          border: `2px solid ${rgba(accent, 0.4)}`,
          backdropFilter: "blur(12px)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "20px"
          }}>
            {data.date && <InfoPill icon="📅" label="תאריך" value={data.date} accent={accent} />}
            {data.time && <InfoPill icon="⏰" label="שעה" value={data.time} accent={accent} />}
            {data.location && <InfoPill icon="📍" label="מיקום" value={data.location} accent={accent} />}
          </div>

          {data.highlights?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {data.highlights.map((h, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "clamp(1rem, 2vw, 1.3rem)",
                  color: "#e2e8f0",
                  fontWeight: "800"
                }}>
                  <span style={{ color: accent, fontSize: "1.3em" }}>✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}

          {data.phone && (
            <div style={{
              fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
              color: "#fbbf24",
              fontWeight: "900",
              textAlign: "center",
              marginBottom: "16px"
            }}>
              📞 {data.phone}
            </div>
          )}

          <div style={{
            background: `linear-gradient(135deg, ${accent}, #FFD700)`,
            padding: "clamp(16px, 3%, 22px)",
            borderRadius: "16px",
            textAlign: "center",
            fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
            fontWeight: "900",
            color: "#000",
            boxShadow: `0 0 30px ${rgba(accent, 0.5)}`
          }}>
            {data.cta}
          </div>
        </div>

        {/* למטה */}
        <div style={{
          fontSize: "clamp(0.85rem, 1.6vw, 1.1rem)",
          color: "#94a3b8",
          textAlign: "center",
          fontWeight: "700"
        }}>
          ✨ APIRYON • המועדון הקריוקי שלכם ✨
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