import React from "react";

export default function MessagesFeed({ messages }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  const messagesWithContent = messages.filter(m => m.message && m.message.trim());
  
  if (messagesWithContent.length === 0) {
    return null;
  }

  return (
    <div style={{
      width: "100%",
      background: "rgba(15, 23, 42, 0.8)",
      borderTop: "2px solid rgba(0, 202, 255, 0.3)",
      padding: "20px 0",
      overflow: "hidden",
      position: "relative"
    }}>
      <div style={{
        fontSize: "1rem",
        color: "#00caff",
        textAlign: "center",
        marginBottom: "15px",
        fontWeight: "700",
        textShadow: "0 0 20px rgba(0, 202, 255, 0.6)"
      }}>
        💬 הודעות מהקהל
      </div>

      <div style={{
        display: "flex",
        animation: "scroll 30s linear infinite",
        whiteSpace: "nowrap"
      }}>
        {[...messagesWithContent, ...messagesWithContent].map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 24px",
              marginRight: "20px",
              background: "linear-gradient(135deg, rgba(0, 202, 255, 0.1), rgba(0, 136, 255, 0.1))",
              border: "1px solid rgba(0, 202, 255, 0.3)",
              borderRadius: "16px",
              boxShadow: "0 0 20px rgba(0, 202, 255, 0.2)"
            }}
          >
            <span style={{
              fontSize: "1.1rem",
              color: "#00caff",
              fontWeight: "700",
              marginLeft: "10px"
            }}>
              {msg.singer_name}:
            </span>
            <span style={{
              fontSize: "1rem",
              color: "#e2e8f0"
            }}>
              {msg.message}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}