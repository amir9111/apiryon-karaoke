import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toPng } from "html-to-image";
import { Sparkles, Download, Share2, Loader2, Home, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EventProducerV2() {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [templateImage, setTemplateImage] = useState(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);

  const cardRef = useRef(null);

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
      const signals = deriveSignalsFromText(inputText);

      const prompt = `
אתה מומחה להפקת ליינים ועיצוב הזמנות למועדוני קריוקי בישראל.
המטרה: להחזיר גם טקסט שיווקי וגם "DNA עיצובי" (קונספט) כדי שהפלייר ירגיש כמו במה/אורות/חום/חג.

אם צורפה תמונת תבנית - תחקה את הסגנון הוויזואלי והטקסטואלי (אנרגיה/מילים/טון).

הטקסט:
"""
${inputText}
"""

אותות שחולצו מהטקסט (Signals):
${JSON.stringify(signals, null, 2)}

כללי איכות:
- כותרת קצרה, חזקה, מושכת עין.
- תת-כותרת משלימה שנותנת "סיבה לבוא".
- 3-5 Highlights קצרים, חדים.
- CTA קצר, פוקד, עם FOMO קל.
- אם יש חג (חנוכה/פורים/עצמאות/וכו') תן לזה עדיפות.
החזר JSON בלבד.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        ...(templateImage && { file_urls: [templateImage] }),
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            description: { type: "string" },
            highlights: { type: "array", items: { type: "string" } },
            callToAction: { type: "string" },
            date: { type: "string" },
            time: { type: "string" },
            location: { type: "string" },
            contact: { type: "string" },
            design: {
              type: "object",
              properties: {
                mood: { type: "string", enum: ["hot_stage", "dark_club", "premium", "festive"] },
                accentColor: { type: "string" },
                effects: {
                  type: "array",
                  items: { type: "string", enum: ["stage_lights", "glow", "smoke", "sparks", "bokeh"] }
                }
              },
              required: ["mood", "accentColor", "effects"]
            },
            elements: { type: "array", items: { type: "string" } }
          },
          required: ["title", "subtitle", "description", "callToAction", "design"]
        }
      });

      const finalDesign = mergeDesign(result.design, signals.rulesDesign);
      const finalElements = Array.from(new Set([...(signals.elements || []), ...((result.elements || []) ? result.elements : [])]));

      const final = {
        ...result,
        design: finalDesign,
        elements: finalElements,
        signals
      };

      setInvitation(final);
    } catch (error) {
      console.error(error);
      alert("אירעה שגיאה בניתוח הטקסט. נסה שוב.");
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
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצוא התמונה");
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
    } catch (error) {
      await exportPng(1080, 1350, "apiryon-invitation.png");
    }
  };

  const moodTheme = invitation?.design?.mood || "hot_stage";
  const accent = invitation?.design?.accentColor || "#FFA500";
  const effects = invitation?.design?.effects || ["stage_lights", "glow"];
  const theme = getTheme(moodTheme, accent);

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      padding: "20px",
      color: "#fff"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

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
              יוצר הזמנות V3 (Hero Layer)
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem" }}>
            עכשיו נוסף אלמנט מרכזי ענק שמגביר "וואו" לפי הטקסט 🎭
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
                  <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#a78bfa", marginBottom: 6 }}>
                    🎨 העלה תבנית להשראה (אופציונלי)
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                    ה-AI ילמד גם סגנון וגם קונספט
                  </div>
                </div>

                <label style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: templateImage
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: isUploadingTemplate ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)"
                }}>
                  {isUploadingTemplate ? (
                    <>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                      <span>מעלה...</span>
                    </>
                  ) : templateImage ? (
                    <span>✓ תבנית הועלתה</span>
                  ) : (
                    <span>📤 העלה תמונה</span>
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
                <div style={{ marginTop: 15, display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={templateImage}
                    alt="תבנית"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "2px solid rgba(139, 92, 246, 0.5)"
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#10b981", fontWeight: 800, fontSize: "0.95rem" }}>
                      ✓ התבנית נטענה בהצלחה
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      חוקים + Hero יקבעו וואו
                    </div>
                  </div>
                  <button
                    onClick={() => setTemplateImage(null)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: 700
                    }}
                  >
                    הסר
                  </button>
                </div>
              )}
            </div>

            <label style={{ display: "block", fontSize: "1.15rem", fontWeight: 900, color: "#00caff", marginBottom: 12 }}>
              📝 הזן פרטי אירוע (טקסט חופשי)
            </label>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`לדוגמה:
מסיבת חנוכה באפריון!
חמישי הקרוב בשעה 21:00
DJ LIVE • ריקודים • קריוקי
מקומות מוגבלים - הזמנה מראש
להזמנות: 050-1234567`}
              style={{
                width: "100%",
                minHeight: 200,
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
              }}
            />

            <button
              onClick={analyzeAndBuild}
              disabled={isAnalyzing || !inputText.trim()}
              style={{
                marginTop: 20,
                padding: "16px 32px",
                borderRadius: 14,
                border: "none",
                background: isAnalyzing ? "rgba(100, 116, 139, 0.5)" : "linear-gradient(135deg, #00caff, #0088ff)",
                color: isAnalyzing ? "#64748b" : "#001a2e",
                fontSize: "1.1rem",
                fontWeight: 900,
                cursor: isAnalyzing || !inputText.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                justifyContent: "center",
                boxShadow: isAnalyzing ? "none" : "0 0 30px rgba(0, 202, 255, 0.4)"
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                  <span>AI מנתח ובונה...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>🎨 בנה לי הזמנה (V3)</span>
                </>
              )}
            </button>

            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}

        {invitation && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => exportPng(1080, 1350, "apiryon-invitation.png")} disabled={isExporting} style={btnStyle("green")}>
                <Download size={18} /> הורד תמונה (1080×1350)
              </button>

              <button onClick={() => exportPng(1080, 1920, "apiryon-story.png")} disabled={isExporting} style={btnStyle("purple")}>
                <Download size={18} /> הורד סטורי (1080×1920)
              </button>

              <button onClick={shareImage} style={btnStyle("cyanOutline")}>
                <Share2 size={18} /> שתף
              </button>

              <button onClick={() => { setInvitation(null); setInputText(""); }} style={btnStyle("redOutline")}>
                ✕ התחל מחדש
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(15, 23, 42, 0.7)",
                border: `1px solid ${hexToRgba(accent, 0.5)}`,
                color: "#e2e8f0",
                fontWeight: 900
              }}>
                <Palette size={18} />
                <span>DNA: {invitation.design.mood} • Accent: {accent}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                ref={cardRef}
                style={{
                  width: "min(1080px, 100%)",
                  aspectRatio: "1080 / 1350",
                  position: "relative",
                  borderRadius: 24,
                  overflow: "hidden",
                  background: theme.baseBg,
                  border: `3px solid ${hexToRgba(accent, 0.35)}`,
                  boxShadow: theme.outerShadow
                }}
              >
                {/* FX */}
                {effects.includes("stage_lights") && <StageLights accent={accent} mood={moodTheme} />}
                {effects.includes("glow") && <Glow accent={accent} />}
                {effects.includes("bokeh") && <Bokeh accent={accent} />}
                {effects.includes("sparks") && <Sparks accent={accent} />}
                {effects.includes("smoke") && <Smoke />}

                {/* ✅ NEW: Hero Layer */}
                <HeroLayer signals={invitation.signals} accent={accent} mood={moodTheme} />

                {/* Overlay elements */}
                <OverlayElements elements={invitation.elements || []} accent={accent} />

                <div style={{
                  position: "relative",
                  height: "100%",
                  padding: "clamp(30px, 5%, 60px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <div style={topBrandStyle(accent)}>
                      🎤 APIRYON CLUB 🎤
                    </div>

                    <h1 style={titleStyle(accent)}>
                      {invitation.title}
                    </h1>

                    <div style={subtitleStyle(accent)}>
                      {invitation.subtitle}
                    </div>
                  </div>

                  <div style={infoCardStyle(accent)}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 15,
                      marginBottom: 22
                    }}>
                      {invitation.date && <InfoPill icon="📅" label="תאריך" value={invitation.date} accent={accent} />}
                      {invitation.time && <InfoPill icon="⏰" label="שעה" value={invitation.time} accent={accent} />}
                      {invitation.location && <InfoPill icon="📍" label="מיקום" value={invitation.location} accent={accent} />}
                    </div>

                    <div style={{
                      fontSize: "clamp(1rem, 1.8vw, 1.3rem)",
                      color: "#e2e8f0",
                      lineHeight: 1.6,
                      marginBottom: 18,
                      textAlign: "center",
                      fontWeight: 650
                    }}>
                      {invitation.description}
                    </div>

                    {invitation.highlights?.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                        {invitation.highlights.slice(0, 5).map((h, i) => (
                          <div key={i} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
                            color: "#cbd5e1",
                            fontWeight: 900
                          }}>
                            <span style={{ color: accent, fontSize: "1.2em" }}>✓</span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {invitation.contact && (
                      <div style={{
                        fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                        color: "#fbbf24",
                        fontWeight: 950,
                        textAlign: "center",
                        marginBottom: 14
                      }}>
                        📞 {invitation.contact}
                      </div>
                    )}

                    <div style={ctaStyle(accent)}>
                      {invitation.callToAction}
                    </div>
                  </div>

                  <div style={{
                    fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
                    color: "#94a3b8",
                    textAlign: "center",
                    fontWeight: 800,
                    marginTop: 18
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

/* ------------------ HERO LAYER ------------------ */
function HeroLayer({ signals, accent, mood }) {
  const holiday = signals?.holiday || null;
  const vibe = signals?.vibe || "karaoke";
  const intensity = signals?.intensity || "mid";

  // Choose hero type
  let hero = "mic";
  if (holiday === "hanukkah") hero = "hanukkah";
  else if (holiday) hero = "holiday";
  else if (vibe === "club") hero = "laser";
  else if (vibe === "premium") hero = "premium";
  else if (vibe === "hafla") hero = "stars";
  else hero = "mic";

  // Big watermark in center (behind text)
  const base = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 2
  };

  // Stronger visibility if high intensity
  const alpha = intensity === "high" ? 0.22 : intensity === "low" ? 0.12 : 0.18;

  return (
    <div style={base}>
      {hero === "hanukkah" && <HeroHanukkah accent={accent} alpha={alpha} />}
      {hero === "holiday" && <HeroHoliday accent={accent} alpha={alpha} holiday={holiday} />}
      {hero === "laser" && <HeroLaser accent={accent} alpha={alpha} mood={mood} />}
      {hero === "premium" && <HeroPremium accent={accent} alpha={alpha} />}
      {hero === "stars" && <HeroStars accent={accent} alpha={alpha} />}
      {hero === "mic" && <HeroMic accent={accent} alpha={alpha} />}
    </div>
  );
}

function HeroMic({ accent, alpha }) {
  return (
    <>
      <div style={{
        position: "absolute",
        left: "50%",
        top: "42%",
        transform: "translate(-50%, -50%) rotate(-18deg)",
        fontSize: "min(420px, 34vw)",
        opacity: alpha,
        filter: `drop-shadow(0 0 50px ${hexToRgba(accent, 0.35)})`
      }}>
        🎤
      </div>
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 50% 40%, ${hexToRgba(accent, 0.14)}, transparent 58%)`
      }} />
    </>
  );
}

