import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function QuickMessage({ requests, userName, userPhoto, onMessageSent }) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  // Check if user has active message (less than 30 seconds old)
  const hasActiveMessage = () => {
    if (!userName) return false;
    
    const now = Date.now();
    const userMessage = requests.find(r => 
      r.singer_name === userName && 
      r.message && 
      r.message.trim()
    );
    
    if (!userMessage) return false;
    
    const created = new Date(userMessage.created_date).getTime();
    const ageInSeconds = (now - created) / 1000;
    
    return ageInSeconds < 30;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!userName) {
      setStatus({ type: "error", message: "נא למלא שם קודם 📝" });
      return;
    }
    
    if (!message.trim()) {
      setStatus({ type: "error", message: "נא לכתוב הודעה 💬" });
      return;
    }
    
    if (hasActiveMessage()) {
      setStatus({ type: "error", message: "יש לך הודעה פעילה! חכה 30 שניות ⏳" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let photoUrl = null;
      if (userPhoto) {
        const blob = await fetch(userPhoto).then(r => r.blob());
        const file = new File([blob], 'message.jpg', { type: 'image/jpeg' });
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        photoUrl = uploadResult.file_url;
      }
      
      await base44.entities.KaraokeRequest.create({
        singer_name: userName.trim(),
        song_title: "הודעה בלבד",
        song_artist: "",
        message: message.trim().substring(0, 100),
        photo_url: photoUrl,
        status: "done"
      });
      
      setStatus({ type: "ok", message: "✅ ההודעה נשלחה למסך!" });
      setMessage("");
      if (onMessageSent) onMessageSent();
      
      setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus({ type: "error", message: "שגיאה בשליחת ההודעה" });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div style={{
      background: "rgba(139, 92, 246, 0.15)",
      border: "2px solid rgba(139, 92, 246, 0.4)",
      borderRadius: "18px",
      padding: "20px",
      marginBottom: "20px"
    }}>
      <div style={{
        fontSize: "1.3rem",
        fontWeight: "800",
        color: "#a78bfa",
        marginBottom: "8px",
        textAlign: "center",
        textShadow: "0 0 20px rgba(139, 92, 246, 0.6)"
      }}>
        💬 שלח הודעה למסך
      </div>
      <div style={{
        fontSize: "0.85rem",
        color: "#cbd5e1",
        marginBottom: "16px",
        textAlign: "center"
      }}>
        ההודעה תופיע 30 שניות על המסך!
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={100}
          placeholder="הודעה קצרה שתופיע על המסך..."
          disabled={isSubmitting || hasActiveMessage()}
          className="w-full px-3 py-2.5 rounded-xl border outline-none text-[0.95rem]"
          style={{
            borderColor: "#8b5cf6",
            background: "rgba(15,23,42,0.9)",
            color: "#f9fafb",
            opacity: hasActiveMessage() ? 0.5 : 1
          }}
        />
        <div className="text-xs text-right" style={{ color: "#94a3b8" }}>
          {message.length}/100 תווים
        </div>

        <button
          type="submit"
          disabled={isSubmitting || hasActiveMessage()}
          className="w-full py-3 rounded-xl font-bold text-base"
          style={{
            background: isSubmitting || hasActiveMessage() 
              ? "rgba(100, 116, 139, 0.5)" 
              : "linear-gradient(135deg, #a78bfa, #8b5cf6)",
            color: isSubmitting || hasActiveMessage() ? "#64748b" : "#fff",
            border: "none",
            cursor: isSubmitting || hasActiveMessage() ? "not-allowed" : "pointer",
            boxShadow: isSubmitting || hasActiveMessage() 
              ? "none" 
              : "0 0 20px rgba(139, 92, 246, 0.5)"
          }}
        >
          {isSubmitting ? "שולח..." : hasActiveMessage() ? "חכה 30 שניות..." : "שלח הודעה למסך 🚀"}
        </button>

        {status.type && (
          <div 
            className="text-center text-sm font-semibold"
            style={{ color: status.type === "ok" ? "#10b981" : "#f87171" }}
          >
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}