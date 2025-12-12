import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Logo from "../components/Logo";
import QRCode from "../components/QRCode";

export default function Home() {
  const [formData, setFormData] = useState({
    singer_name: "",
    song_title: "",
    song_artist: ""
  });
  const [status, setStatus] = useState({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.singer_name.trim() || !formData.song_title.trim()) {
      setStatus({ type: "error", message: "נא למלא שם ושם שיר 🙂" });
      return;
    }

    setIsSubmitting(true);
    
    await base44.entities.KaraokeRequest.create({
      ...formData,
      status: "waiting"
    });

    setStatus({ type: "ok", message: "הבקשה נרשמה! בהצלחה 🎤" });
    setFormData({
      singer_name: "",
      song_title: "",
      song_artist: ""
    });
    setIsSubmitting(false);

    setTimeout(() => {
      setStatus({ type: null, message: "" });
    }, 3500);
  };

  return (
    <div 
      dir="rtl"
      className="min-h-screen w-full flex justify-center p-4 md:p-8"
      style={{ background: "#050816", color: "#f9fafb" }}
    >
      <div className="w-full max-w-[480px]">
        <div
          className="rounded-[18px] p-5 md:p-6"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            boxShadow: "0 10px 30px rgba(0, 202, 255, 0.2)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 202, 255, 0.2)"
          }}
        >
          <div className="mb-4">
            <Logo size="medium" showCircle={true} />
          </div>
          
          <h1 className="text-[1.6rem] md:text-[1.9rem] font-bold text-center mb-2">
            תור קריוקי
          </h1>
          <p className="text-[0.9rem] text-center mb-4" style={{ color: "#00caff" }}>
            ממלאים, מצטרפים לתור – ומחכים שיקראו לכם 🎤
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-2">
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
                placeholder="לדוגמה: אמיר אבו אסמאעיל"
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
                opacity: isSubmitting ? 0.7 : 1
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

            <hr 
            className="my-[18px] md:my-3 h-px border-0"
            style={{ background: "radial-gradient(circle, #00caff 0, transparent 70%)" }}
            />

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-[0.9rem]">
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-center mb-1">הצטרפו לקבוצת הווטסאפ:</div>
              <a
                href="https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15?mode=hqrt3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-[9px] px-[14px] rounded-full no-underline font-semibold text-[0.9rem] whitespace-nowrap"
                style={{
                  background: "#00caff",
                  color: "#001a2e"
                }}
              >
                <span className="text-[1.1rem]">💬</span>
                <span>קבוצת ווטסאפ</span>
              </a>
            </div>

            <div className="flex flex-col items-center">
              <QRCode url={window.location.origin + window.location.pathname} size={120} />
            </div>
            </div>
        </div>

        <Link 
          to={createPageUrl("Admin")}
          className="block text-center mt-4 text-[0.75rem]"
          style={{ color: "#4b5563" }}
        >
          🎛️ כניסה למסך ניהול
        </Link>
      </div>
    </div>
  );
}