function HeroHanukkah({ accent, alpha }) {
  return (
    <>
      <div style={{
        position: "absolute",
        left: "50%",
        top: "40%",
        transform: "translate(-50%, -50%)",
        fontSize: "min(420px, 34vw)",
        opacity: alpha,
        filter: `drop-shadow(0 0 60px ${hexToRgba("#FFD700", 0.45)})`
      }}>
        🕎
      </div>
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at 50% 38%, ${hexToRgba("#FFD700", 0.14)}, transparent 60%),
          radial-gradient(circle at 40% 30%, ${hexToRgba(accent, 0.10)}, transparent 55%)
        `
      }} />
    </>
  );
}

function HeroHoliday({ accent, alpha, holiday }) {
  const map = {
    purim: "🎭",
    independence: "🇮🇱",
    newyear: "🎆",
    passover: "🍷",
    ramadan: "🌙"
  };
  const icon = map[holiday] || "✨";
  return (
    <>
      <div style={{
        position: "absolute",
        left: "50%",
        top: "40%",
        transform: "translate(-50%, -50%)",
        fontSize: "min(420px, 34vw)",
        opacity: alpha,
        filter: `drop-shadow(0 0 55px ${hexToRgba(accent, 0.35)})`
      }}>
        {icon}
      </div>
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 50% 40%, ${hexToRgba(accent, 0.12)}, transparent 62%)`
      }} />
    </>
  );
}

