import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toPng } from "html-to-image";
import { Sparkles, Download, Share2, Loader2, Home, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EventProducerFinal() {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // ✅ Background image (REAL photo style like your example)
  const [bgImage, setBgImage] = useState(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);

  // Optional inspiration template (AI reads style)
  const [templateImage, setTemplateImage] = useState(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);

  const cardRef = useRef(null);

  const uploadToBase44 = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBg(true);
    try {
      const url = await uploadToBase44(file);
      setBgImage(url);
    } catch (err) {
      console.error(err);
      alert("שגיאה בהעלאת תמונת רקע");
    } finally {
      setIsUploadingBg(false);
    }
  };

  const handleTemplateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingTemplate(true);
    try {
      const url = await uploadToBase44(file);
      setTemplateImage(url);
    } catch (err) {
      console.error(err);
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
      const signals = deriveSignalsFromText(inputText);

      const prompt = `
אתה קופירייטר ומעצב פליירים למועדונים בישראל.
תוצאה חייבת להרגיש כמו פלייר "ברמה קטלנית" עם פסיכולוגיה של תשומת לב:
- כותרת קצרה וחזקה (3-6 מילים)
- תת-כותרת שמוסיפה ערך/הבטחה
- Highlights קצר (3-5)
- CTA קצר עם דחיפות עדינה (FOMO)
- אם יש תאריך/שעה/מיקום/טלפון: חלץ וכתוב נקי בעברית

טקסט:
"""
${inputText}
"""

Signals (להכוונה):
${JSON.stringify(signals, null, 2)}

החזר JSON בלבד.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        ...(templateImage ? { file_urls: [templateImage] } : {}),
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            date: { type: "string" },
            time: { type: "string" },
            location: { type: "string" },
            contact: { type: "string" },
            highlights: { type: "array", items: { type: "string" } },
            callToAction: { type: "string" },
            mood: { type: "string", enum: ["hot", "club", "premium", "festive"] }
          },
          required: ["title", "subtitle", "callToAction", "mood"]
        }
      });

      // merge: stable rules decide palette/effects
      const design = deriveDesignFromSignals(signals, result.mood);

      setInvitation({
        ...result,
        highlights: (result.highlights || []).slice(0, 5),
        signals,
        design
      });
    } catch (e) {
      console.error(e);
      alert("שגיאה בניתוח. נסה שוב.");
    } finally {
      setIsAnalyzing(false);
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
    } catch (e) {
      console.error(e);
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

  const accent = invitation?.design?.accent || "#FFD700";

  return (
    <div dir="rtl" style={pageStyle}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ marginBottom: 20 }}>
          <Link to={createPageUrl("Home")} style={backStyle}>
            <Home className="w-5 h-5" />
            <span>חזרה לדף הבית</span>
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Sparkles size={32} style={{ color: "#00caff" }} />
            <h1 style={headerTitleStyle}>יוצר הזמנות – פלייר פרו</h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem" }}>
            מעלה תמונת רקע + כותב טקסט → יוצא פלייר כמו מועדון אמיתי
          </p>
        </div>

        {!invitation && (
          <div style={panelStyle}>
            {/* Background upload */}
            <UploaderBox
              title="📸 העלה תמונת רקע לפלייר (מומלץ!)"
              subtitle="זה מה שגורם לזה להיראות כמו ההזמנה שלך – צילום/גרפיקה איכותית"
              okLabel={bgImage ? "✓ רקע הועלה" : "העלה רקע"}
              isUploading={isUploadingBg}
              onChange={handleBgUpload}
              previewUrl={bgImage}
              onClear={() => setBgImage(null)}
              color="rgba(0,202,255,.25)"
              icon={<ImageIcon size={18} />}
            />

            {/* Template upload (optional) */}
            <UploaderBox
              title="🎨 העלה תבנית להשראה (אופציונלי)"
              subtitle="ה-AI ילמד ניסוח/טון מהפלייר שלך"
              okLabel={templateImage ? "✓ תבנית הועלתה" : "העלה תבנית"}
              isUploading={isUploadingTemplate}
              onChange={handleTemplateUpload}
              previewUrl={templateImage}
              onClear={() => setTemplateImage(null)}
              color="rgba(139,92,246,.25)"
              icon={<Sparkles size={18} />}
            />

            <label style={{ display: "block", fontSize: "1.15rem", fontWeight: 900, color: "#00caff", marginBottom: 12 }}>
              📝 הזן פרטי אירוע (טקסט חופשי)
            </label>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`לדוגמה:
אפריון קריוקי - חמישי🔥
21:00 מתחילים
ריקודים • שירה • אווירה חמה
DJ LIVE
להזמנות: 050-1234567`}
              style={textareaStyle}
            />

            <button
              onClick={analyzeAndBuild}
              disabled={isAnalyzing || !inputText.trim()}
              style={buildBtnStyle(isAnalyzing, inputText)}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                  <span>בונה פלייר...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>🎨 תייצר לי הזמנה</span>
                </>
              )}
            </button>

            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {invitation && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => exportPng(1080, 1350, "apiryon-invitation.png")} disabled={isExporting} style={btnStyle("green")}>
                <Download size={18} /> הורד תמונה
              </button>
              <button onClick={() => exportPng(1080, 1920, "apiryon-story.png")} disabled={isExporting} style={btnStyle("purple")}>
                <Download size={18} /> הורד סטורי
              </button>
              <button onClick={shareImage} style={btnStyle("cyanOutline")}>
                <Share2 size={18} /> שתף
              </button>
              <button onClick={() => { setInvitation(null); setInputText(""); }} style={btnStyle("redOutline")}>
                ✕ התחל מחדש
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <FlyerCard
                refObj={cardRef}
                bgImage={bgImage}
                accent={accent}
                brand="APIRYON CLUB"
                data={invitation}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ Flyer Card (like pro invitation) ============================ */
function FlyerCard({ refObj, bgImage, accent, brand, data }) {
  const d = data || {};
  const sig = d.signals || {};
  const design = d.design || {};

  const topTag = sig.holidayLabel ? sig.holidayLabel : (design.topTag || "🎤 ערב קריוקי");
  const badges = buildBadges(sig);

  return (
    <div
      ref={refObj}
      style={{
        width: "min(1080px, 100%)",
        aspectRatio: "1080 / 1350",
        position: "relative",
        borderRadius: 26,
        overflow: "hidden",
        background: "linear-gradient(135deg,#0b0b0f,#0b0b0f)",
        border: `3px solid ${rgba(accent, 0.35)}`,
        boxShadow: `0 0 80px ${rgba(accent, 0.18)}, 0 0 140px rgba(0,0,0,.65)`
      }}
    >
      {/* Background image */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: bgImage ? `url(${bgImage})` : fallbackBg(design.mood, accent),
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: bgImage ? "contrast(1.05) saturate(1.1)" : "none",
        transform: "scale(1.02)"
      }} />

      {/* Readability overlays (this is the secret sauce) */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at 50% 20%, ${rgba(accent, 0.22)}, transparent 55%),
          linear-gradient(180deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.35) 35%, rgba(0,0,0,.70) 100%)
        `
      }} />

      {/* Hero watermark */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.18
      }}>
        <div style={{
          position: "absolute",
          left: "50%",
          top: "43%",
          transform: "translate(-50%, -50%) rotate(-14deg)",
          fontSize: "min(440px, 36vw)",
          filter: `drop-shadow(0 0 60px ${rgba(accent, 0.25)})`
        }}>
          {sig.heroIcon || "🎤"}
        </div>
      </div>

      {/* Content */}
      <div style={{
        position: "relative",
        height: "100%",
        padding: "clamp(26px, 4.5%, 58px)",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18
        }}>
          <div style={{
            fontSize: 14,
            fontWeight: 950,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "#fff",
            opacity: 0.9
          }}>
            {brand}
          </div>

          <div style={{
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(0,0,0,.45)",
            border: `1px solid ${rgba(accent, 0.55)}`,
            color: "#fff",
            fontWeight: 950,
            textShadow: `0 0 14px ${rgba(accent, 0.35)}`
          }}>
            {topTag}
          </div>
        </div>

        {/* Title */}
        <div style={{
          textAlign: "center",
          marginTop: 2
        }}>
          <h1 style={{
            margin: 0,
            fontSize: "clamp(2.2rem, 5.3vw, 4.1rem)",
            fontWeight: 1000,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            background: `linear-gradient(180deg, #FFFFFF 0%, ${accent} 55%, #FFD700 120%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 7px 18px rgba(0,0,0,.85))"
          }}>
            {d.title}
          </h1>

          <div style={{
            marginTop: 10,
            fontSize: "clamp(1.25rem, 2.7vw, 2.1rem)",
            fontWeight: 950,
            color: "#fff",
            textShadow: `0 0 20px ${rgba(accent, 0.35)}, 0 4px 16px rgba(0,0,0,.9)`
          }}>
            {d.subtitle}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ height: "clamp(16px, 3vh, 26px)" }} />

        {/* Info row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: 12,
          marginBottom: 16
        }}>
          <InfoBox icon="📅" label="תאריך" value={d.date || "—"} accent={accent} />
          <InfoBox icon="⏰" label="שעה" value={d.time || "—"} accent={accent} />
          <InfoBox icon="📍" label="מיקום" value={d.location || "האפריון"} accent={accent} />
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {badges.map((b) => (
              <div key={b} style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(0,0,0,.45)",
                border: `1px solid ${rgba(accent, 0.45)}`,
                color: "#fff",
                fontWeight: 950
              }}>
                {b}
              </div>
            ))}
          </div>
        )}

        {/* Highlights */}
        {Array.isArray(d.highlights) && d.highlights.length > 0 && (
          <div style={{
            background: "rgba(0,0,0,.45)",
            border: `1px solid ${rgba(accent, 0.30)}`,
            borderRadius: 18,
            padding: "16px 16px",
            marginBottom: 14,
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {d.highlights.slice(0, 5).map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", color: "#e5e7eb", fontWeight: 900 }}>
                  <span style={{ color: accent, fontSize: 18 }}>✓</span>
                  <span style={{ fontSize: "clamp(.95rem, 1.6vw, 1.15rem)" }}>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {d.contact && (
          <div style={{
            textAlign: "center",
            marginBottom: 12,
            fontWeight: 1000,
            color: "#fff",
            textShadow: "0 3px 12px rgba(0,0,0,.9)"
          }}>
            📞 {d.contact}
          </div>
        )}

        {/* CTA at bottom */}
        <div style={{ marginTop: "auto" }}>
          <div style={{
            background: `linear-gradient(135deg, ${accent}, #FFD700)`,
            color: "#000",
            borderRadius: 18,
            padding: "18px 18px",
            fontWeight: 1000,
            textAlign: "center",
            fontSize: "clamp(1.15rem, 2.1vw, 1.55rem)",
            boxShadow: `0 0 34px ${rgba(accent, 0.35)}, 0 6px 18px rgba(0,0,0,.65)`
          }}>
            {d.callToAction}
          </div>

          <div style={{
            marginTop: 12,
            textAlign: "center",
            color: "rgba(255,255,255,.7)",
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: ".08em"
          }}>
            ✨ APIRYON • KARAOKE • PARTY ✨
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ UI Helpers ============================ */
function UploaderBox({ title, subtitle, okLabel, isUploading, onChange, previewUrl, onClear, color, icon }) {
  return (
    <div style={{
      marginBottom: 18,
      padding: 18,
      background: "rgba(0,0,0,.25)",
      borderRadius: 16,
      border: `2px dashed ${color}`
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "1.05rem", fontWeight: 950, color: "#fff", marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: ".9rem", color: "#94a3b8" }}>
            {subtitle}
          </div>
        </div>

        <label style={{
          padding: "12px 18px",
          borderRadius: 12,
          background: previewUrl ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#00caff,#0088ff)",
          color: "#001a2e",
          fontWeight: 950,
          cursor: isUploading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          {isUploading ? (
            <>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              <span>מעלה...</span>
            </>
          ) : (
            <>
              {icon}
              <span>{previewUrl ? okLabel : okLabel}</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={onChange} style={{ display: "none" }} />
        </label>
      </div>

      {previewUrl && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={previewUrl}
            alt="preview"
            style={{ width: 84, height: 84, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(255,255,255,.15)" }}
          />
          <button
            onClick={onClear}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(239,68,68,.5)",
              background: "rgba(239,68,68,.12)",
              color: "#ef4444",
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            הסר
          </button>
        </div>
      )}
    </div>
  );
}

function InfoBox({ icon, label, value, accent }) {
  return (
    <div style={{
      background: "rgba(0,0,0,.45)",
      border: `1px solid ${rgba(accent, 0.35)}`,
      borderRadius: 16,
      padding: "14px 12px",
      textAlign: "center",
      backdropFilter: "blur(10px)"
    }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 950, color: rgba(accent, 0.9) }}>
        {label}
      </div>
      <div style={{ marginTop: 6, fontSize: 16, fontWeight: 1000, color: "#fff" }}>
        {value}
      </div>
    </div>
  );
}

function btnStyle(type) {
  const base = {
    padding: "14px 22px",
    borderRadius: 12,
    border: "none",
    fontSize: "1rem",
    fontWeight: 950,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8
  };
  if (type === "green") return { ...base, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", boxShadow: "0 0 20px rgba(16,185,129,.3)" };
  if (type === "purple") return { ...base, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#fff", boxShadow: "0 0 20px rgba(139,92,246,.3)" };
  if (type === "cyanOutline") return { ...base, border: "2px solid rgba(0,202,255,.4)", background: "rgba(0,202,255,.1)", color: "#00caff" };
  if (type === "redOutline") return { ...base, border: "2px solid rgba(239,68,68,.4)", background: "rgba(239,68,68,.1)", color: "#ef4444" };
  return base;
}

/* ============================ Rules: signals + design ============================ */
function deriveSignalsFromText(raw) {
  const t = (raw || "").toLowerCase();
  const hasAny = (arr) => arr.some((w) => t.includes(w));

  const holiday =
    hasAny(["חנוכה", "חנוכיה", "סופגניה"]) ? "hanukkah" :
    hasAny(["פורים", "תחפושת", "מגילה"]) ? "purim" :
    hasAny(["עצמאות", "יום העצמאות", "דגל"]) ? "independence" :
    hasAny(["שנה חדשה", "סילבסטר", "new year"]) ? "newyear" :
    hasAny(["פסח", "מצה"]) ? "passover" :
    hasAny(["רמדאן", "איפטאר"]) ? "ramadan" :
    null;

  const vibe =
    hasAny(["חפלה", "מזרחית", "דרבוקות", "להיטים", "קצב"]) ? "hafla" :
    hasAny(["טכנו", "techno", "האוס", "house", "רייב"]) ? "club" :
    hasAny(["vip", "יוקרתי", "פרימיום", "שולחן"]) ? "premium" :
    "karaoke";

  const intensity =
    hasAny(["🔥", "מטורף", "פצצה", "שריפה", "מפוצץ", "טירוף"]) ? "high" :
    hasAny(["רגוע", "צ'יל", "אווירה", "נעים"]) ? "low" :
    "mid";

  let heroIcon = "🎤";
  if (holiday === "hanukkah") heroIcon = "🕎";
  else if (holiday === "purim") heroIcon = "🎭";
  else if (holiday === "independence") heroIcon = "🇮🇱";
  else if (holiday === "newyear") heroIcon = "🎆";
  else if (holiday === "passover") heroIcon = "🍷";
  else if (holiday === "ramadan") heroIcon = "🌙";
  else if (vibe === "club") heroIcon = "✨";
  else if (vibe === "premium") heroIcon = "💎";
  else if (vibe === "hafla") heroIcon = "🔥";

  const holidayLabel =
    holiday === "hanukkah" ? "🕎 מסיבת חנוכה" :
    holiday === "purim" ? "🎭 מסיבת פורים" :
    holiday === "independence" ? "🇮🇱 חגיגות עצמאות" :
    holiday === "newyear" ? "🎆 ניו-יאר" :
    holiday === "passover" ? "🍷 פסח" :
    holiday === "ramadan" ? "🌙 רמדאן" :
    null;

  const limited = hasAny(["מקומות מוגבלים", "מוגבל", "הזמנה מראש", "מעט מקומות"]);
  const free = hasAny(["כניסה חינם", "חינם"]);
  const vip = hasAny(["vip", "שולחנות", "שמורים"]);
  const surprises = hasAny(["הפתעות", "הגרלה", "מתנות"]);

  return { holiday, holidayLabel, vibe, intensity, heroIcon, limited, free, vip, surprises };
}

function deriveDesignFromSignals(sig, moodFromAi) {
  const mood = moodFromAi || (
    sig.holiday ? "festive" :
    sig.vibe === "club" ? "club" :
    sig.vibe === "premium" ? "premium" :
    "hot"
  );

  let accent = "#FFD700"; // gold default
  if (mood === "club") accent = "#00CAFF";
  if (mood === "premium") accent = "#D6B36A";
  if (mood === "festive") accent = sig.holiday === "hanukkah" ? "#FFD700" : "#F472B6";
  if (mood === "hot") accent = "#FFA500";

  return {
    mood,
    accent,
    topTag: sig.vibe === "club" ? "🔥 מסיבת מועדון" : sig.vibe === "premium" ? "💎 ערב פרימיום" : "🎤 ערב קריוקי"
  };
}

function buildBadges(sig) {
  const out = [];
  if (sig.limited) out.push("מקומות מוגבלים");
  if (sig.free) out.push("כניסה חינם");
  if (sig.vip) out.push("VIP");
  if (sig.surprises) out.push("הפתעות");
  if (sig.vibe === "hafla") out.push("חפלה מזרחית");
  return out.slice(0, 4);
}

/* ============================ Styling ============================ */
const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
  padding: "20px",
  color: "#fff"
};

const panelStyle = {
  background: "rgba(15, 23, 42, 0.9)",
  borderRadius: "20px",
  padding: "26px",
  border: "2px solid rgba(0, 202, 255, 0.25)",
  boxShadow: "0 0 40px rgba(0, 202, 255, 0.18)",
  backdropFilter: "blur(10px)"
};

const backStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 20px",
  borderRadius: 12,
  background: "rgba(15, 23, 42, 0.9)",
  border: "2px solid rgba(16, 185, 129, 0.5)",
  boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
  color: "#10b981",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: "1rem"
};

const headerTitleStyle = {
  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
  fontWeight: 1000,
  background: "linear-gradient(135deg, #00caff, #0088ff)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  margin: 0
};

const textareaStyle = {
  width: "100%",
  minHeight: 190,
  padding: 16,
  borderRadius: 14,
  border: "1px solid rgba(148, 163, 184, 0.3)",
  background: "rgba(2, 6, 23, 0.7)",
  color: "#fff",
  fontSize: "1.05rem",
  lineHeight: 1.6,
  resize: "vertical",
  outline: "none",
  fontFamily: "inherit"
};

function buildBtnStyle(isAnalyzing, inputText) {
  return {
    marginTop: 18,
    padding: "16px 28px",
    borderRadius: 14,
    border: "none",
    background: isAnalyzing ? "rgba(100, 116, 139, 0.5)" : "linear-gradient(135deg, #00caff, #0088ff)",
    color: isAnalyzing ? "#64748b" : "#001a2e",
    fontSize: "1.1rem",
    fontWeight: 1000,
    cursor: isAnalyzing || !inputText.trim() ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    boxShadow: isAnalyzing ? "none" : "0 0 30px rgba(0, 202, 255, 0.35)"
  };
}

/* ============================ Bg fallback + color utils ============================ */
function fallbackBg(mood, accent) {
  if (mood === "club") {
    return `
      radial-gradient(circle at 50% 20%, ${rgba(accent, 0.22)}, transparent 55%),
      radial-gradient(circle at 10% 55%, rgba(124,58,237,.18), transparent 55%),
      radial-gradient(circle at 90% 55%, rgba(34,197,94,.10), transparent 55%),
      linear-gradient(135deg,#020617,#0b1220,#020617)
    `;
  }
  if (mood === "premium") {
    return `
      radial-gradient(circle at 50% 25%, ${rgba(accent, 0.18)}, transparent 58%),
      linear-gradient(135deg,#0b0b0d,#1a1410,#0b0b0d)
    `;
  }
  if (mood === "festive") {
    return `
      radial-gradient(circle at 50% 25%, ${rgba(accent, 0.20)}, transparent 58%),
      radial-gradient(circle at 20% 60%, rgba(255,215,0,.10), transparent 55%),
      linear-gradient(135deg,#2d0a1f,#3b0764,#2d0a1f)
    `;
  }
  return `
    radial-gradient(circle at 50% 25%, ${rgba(accent, 0.20)}, transparent 58%),
    linear-gradient(135deg,#1a0f0a,#2d1810,#0a0604)
  `;
}

function rgba(hex, a) {
  const h = (hex || "#FFD700").replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

EventProducerFinal.isPublic = true;