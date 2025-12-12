import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ApyironLogo from "./ApyironLogo";

export default function TermsModal({ onAccept }) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleScroll = (e) => {
    const element = e.target;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isAtBottom) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
        overflow: "auto"
      }}
    >
      <div 
        style={{
          background: "rgba(15, 23, 42, 0.98)",
          borderRadius: "24px",
          padding: "28px 24px",
          maxWidth: "650px",
          width: "100%",
          border: "2px solid rgba(0, 202, 255, 0.4)",
          boxShadow: "0 0 60px rgba(0, 202, 255, 0.3)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <ApyironLogo size="small" showCircle={true} />
          </div>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: "800",
            color: "#00caff",
            textShadow: "0 0 20px rgba(0, 202, 255, 0.5)",
            marginBottom: "8px"
          }}>
            ⚖️ תנאי שימוש והסכם משתמש
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
            יש לקרוא ולאשר לפני המשך שימוש באפליקציה
          </p>
        </div>

        <div 
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            background: "rgba(30, 41, 59, 0.5)",
            borderRadius: "16px",
            border: scrolledToBottom 
              ? "3px solid rgba(16, 185, 129, 0.8)" 
              : "3px solid rgba(239, 68, 68, 0.8)",
            marginBottom: "20px",
            maxHeight: "65vh",
            position: "relative",
            boxShadow: scrolledToBottom 
              ? "0 0 25px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.1)"
              : "0 0 25px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(239, 68, 68, 0.1)",
            transition: "all 0.4s ease"
          }}
        >
          <div style={{ color: "#e2e8f0", fontSize: "1rem", lineHeight: "1.8" }}>
            <h3 style={{ color: "#00caff", fontSize: "1.3rem", marginBottom: "16px", fontWeight: "800" }}>
              הסכם רישיון שימוש באפליקציה
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#00caff", fontSize: "1.05rem" }}>בעלות ורישיון:</strong>
              <p style={{ marginTop: "8px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                אפליקציה זו ("האפריון - מערכת קריוקי") הנה קניינו הבלעדי של אמיר (ת.ז. 203687355) ("הבעלים"). 
                כל הזכויות, כולל זכויות יוצרים, סימני מסחר, עיצוב, קוד מקור, וקניין רוחני אחר שמורות לבעלים.
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#00caff", fontSize: "1.05rem" }}>תנאי השימוש:</strong>
              <ul style={{ marginTop: "8px", paddingRight: "20px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                <li>השימוש באפליקציה מותר אך ורק למטרות חוקיות ובהתאם לתנאים אלה</li>
                <li>אסור להעתיק, לשכפל, להפיץ, למכור או לנצל את האפליקציה או חלקים ממנה</li>
                <li>אסור לבצע הנדסה לאחור, לפרק או לנסות לחלץ קוד מקור מהאפליקציה</li>
                <li>כל שימוש מסחרי באפליקציה ללא אישור בכתב מהבעלים אסור בהחלט</li>
              </ul>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#00caff", fontSize: "1.05rem" }}>פרטיות ואבטחת מידע:</strong>
              <ul style={{ marginTop: "8px", paddingRight: "20px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                <li>האפליקציה אוספת מידע שאתה מספק בטפסים (שם, אימייל, שם שיר)</li>
                <li>המידע נשמר באופן מאובטח במערכות Base44</li>
                <li>המידע משמש אך ורק לצורך הפעלת מערכת הקריוקי</li>
                <li>לא נעביר את המידע שלך לצדדים שלישיים ללא הסכמתך</li>
                <li>תוכל לבקש מחיקת הנתונים שלך בכל עת</li>
              </ul>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#00caff", fontSize: "1.05rem" }}>הגבלת אחריות:</strong>
              <p style={{ marginTop: "8px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                האפליקציה מסופקת "כמות שהיא" ללא אחריות מכל סוג. הבעלים לא יהיה אחראי לכל נזק ישיר, 
                עקיף, מקרי, מיוחד או תוצאתי הנובע משימוש או מחוסר יכולת להשתמש באפליקציה. 
                הבעלים אינו אחראי לאובדן מידע, הפסקת שירות, או כל בעיה טכנית אחרת.
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#00caff", fontSize: "1.05rem" }}>שימוש אחראי:</strong>
              <ul style={{ marginTop: "8px", paddingRight: "20px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                <li>אתה מתחייב שלא להעלות תוכן פוגעני, בלתי חוקי, או פוגע בזכויות אחרים</li>
                <li>אתה מתחייב שלא להשתמש באפליקציה לצורך ספאם או הטרדה</li>
                <li>אתה מתחייב שלא לנסות לפגוע בפעילות התקינה של האפליקציה</li>
                <li>הבעלים שומר לעצמו את הזכות לחסום משתמשים המפרים תנאים אלה</li>
              </ul>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#00caff", fontSize: "1.05rem" }}>זכויות יוצרים וקניין רוחני:</strong>
              <p style={{ marginTop: "8px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                כל התוכן באפליקציה, לרבות טקסט, גרפיקה, לוגו ("APIRYON"), עיצוב ממשק, 
                קוד תוכנה ופונקציונליות, מוגנים בזכויות יוצרים וחוקי קניין רוחני. 
                © 2025 אמיר (ת.ז. 203687355). כל הזכויות שמורות.
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#00caff", fontSize: "1.05rem" }}>שינויים בתנאי השימוש:</strong>
              <p style={{ marginTop: "8px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                הבעלים רשאי לעדכן תנאים אלה בכל עת. המשך שימוש באפליקציה לאחר שינויים 
                מהווה הסכמה לתנאים המעודכנים.
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#00caff", fontSize: "1.05rem" }}>סמכות שיפוט:</strong>
              <p style={{ marginTop: "8px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                כל סכסוך הנובע מתנאים אלה יהיה נתון לסמכות השיפוט הבלעדית של בתי המשפט בישראל, 
                ויחולו עליו דיני מדינת ישראל.
              </p>
            </div>

            <div style={{ 
              padding: "18px", 
              background: "rgba(0, 202, 255, 0.1)", 
              borderRadius: "12px",
              border: "1px solid rgba(0, 202, 255, 0.3)",
              marginTop: "20px"
            }}>
              <strong style={{ color: "#00caff", fontSize: "1.1rem" }}>יצירת קשר:</strong>
              <p style={{ marginTop: "8px", color: "#cbd5e1", fontSize: "1rem" }}>
                לשאלות, בקשות למחיקת מידע, או כל נושא משפטי אחר,<br />
                ניתן ליצור קשר עם הבעלים דרך פרטי הקשר שבמועדון.
              </p>
            </div>

            <div style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "#fca5a5"
            }}>
              ⚠️ <strong>חשוב:</strong> אי עמידה בתנאים אלה עלולה להוביל לחסימה מהאפליקציה ולנקיטת הליכים משפטיים.
            </div>
          </div>
        </div>

        {!scrolledToBottom && (
          <div style={{
            textAlign: "center",
            marginBottom: "12px",
            position: "relative"
          }}>
            <div style={{
              fontSize: "3.5rem",
              marginBottom: "8px",
              animation: "bounce 1.5s infinite",
              opacity: 0.7
            }}>
              👇
            </div>
            <div style={{
              fontSize: "1.1rem",
              fontWeight: "800",
              color: "#ef4444",
              textShadow: "0 0 20px rgba(239, 68, 68, 0.8)",
              animation: "pulse 2s infinite",
              marginBottom: "6px"
            }}>
              ⚠️ חובה לגלול למטה עד הסוף! ⚠️
            </div>
            <div style={{
              fontSize: "0.9rem",
              color: "#fca5a5",
              fontWeight: "600"
            }}>
              החלק את האצבע למעלה בתיבה האדומה
            </div>
          </div>
        )}
        
        {scrolledToBottom && (
          <div style={{
            textAlign: "center",
            marginBottom: "12px",
            animation: "fadeIn 0.5s"
          }}>
            <div style={{
              fontSize: "3rem",
              marginBottom: "8px"
            }}>
              ✅
            </div>
            <div style={{
              fontSize: "1.1rem",
              fontWeight: "800",
              color: "#10b981",
              textShadow: "0 0 20px rgba(16, 185, 129, 0.8)"
            }}>
              מעולה! קראת את כל התנאים
            </div>
          </div>
        )}

        <label style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px",
          background: "rgba(30, 41, 59, 0.5)",
          borderRadius: "12px",
          border: "1px solid rgba(0, 202, 255, 0.2)",
          cursor: scrolledToBottom ? "pointer" : "not-allowed",
          opacity: scrolledToBottom ? 1 : 0.5,
          marginBottom: "16px"
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={!scrolledToBottom}
            style={{
              width: "20px",
              height: "20px",
              cursor: scrolledToBottom ? "pointer" : "not-allowed",
              accentColor: "#00caff"
            }}
          />
          <span style={{ color: "#e2e8f0", fontSize: "0.95rem", flex: 1 }}>
            קראתי והבנתי את תנאי השימוש ואני מסכים/ה לכל האמור לעיל
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!agreed || !scrolledToBottom}
          style={{
            background: (agreed && scrolledToBottom) 
              ? "linear-gradient(135deg, #00caff, #0088ff)" 
              : "rgba(100, 116, 139, 0.3)",
            color: (agreed && scrolledToBottom) ? "#001a2e" : "#64748b",
            border: "none",
            borderRadius: "16px",
            padding: "14px 32px",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: (agreed && scrolledToBottom) ? "pointer" : "not-allowed",
            boxShadow: (agreed && scrolledToBottom) 
              ? "0 0 30px rgba(0, 202, 255, 0.4)" 
              : "none",
            transition: "all 0.2s",
            width: "100%"
          }}
        >
          {agreed && scrolledToBottom ? "✅ אני מאשר/ת ומסכים/ה" : "🔒 יש לקרוא ולאשר"}
        </button>

        <div style={{ 
          marginTop: "12px", 
          textAlign: "center",
          fontSize: "0.8rem",
          color: "#64748b"
        }}>
          לא ניתן להשתמש באפליקציה ללא אישור תנאי השימוש
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes bounce {
            0%, 100% { 
              transform: translateY(0); 
            }
            50% { 
              transform: translateY(-15px); 
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}