function HeroLaser({ accent, alpha, mood }) {
  const a = Math.min(0.26, alpha + 0.06);
  return (
    <>
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: a,
        background: `
          linear-gradient(115deg, transparent 0%, ${hexToRgba(accent, 0.22)} 35%, transparent 70%),
          linear-gradient(65deg, transparent 0%, ${hexToRgba("#7C3AED", 0.18)} 40%, transparent 75%),
          linear-gradient(145deg, transparent 0%, ${hexToRgba("#22C55E", 0.12)} 35%, transparent 70%)
        `,
        filter: "blur(0.2px)"
      }} />
      <div style={{
        position: "absolute",
        left: "50%",
        top: "44%",
        transform: "translate(-50%, -50%) rotate(-12deg)",
        width: "min(780px, 70vw)",
        height: "min(520px, 52vw)",
        borderRadius: 999,
        border: `2px solid ${hexToRgba(accent, 0.25)}`,
        boxShadow: `0 0 80px ${hexToRgba(accent, 0.22)}`
      }} />
    </>
  );
}

function HeroPremium({ accent, alpha }) {
  return (
    <>
      <div style={{
        position: "absolute",
        left: "50%",
        top: "40%",
        transform: "translate(-50%, -50%)",
        width: "min(780px, 72vw)",
        height: "min(520px, 48vw)",
        borderRadius: 36,
        opacity: alpha,
        background: `linear-gradient(135deg, ${hexToRgba(accent, 0.22)}, rgba(0,0,0,0))`,
        border: `1px solid ${hexToRgba(accent, 0.28)}`,
        boxShadow: `0 0 90px ${hexToRgba(accent, 0.20)}`
      }} />
      <div style={{
        position: "absolute",
        left: "50%",
        top: "40%",
        transform: "translate(-50%, -50%)",
        fontSize: "min(360px, 30vw)",
        opacity: alpha * 0.85
      }}>
        ✨
      </div>
    </>
  );
}

