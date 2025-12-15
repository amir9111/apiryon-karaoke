import React from "react";
import { toPng } from "html-to-image";
import { Sparkles, Download, Share2, Music2, MapPin, Clock, CalendarDays } from "lucide-react";

export default function ProInviteGenerator() {
  const [text, setText] = React.useState(
`🔥 חמישי באפריון 🔥
🎤 ערב קריוקי מטורף!
📅 18/12/2025
⏰ 21:00
📍 מועדון האפריון, טבריה
🎶 DJ LIVE | מזרחית | להיטים
📲 להזמנות: 050-0000000
✨ בואו לשיר, לרקוד ולעשות שמח!`
  );

  // שדות "בטיחות" — אם האוטו-זיהוי לא תופס, עדיין יצא מקצועי
  const [manualDate, setManualDate] = React.useState("");
  const [manualTime, setManualTime] = React.useState("");
  const [manualLocation, setManualLocation] = React.useState("");

  const [isExporting, setIsExporting] = React.useState(false);
  const cardRef = React.useRef(null);
  const contentRef = React.useRef(null);

  // ===== חילוץ אוטומטי (מכסה 90% מהמקרים) =====
  const extractMeta = React.useCallback((t) => {
    const lines = (t || "").split("\n").map(s => s.trim()).filter(Boolean);

    // זמן: 21:00 / 9:30 / 21.00
    const timeMatch = t.match(/(?:^|\s)([01]?\d|2[0-3])[:.][0-5]\d(?:\s)?/);
    const time = timeMatch ? timeMatch[0].trim() : "";

    // תאריך: 18/12/2025 או 18-12-2025 או 18.12.2025 או 18/12
    const dateMatch = t.match(/(?:^|\s)(\d{1,2}[\/\-.]\d{1,2}(?:[\/\-.]\d{2,4})?)(?:\s|$)/);
    const date = dateMatch ? dateMatch[1].trim() : "";

    // מיקום: שורה שמתחילה ב-📍 / "מיקום:" / "ב-" / "במועדון"
    let location = "";
    const locLine =
      lines.find(l => l.startsWith("📍")) ||
      lines.find(l => /^מיקום[:：]/.test(l)) ||
      lines.find(l => /^במועדון/.test(l)) ||
      lines.find(l => /^ב-/.test(l));

    if (locLine) {
      location = locLine.replace(/^📍\s?/, "").replace(/^מיקום[:：]\s?/, "").replace(/^ב-\s?/, "").trim();
    }

    return { date, time, location };
  }, []);

  const metaAuto = React.useMemo(() => extractMeta(text), [text, extractMeta]);
  const date = (manualDate || metaAuto.date || "").trim();
  const time = (manualTime || metaAuto.time || "").trim();
  const location = (manualLocation || metaAuto.location || "").trim();

  // ===== Auto-fit לטקסט כדי שלא ייחתך =====
  const fitText = React.useCallback(() => {
    const box = contentRef.current;
    if (!box) return;

    const min = 16;
    const max = 54;

    let low = min;
    let high = max;
    let best = min;

    const fits = (fontSize) => {
      box.style.fontSize = `${fontSize}px`;
      // reflow
      // eslint-disable-next-line no-unused-expressions
      box.offsetHeight;
      return box.scrollHeight <= box.clientHeight && box.scrollWidth <= box.clientWidth;
    };

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (fits(mid)) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    box.style.fontSize = `${best}px`;
  }, []);

  React.useEffect(() => { fitText(); }, [text, date, time, location, fitText]);
  React.useEffect(() => {
    const onResize = () => fitText();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fitText]);

  const exportPng = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "apiryon-invite.png";
      a.click();
    } catch (e) {
      console.error(e);
      alert("לא הצלחתי להפיק תמונה. אם אתה בתוך וואטסאפ/דפדפן מוזר — פתח בכרום רגיל ונסה שוב.");
    } finally {
      setIsExporting(false);
    }
  };

  const shareImage = async () => {
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "apiryon-invite.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "הזמנה - האפריון", files: [file] });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "apiryon-invite.png";
        a.click();
      }
    } catch (e) {
      console.error(e);
      alert("שיתוף לא נתמך כאן. הורדתי במקום.");
    }
  };

  const missing = [
    !date ? "תאריך" : null,
    !time ? "שעה" : null,
    !location ? "מיקום" : null
  ].filter(Boolean);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", padding: "8px", background: "linear-gradient(135deg,#020617,#0a1929,#020617)", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 14 }}>
        {/* Controls */}
        <div style={{ background: "rgba(15,23,42,0.88)", border: "1px solid rgba(0,202,255,0.25)", borderRadius: 18, padding: 16, backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Sparkles size={18} style={{ color: "#00caff" }} />
            <div style={{ fontWeight: 950, fontSize: 18, color: "#00caff" }}>הפק לי הזמנה • פרימיום</div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="כתוב כאן טקסט חופשי… (עדיף לכלול 📅 תאריך | ⏰ שעה | 📍 מיקום)"
            style={{
              width: "100%",
              minHeight: 150,
              resize: "vertical",
              borderRadius: 14,
              padding: 14,
              border: "1px solid rgba(148,163,184,0.25)",
              outline: "none",
              background: "rgba(2,6,23,0.65)",
              color: "#fff",
              fontSize: 16,
              lineHeight: 1.6,
            }}
          />

          {/* Safety fields */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 10 }}>
            <input
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              placeholder={`תאריך (זוהה: ${metaAuto.date || "—"})`}
              style={inputStyle()}
            />
            <input
              value={manualTime}
              onChange={(e) => setManualTime(e.target.value)}
              placeholder={`שעה (זוהה: ${metaAuto.time || "—"})`}
              style={inputStyle()}
            />
            <input
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder={`מיקום (זוהה: ${metaAuto.location || "—"})`}
              style={inputStyle()}
            />
          </div>

          {missing.length > 0 && (
            <div style={{ marginTop: 10, color: "#fbbf24", fontWeight: 900 }}>
              חסר עדיין: {missing.join(" • ")} — מומלץ למלא כדי שלא ייצא הזמנה בלי פרטים.
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={exportPng} disabled={isExporting} style={primaryBtn(isExporting)}>
              <Download size={18} /> {isExporting ? "מפיק..." : "הורד PNG (חד)"}
            </button>
            <button onClick={shareImage} style={secondaryBtn()}>
              <Share2 size={18} /> שתף
            </button>
            <div style={{ opacity: 0.75, fontSize: 13, alignSelf: "center" }}>
              הטקסט נכנס אוטומטית (Auto-fit) — אין חיתוכים.
            </div>
          </div>
        </div>

        {/* Poster Preview (1080x1350 - פורמט סטורי/פוסט) */}
        <div style={{ display: "flex", justifyContent: "center", overflow: "auto" }}>
          <div
            ref={cardRef}
            style={{
              width: "min(1080px, 100vw - 16px)",
              aspectRatio: "1080 / 1350",
              maxWidth: "100%",
              borderRadius: "clamp(20px, 4vw, 44px)",
              position: "relative",
              overflow: "hidden",
              background:
                "radial-gradient(900px 900px at 20% 20%, rgba(0,202,255,0.38), transparent 60%)," +
                "radial-gradient(1000px 1000px at 85% 25%, rgba(139,92,246,0.30), transparent 62%)," +
                "radial-gradient(900px 900px at 55% 92%, rgba(34,197,94,0.16), transparent 55%)," +
                "linear-gradient(135deg, #020617 0%, #071c2f 45%, #020617 100%)",
              border: "2px solid rgba(0,202,255,0.22)",
              boxShadow: "0 50px 140px rgba(0,0,0,0.68)",
            }}
          >
            {/* Background photo layer */}
            <div style={{ position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=60') center/cover", opacity: 0.22 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,6,23,0.10), rgba(2,6,23,0.88))" }} />

            {/* Top Brand */}
            <div style={{ position: "absolute", top: "2.5%", left: "3%", right: "3%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1vw, 12px)", padding: "clamp(8px, 1vw, 12px) clamp(10px, 1.5vw, 16px)", borderRadius: "clamp(12px, 1.5vw, 18px)", background: "rgba(0,202,255,0.10)", border: "1px solid rgba(0,202,255,0.22)", backdropFilter: "blur(10px)" }}>
                <Music2 size={18} style={{ color: "#00caff" }} />
                <div style={{ fontWeight: 950, letterSpacing: "0.12em", fontSize: "clamp(12px, 1.5vw, 16px)" }}>APIRYON</div>
              </div>

              <div style={{ padding: "clamp(8px, 1vw, 12px) clamp(10px, 1.5vw, 16px)", borderRadius: "clamp(12px, 1.5vw, 18px)", background: "rgba(15,23,42,0.60)", border: "1px solid rgba(148,163,184,0.18)", backdropFilter: "blur(10px)", fontWeight: 900, color: "#00caff", fontSize: "clamp(11px, 1.4vw, 15px)" }}>
                ✨ הזמנה רשמית ✨
              </div>
            </div>

            {/* Meta bar (תאריך/שעה/מיקום) */}
            <div style={{ position: "absolute", top: "8%", left: "3%", right: "3%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 100px), 1fr))", gap: "clamp(6px, 1vw, 12px)" }}>
              <MetaPill icon={<CalendarDays size={18} />} label="תאריך" value={date || "—"} />
              <MetaPill icon={<Clock size={18} />} label="שעה" value={time || "—"} />
              <MetaPill icon={<MapPin size={18} />} label="מיקום" value={location || "—"} />
            </div>

            {/* Main poster block */}
            <div
              style={{
                position: "absolute",
                left: "3.5%",
                right: "3.5%",
                top: "14%",
                bottom: "10%",
                borderRadius: "clamp(18px, 3vw, 34px)",
                background: "rgba(15,23,42,0.55)",
                border: "1px solid rgba(0,202,255,0.22)",
                boxShadow: "inset 0 0 70px rgba(0,202,255,0.10)",
                backdropFilter: "blur(16px)",
                padding: "clamp(16px, 3vw, 34px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: "clamp(16px, 2.8vw, 30px)", fontWeight: 950, color: "#00caff", textShadow: "0 0 24px rgba(0,202,255,0.55)", marginBottom: "clamp(8px, 1.2vw, 14px)" }}>
                🔥 לילה של מוזיקה • קריוקי • וייב 🔥
              </div>

              <div
                ref={contentRef}
                style={{
                  flex: 1,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.25,
                  fontWeight: 950,
                  color: "#ffffff",
                  textShadow: "0 12px 34px rgba(0,0,0,0.70)",
                  fontSize: 46, // נקבע אוטומטית ע"י fitText()
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {text}
              </div>

              <div style={{ marginTop: "clamp(10px, 1.5vw, 18px)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "clamp(6px, 1vw, 10px)", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900, opacity: 0.88, fontSize: "clamp(11px, 1.4vw, 15px)" }}>📲 שולחים לחברים • שומרים מקום • מגיעים מוקדם</div>
                <div style={{ padding: "clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 16px)", borderRadius: "clamp(12px, 1.5vw, 16px)", background: "linear-gradient(135deg,#00caff,#0088ff)", color: "#001a2e", fontWeight: 950, fontSize: "clamp(12px, 1.4vw, 15px)", whiteSpace: "nowrap" }}>
                  🎤 שריינו עכשיו
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "8%", background: "linear-gradient(90deg, rgba(0,202,255,0.18), rgba(139,92,246,0.14), rgba(34,197,94,0.10))", borderTop: "1px solid rgba(148,163,184,0.12)" }}>
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950, letterSpacing: "0.08em", opacity: 0.96, fontSize: "clamp(12px, 1.5vw, 16px)" }}>
                ✨ APIRYON • המועדון הקריוקי שלכם ✨
              </div>
            </div>
          </div>
        </div>

        <div style={{ opacity: 0.75, fontSize: 13, textAlign: "center" }}>
          פורמט: 1080×1350 (מצוין לאינסטגרם/פייסבוק). רוצה גם גרסת סטורי 1080×1920? אגיד לך שורה אחת לשינוי.
        </div>
      </div>
    </div>
  );
}

function MetaPill({ icon, label, value }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "clamp(6px, 1vw, 10px)",
      padding: "clamp(10px, 1.3vw, 14px) clamp(12px, 1.5vw, 16px)",
      borderRadius: "clamp(12px, 1.5vw, 18px)",
      background: "rgba(15,23,42,0.60)",
      border: "1px solid rgba(148,163,184,0.18)",
      backdropFilter: "blur(10px)"
    }}>
      <div style={{ color: "#00caff", flexShrink: 0 }}>{icon}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <div style={{ fontSize: "clamp(10px, 1.1vw, 12px)", opacity: 0.75, fontWeight: 900 }}>{label}</div>
        <div style={{ fontSize: "clamp(13px, 1.5vw, 16px)", fontWeight: 950, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function inputStyle() {
  return {
    width: "100%",
    borderRadius: 14,
    padding: "12px 12px",
    border: "1px solid rgba(148,163,184,0.25)",
    outline: "none",
    background: "rgba(2,6,23,0.65)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 800,
  };
}

function primaryBtn(disabled) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 14px",
    borderRadius: 14,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 950,
    background: disabled ? "rgba(100,116,139,0.35)" : "linear-gradient(135deg,#00caff,#0088ff)",
    color: "#001a2e",
    boxShadow: "0 0 26px rgba(0,202,255,0.25)",
  };
}

function secondaryBtn() {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(0,202,255,0.25)",
    cursor: "pointer",
    fontWeight: 950,
    background: "rgba(0,202,255,0.08)",
    color: "#e2e8f0",
  };
}

ProInviteGenerator.isPublic = true;