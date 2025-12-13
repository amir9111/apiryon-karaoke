import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";

export default function SendMessageToScreen() {
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 10),
    refetchInterval: 5000,
  });

  // Check if user has active message (less than 30 seconds old)
  const hasActiveMessage = () => {
    if (!userName.trim()) return false;
    
    const now = Date.now();
    const userMessage = messages.find(m => 
      m.sender_name === userName.trim()
    );
    
    if (!userMessage) return false;
    
    const created = new Date(userMessage.created_date).getTime();
    const ageInSeconds = (now - created) / 1000;
    
    return ageInSeconds < 30;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!userName.trim()) {
      setStatus({ type: "error", message: "נא למלא שם 📝" });
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
      await base44.entities.Message.create({
        sender_name: userName.trim(),
        message: message.trim().substring(0, 100)
      });
      
      setStatus({ type: "ok", message: "✅ ההודעה נשלחה למסך!" });
      setMessage("");
      
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
        💬 שלח הודעה למסך הקהל
      </div>
      <div style={{
        fontSize: "0.85rem",
        color: "#cbd5e1",
        marginBottom: "16px",
        textAlign: "center"
      }}>
        ההודעה תרוץ על המסך 30 שניות בזמן שזמר מבצע!
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          maxLength={50}
          placeholder="השם שלך..."
          disabled={isSubmitting}
          className="w-full px-3 py-2.5 rounded-xl border outline-none text-[0.95rem]"
          style={{
            borderColor: "#8b5cf6",
            background: "rgba(15,23,42,0.9)",
            color: "#f9fafb"
          }}
        />
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={100}
          placeholder="ההודעה שלך למסך..."
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
          className="w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2"
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
          {isSubmitting ? (
            "שולח..."
          ) : hasActiveMessage() ? (
            "חכה 30 שניות..."
          ) : (
            <>
              <Send className="w-4 h-4" />
              שלח הודעה למסך
            </>
          )}
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