function HeroStars({ accent, alpha }) {
  return (
    <>
      <div style={{
        position: "absolute",
        left: "50%",
        top: "40%",
        transform: "translate(-50%, -50%) rotate(-8deg)",
        fontSize: "min(420px, 34vw)",
        opacity: alpha
      }}>
        ✨
      </div>
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at 35% 35%, ${hexToRgba(accent, 0.10)}, transparent 52%),
          radial-gradient(circle at 65% 45%, ${hexToRgba("#FFD700", 0.10)}, transparent 55%)
        `
      }} />
    </>
  );
}

/* ------------------ Buttons ------------------ */
function btnStyle(type) {
  const base = {
    padding: "14px 24px",
    borderRadius: 12,
    border: "none",
    fontSize: "1rem",
    fontWeight: 900,
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

/* ------------------ Theme ------------------ */
function getTheme(mood, accent) {
  if (mood === "dark_club") {
    return {
      baseBg: "linear-gradient(135deg,#020617 0%, #0b1220 55%, #020617 100%)",
      outerShadow: `0 0 60px ${hexToRgba(accent, 0.22)}, 0 0 120px rgba(0,0,0,.55)`
    };
  }
  if (mood === "premium") {
    return {
      baseBg: "linear-gradient(135deg,#0b0b0d 0%, #1a1410 50%, #0b0b0d 100%)",
      outerShadow: `0 0 60px ${hexToRgba(accent, 0.22)}, 0 0 120px rgba(0,0,0,.55)`
    };
  }
  if (mood === "festive") {
    return {
      baseBg: "linear-gradient(135deg,#2d0a1f 0%, #3b0764 35%, #2d0a1f 100%)",
      outerShadow: `0 0 70px ${hexToRgba(accent, 0.28)}, 0 0 120px rgba(0,0,0,.55)`
    };
  }
  return {
    baseBg: "linear-gradient(135deg,#1a0f0a 0%, #2d1810 40%, #0a0604 100%)",
    outerShadow: `0 0 70px ${hexToRgba(accent, 0.28)}, 0 0 130px rgba(0,0,0,.6)`
  };
}

/* ------------------ Typography ------------------ */
function topBrandStyle(accent) {
  return {
    fontSize: "clamp(.9rem, 1.8vw, 1.2rem)",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: ".15em",
    textAlign: "center",
    marginBottom: "clamp(12px, 2.5%, 28px)",
    background: `linear-gradient(180deg, #ffffff 0%, ${accent} 60%, #000 130%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    filter: `drop-shadow(0 0 18px ${hexToRgba(accent, .55)})`
  };
}

