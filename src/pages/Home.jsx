import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Mic2, Sparkles, MessageCircle } from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({
    singer_name: "",
    email: "",
    song_title: "",
    song_artist: "",
    notes: ""
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
      email: "",
      song_title: "",
      song_artist: "",
      notes: ""
    });
    setIsSubmitting(false);

    setTimeout(() => {
      setStatus({ type: null, message: "" });
    }, 3500);
  };

  return (
    <div 
      className="min-h-screen w-full flex justify-center px-4 py-6 md:py-10"
      style={{ background: "#050816" }}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[22px] p-6 md:p-7"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)"
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Mic2 className="w-8 h-8 text-[#022c22]" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              תור קריוקי
            </h1>
            <p className="text-[#cbd5f5] text-sm md:text-base">
              ממלאים, מצטרפים לתור – ומחכים שיקראו לכם 🎤
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#cbd5f5] mb-1.5">
                שם מלא / שם במה
              </label>
              <input
                type="text"
                name="singer_name"
                value={formData.singer_name}
                onChange={handleChange}
                placeholder="לדוגמה: אמיר אבו אסמאעיל"
                className="w-full px-4 py-3 rounded-xl border border-[#1f2937] bg-[rgba(15,23,42,0.9)] text-white placeholder-gray-500 outline-none transition-all focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50"
              />
            </div>

            <div>
              <label className="block text-sm text-[#cbd5f5] mb-1.5">
                מייל (לא חובה)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="אם תרצה שניצור קשר"
                className="w-full px-4 py-3 rounded-xl border border-[#1f2937] bg-[rgba(15,23,42,0.9)] text-white placeholder-gray-500 outline-none transition-all focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50"
              />
            </div>

            <div>
              <label className="block text-sm text-[#cbd5f5] mb-1.5">
                שם השיר
              </label>
              <input
                type="text"
                name="song_title"
                value={formData.song_title}
                onChange={handleChange}
                placeholder="לדוגמה: הנה זה בא"
                className="w-full px-4 py-3 rounded-xl border border-[#1f2937] bg-[rgba(15,23,42,0.9)] text-white placeholder-gray-500 outline-none transition-all focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50"
              />
            </div>

            <div>
              <label className="block text-sm text-[#cbd5f5] mb-1.5">
                שם האמן (לא חובה)
              </label>
              <input
                type="text"
                name="song_artist"
                value={formData.song_artist}
                onChange={handleChange}
                placeholder="לדוגמה: חדווה ודוד"
                className="w-full px-4 py-3 rounded-xl border border-[#1f2937] bg-[rgba(15,23,42,0.9)] text-white placeholder-gray-500 outline-none transition-all focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50"
              />
            </div>

            <div>
              <label className="block text-sm text-[#cbd5f5] mb-1.5">
                הקדשה / הערות לדי׳גיי
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="לדוגמה: להנמיך טון, שרים לשרית"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#1f2937] bg-[rgba(15,23,42,0.9)] text-white placeholder-gray-500 outline-none transition-all focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 resize-none"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-full font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-70"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#022c22"
              }}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <Music className="w-5 h-5" />
                  שלחו אותי לתור 🎵
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {status.type && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-center text-sm py-2 ${
                    status.type === "ok" ? "text-[#4ade80]" : "text-[#f97373]"
                  }`}
                >
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Divider */}
          <div 
            className="my-6 h-px"
            style={{ background: "radial-gradient(circle, #4b5563 0%, transparent 70%)" }}
          />

          {/* WhatsApp Box */}
          <div className="text-center">
            <p className="text-[#cbd5f5] text-sm mb-3">
              רוצים להתעדכן בכל ערבי הקריוקי?
            </p>
            <motion.a
              href="https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15?mode=hqrt3"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm"
              style={{
                background: "#22c55e",
                color: "#022c22"
              }}
            >
              <MessageCircle className="w-4 h-4" />
              להצטרפות לקבוצת הווטסאפ
            </motion.a>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[#4b5563] text-xs mt-6">
          🎤 בהצלחה על הבמה!
        </p>
      </div>
    </div>
  );
}