function titleStyle(accent) {
  return {
    fontSize: "clamp(2rem, 5vw, 3.8rem)",
    fontWeight: 950,
    textAlign: "center",
    marginBottom: "clamp(12px, 2%, 22px)",
    lineHeight: 1.08,
    letterSpacing: "-0.02em",
    background: `linear-gradient(180deg, #FFFFFF 0%, ${accent} 55%, #ffd700 120%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    filter: `drop-shadow(0 6px 18px rgba(0,0,0,.9))`
  };
}

function subtitleStyle(accent) {
  return {
    fontSize: "clamp(1.3rem, 2.8vw, 2.3rem)",
    fontWeight: 950,
    color: "#fff",
    textAlign: "center",
    marginBottom: "clamp(26px, 4%, 48px)",
    textShadow: `0 0 18px ${hexToRgba(accent, .5)}, 0 3px 14px rgba(0,0,0,.9)`
  };
}

function infoCardStyle(accent) {
  return {
    background: "rgba(10, 6, 4, 0.85)",
    borderRadius: 20,
    padding: "clamp(20px, 3%, 35px)",
    border: `2px solid ${hexToRgba(accent, 0.38)}`,
    backdropFilter: "blur(12px)",
    boxShadow: `0 0 40px ${hexToRgba(accent, 0.22)}, inset 0 0 30px ${hexToRgba(accent, 0.06)}`
  };
}

function ctaStyle(accent) {
  return {
    background: `linear-gradient(135deg, ${accent}, #FFD700)`,
    padding: "clamp(14px, 2.5%, 20px) clamp(20px, 3%, 30px)",
    borderRadius: 15,
    textAlign: "center",
    fontSize: "clamp(1.15rem, 2.2vw, 1.7rem)",
    fontWeight: 950,
    color: "#000",
    boxShadow: `0 0 30px ${hexToRgba(accent, 0.55)}, 0 4px 15px rgba(0,0,0,.55)`
  };
}

/* ------------------ Info pill ------------------ */
function InfoPill({ icon, label, value, accent }) {
  return (
    <div style={{
      background: hexToRgba(accent, 0.14),
      border: `2px solid ${hexToRgba(accent, 0.38)}`,
      borderRadius: 14,
      padding: "14px 12px",
      textAlign: "center",
      boxShadow: `0 0 15px ${hexToRgba(accent, 0.2)}`
    }}>
      <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{icon}</div>
      <div style={{
        fontSize: "0.7rem",
        color: accent,
        fontWeight: 950,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: ".08em",
        textShadow: `0 0 10px ${hexToRgba(accent, 0.35)}`
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "1.05rem",
        color: "#fff",
        fontWeight: 950,
        textShadow: `0 0 10px ${hexToRgba(accent, 0.35)}`
      }}>
        {value}
      </div>
    </div>
  );
}

/* ------------------ FX ------------------ */
function StageLights({ accent, mood }) {
  const top = mood === "dark_club" ? 0.45 : 0.35;
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: `
        radial-gradient(ellipse at 50% 0%, ${hexToRgba(accent, top)}, transparent 40%),
        radial-gradient(ellipse at 0% 50%, ${hexToRgba(accent, 0.20)}, transparent 55%),
        radial-gradient(ellipse at 100% 50%, ${hexToRgba(accent, 0.20)}, transparent 55%),
        radial-gradient(ellipse at 50% 100%, rgba(139, 92, 246, 0.14), transparent 55%)
      `,
      opacity: 0.85
    }} />
  );
}

function Glow({ accent }) {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(circle at 50% 35%, ${hexToRgba(accent, 0.18)}, transparent 55%)`,
      filter: "blur(2px)"
    }} />
  );
}

function Bokeh({ accent }) {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: `
        radial-gradient(circle at 20% 25%, ${hexToRgba(accent, .16)}, transparent 12%),
        radial-gradient(circle at 78% 22%, rgba(255,255,255,.10), transparent 14%),
        radial-gradient(circle at 30% 72%, rgba(255,215,0,.10), transparent 15%),
        radial-gradient(circle at 84% 68%, ${hexToRgba(accent, .12)}, transparent 15%)
      `,
      opacity: 0.9
    }} />
  );
}

function Sparks({ accent }) {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: `
        radial-gradient(circle at 35% 28%, rgba(255,255,255,.20), transparent 6%),
        radial-gradient(circle at 60% 24%, ${hexToRgba(accent,.22)}, transparent 6%),
        radial-gradient(circle at 52% 58%, rgba(255,215,0,.16), transparent 6%),
        radial-gradient(circle at 18% 62%, ${hexToRgba(accent,.18)}, transparent 6%),
        radial-gradient(circle at 80% 56%, rgba(255,255,255,.12), transparent 7%)
      `,
      opacity: 0.9
    }} />
  );
}

function Smoke() {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: `
        radial-gradient(ellipse at 30% 60%, rgba(255,255,255,.05), transparent 50%),
        radial-gradient(ellipse at 70% 55%, rgba(255,255,255,.04), transparent 55%),
        radial-gradient(ellipse at 50% 85%, rgba(255,255,255,.03), transparent 50%)
      `,
      filter: "blur(10px)",
      opacity: 0.8
    }} />
  );
}

/* ------------------ Overlay Elements ------------------ */
function OverlayElements({ elements, accent }) {
  const has = (x) => elements.includes(x);
  const holiday = elements.find((e) => e.startsWith("holiday:"))?.split(":")[1];

  return (
    <>
      {holiday && (
        <div style={{
          position: "absolute",
          top: 26,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 16px",
          borderRadius: 999,
          background: "rgba(0,0,0,.45)",
          border: `1px solid ${hexToRgba(accent, .55)}`,
          color: "#fff",
          fontWeight: 950,
          letterSpacing: ".04em",
          textShadow: `0 0 12px ${hexToRgba(accent, .5)}`
        }}>
          {holiday === "hanukkah" ? "🕎 מסיבת חנוכה" :
           holiday === "purim" ? "🎭 מסיבת פורים" :
           holiday === "independence" ? "🇮🇱 חגיגות עצמאות" :
           holiday === "newyear" ? "🎆 ניו-יאר" :
           holiday === "passover" ? "🍷 פסח" :
           holiday === "ramadan" ? "🌙 רמדאן" :
           "✨ חגיגות"}
        </div>
      )}

      <CornerBadge show={has("badge:limited")} text="מקומות מוגבלים" accent={accent} pos="right" />
      <CornerBadge show={has("badge:free")} text="כניסה חינם" accent={accent} pos="left" />
      <CornerBadge show={has("badge:vip")} text="VIP" accent={accent} pos="right2" />
      <CornerBadge show={has("badge:surprises")} text="הפתעות!" accent={accent} pos="left2" />

      <div style={{
        position: "absolute",
        bottom: 26,
        left: 26,
        display: "flex",
        gap: 10,
        opacity: 0.95
      }}>
        {has("icon:mic") && <IconChip label="🎤 קריוקי" accent={accent} />}
        {has("icon:dj") && <IconChip label="🎧 DJ" accent={accent} />}
        {has("icon:dance") && <IconChip label="💃 ריקודים" accent={accent} />}
      </div>
    </>
  );
}

function CornerBadge({ show, text, accent, pos }) {
  if (!show) return null;
  const map = {
    right: { top: 90, right: 24 },
    left: { top: 90, left: 24 },
    right2: { top: 150, right: 24 },
    left2: { top: 150, left: 24 }
  };
  return (
    <div style={{
      position: "absolute",
      ...map[pos],
      padding: "10px 14px",
      borderRadius: 14,
      background: `linear-gradient(135deg, ${hexToRgba(accent, .25)}, rgba(0,0,0,.55))`,
      border: `1px solid ${hexToRgba(accent, .55)}`,
      color: "#fff",
      fontWeight: 950,
      boxShadow: `0 0 22px ${hexToRgba(accent, .25)}`,
      textShadow: "0 2px 10px rgba(0,0,0,.8)"
    }}>
      {text}
    </div>
  );
}

function IconChip({ label, accent }) {
  return (
    <div style={{
      padding: "10px 12px",
      borderRadius: 999,
      background: "rgba(0,0,0,.5)",
      border: `1px solid ${hexToRgba(accent, .5)}`,
      color: "#fff",
      fontWeight: 950,
      fontSize: 14
    }}>
      {label}
    </div>
  );
}

/* ------------------ RULES ENGINE ------------------ */
function deriveSignalsFromText(raw) {
  const t = (raw || "").toLowerCase();
  const hasAny = (arr) => arr.some((w) => t.includes(w));

  const holiday =
    hasAny(["חנוכה", "חנוכיה", "סופגניה"]) ? "hanukkah" :
    hasAny(["פורים", "מגילה", "תחפושות"]) ? "purim" :
    hasAny(["עצמאות", "דגל", "יום העצמאות"]) ? "independence" :
    hasAny(["שנה חדשה", "סילבסטר", "new year"]) ? "newyear" :
    hasAny(["פסח", "מצה"]) ? "passover" :
    hasAny(["רמדאן", "איפטאר"]) ? "ramadan" :
    null;

  const vibe =
    hasAny(["חפלה", "מזרחית", "דאבקה", "דרבוקות", "להיטים", "קצב"]) ? "hafla" :
    hasAny(["techno", "טכנו", "house", "האוס", "סט", "רייב"]) ? "club" :
    hasAny(["vip", "פרימיום", "יוקרתי", "שולחן", "בוטיק"]) ? "premium" :
    "karaoke";

  const intensity =
    hasAny(["מטורף", "שריפה", "פצצה", "מפוצץ", "היסטרי", "טירוף", "🔥"]) ? "high" :
    hasAny(["רגוע", "צ'יל", "אווירה", "נעים"]) ? "low" :
    "mid";

  const timeOfDay =
    hasAny(["22", "23", "00", "לילה", "אחרי חצות"]) ? "late" :
    hasAny(["20", "21", "ערב"]) ? "evening" :
    hasAny(["צהריים", "בוקר"]) ? "day" :
    "unknown";

  const elements = [];
  if (holiday) elements.push(`holiday:${holiday}`);
  if (hasAny(["dj", "די.ג'יי", "דיג'יי"])) elements.push("icon:dj");
  if (hasAny(["ריקודים", "רוקדים", "dance", "💃"])) elements.push("icon:dance");
  if (hasAny(["קריוקי", "מיקרופון", "🎤"])) elements.push("icon:mic");
  if (hasAny(["הפתעות", "מתנות", "הגרלה"])) elements.push("badge:surprises");
  if (hasAny(["כניסה חינם", "חינם"])) elements.push("badge:free");
  if (hasAny(["vip", "שולחנות", "שמורים"])) elements.push("badge:vip");
  if (hasAny(["הזמנה מראש", "מספר מקומות", "מוגבל", "מעט מקומות"])) elements.push("badge:limited");

  let mood = "hot_stage";
  if (vibe === "premium") mood = "premium";
  if (vibe === "club") mood = "dark_club";
  if (holiday) mood = "festive";
  if (intensity === "low") mood = "premium";
  if (timeOfDay === "late") mood = "dark_club";

  let accentColor = "#FFA500";
  if (mood === "dark_club") accentColor = "#00CAFF";
  if (mood === "premium") accentColor = "#D6B36A";
  if (mood === "festive") accentColor = holiday === "hanukkah" ? "#FFD700" : "#F472B6";

  const effects = [];
  if (mood === "hot_stage") effects.push("stage_lights", "glow", "sparks");
  if (mood === "dark_club") effects.push("stage_lights", "bokeh", "glow");
  if (mood === "premium") effects.push("glow", "smoke");
  if (mood === "festive") effects.push("stage_lights", "glow", "bokeh", "sparks");

  return { holiday, vibe, intensity, timeOfDay, elements, rulesDesign: { mood, accentColor, effects } };
}

function mergeDesign(aiDesign, rulesDesign) {
  const out = { ...(aiDesign || {}) };
  const isHex = (x) => typeof x === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(x.trim());

  if (rulesDesign?.mood) out.mood = rulesDesign.mood;
  if (!isHex(out.accentColor) && rulesDesign?.accentColor) out.accentColor = rulesDesign.accentColor;
  if (!Array.isArray(out.effects) || out.effects.length === 0) out.effects = rulesDesign?.effects || ["stage_lights", "glow"];

  return out;
}

/* ------------------ Utils ------------------ */
function hexToRgba(hex, a) {
  try {
    const h = (hex || "#FFA500").replace("#", "").trim();
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } catch {
    return `rgba(255,165,0,${a})`;
  }
}

EventProducerV2.isPublic = true;