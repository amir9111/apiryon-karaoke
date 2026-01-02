import React from 'react';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

/**
 * 🔒 מדריך אבטחה למערכת אפריון
 * 
 * קומפוננטה זו מסבירה את שכבות האבטחה שיש להגדיר
 * כדי להפוך את המערכת למאובטחת מפני תקיפות.
 */
export default function SecurityGuide() {
  return (
    <div style={{
      padding: "40px",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      color: "#e2e8f0",
      borderRadius: "20px",
      border: "2px solid rgba(239, 68, 68, 0.3)",
      maxWidth: "900px",
      margin: "0 auto"
    }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <Shield className="w-16 h-16" style={{ margin: "0 auto 16px", color: "#ef4444" }} />
        <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "#ef4444", marginBottom: "8px" }}>
          🔒 מדריך אבטחה - אפריון
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
          שכבות הגנה שחובה להגדיר במערכת
        </p>
      </div>

      {/* שכבה 1: RLS */}
      <section style={{ marginBottom: "32px", padding: "24px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <Lock className="w-8 h-8" style={{ color: "#ef4444" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#ef4444" }}>
            שכבה 1: Row Level Security (RLS) - קריטי!
          </h2>
        </div>
        
        <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
          <strong>למה זה חשוב:</strong> זה המנעול האמיתי של המערכת. גם אם האקר ינסה לזייף בקשות, 
          השרת יחסום אותו מכיוון שההרשאות מוגדרות ברמת מסד הנתונים.
        </p>

        <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: "20px", borderRadius: "12px", marginBottom: "16px" }}>
          <h3 style={{ color: "#fbbf24", marginBottom: "12px", fontWeight: "700" }}>📋 הגדרות להגדיר בדשבורד Base44:</h3>
          
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ color: "#00caff", marginBottom: "8px" }}>טבלת KaraokeRequest:</h4>
            <ul style={{ paddingRight: "20px", lineHeight: "2" }}>
              <li>✅ <strong>Create:</strong> פתוח לכולם (אורחים יכולים לבקש שירים)</li>
              <li>✅ <strong>Read:</strong> פתוח לכולם (כולם רואים את התור)</li>
              <li>🔒 <strong>Update:</strong> Admin Only (רק מנהל יכול לשנות סטטוס)</li>
              <li>🔒 <strong>Delete:</strong> Admin Only (רק מנהל יכול למחוק)</li>
            </ul>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ color: "#00caff", marginBottom: "8px" }}>טבלת MediaUpload:</h4>
            <ul style={{ paddingRight: "20px", lineHeight: "2" }}>
              <li>✅ <strong>Create:</strong> פתוח לכולם</li>
              <li>✅ <strong>Read:</strong> פתוח לכולם</li>
              <li>🔒 <strong>Update:</strong> Admin Only</li>
              <li>🔒 <strong>Delete:</strong> Admin Only</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: "#00caff", marginBottom: "8px" }}>טבלת Message:</h4>
            <ul style={{ paddingRight: "20px", lineHeight: "2" }}>
              <li>✅ <strong>Create:</strong> פתוח לכולם</li>
              <li>✅ <strong>Read:</strong> פתוח לכולם</li>
              <li>🔒 <strong>Update:</strong> Admin Only</li>
              <li>🔒 <strong>Delete:</strong> Admin Only</li>
            </ul>
          </div>
        </div>

        <div style={{ 
          padding: "16px", 
          background: "rgba(239, 68, 68, 0.2)", 
          border: "2px solid rgba(239, 68, 68, 0.5)",
          borderRadius: "12px"
        }}>
          <strong style={{ color: "#ef4444" }}>⚠️ פעולה נדרשת:</strong>
          <p style={{ marginTop: "8px" }}>
            היכנס לדשבורד Base44 → בחר כל טבלה → Settings → Permissions → הגדר את ההרשאות הנ"ל
          </p>
        </div>
      </section>

      {/* שכבה 2: XSS */}
      <section style={{ marginBottom: "32px", padding: "24px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <Eye className="w-8 h-8" style={{ color: "#3b82f6" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#3b82f6" }}>
            שכבה 2: XSS Protection - ✅ הוטמע
          </h2>
        </div>
        
        <p style={{ lineHeight: "1.8" }}>
          <strong>מה זה:</strong> הגנה מפני הזרקת קוד זדוני דרך הודעות ושמות. 
          כל תוכן שמגיע מהמשתמשים עובר ניקוי אוטומטי עם DOMPurify לפני הצגה על המסך.
        </p>
        
        <div style={{ 
          marginTop: "16px",
          padding: "12px", 
          background: "rgba(16, 185, 129, 0.1)", 
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "8px",
          color: "#10b981"
        }}>
          ✅ כבר מוטמע: הודעות, שמות זמרים, כותרות שירים מסוננים אוטומטית
        </div>
      </section>

      {/* שכבה 3: File Validation */}
      <section style={{ marginBottom: "32px", padding: "24px", background: "rgba(139, 92, 246, 0.1)", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <AlertTriangle className="w-8 h-8" style={{ color: "#8b5cf6" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#8b5cf6" }}>
            שכבה 3: File Validation - ✅ הוטמע
          </h2>
        </div>
        
        <p style={{ lineHeight: "1.8", marginBottom: "12px" }}>
          <strong>מה זה:</strong> בדיקות על קבצים שמועלים למסך הקהל.
        </p>
        
        <ul style={{ paddingRight: "20px", lineHeight: "2" }}>
          <li>✅ גודל מקסימלי: 5MB</li>
          <li>✅ סוג קובץ: תמונות בלבד (image/*)</li>
          <li>✅ אורך טקסט: מקסימום 100 תווים בהודעות</li>
        </ul>

        <div style={{ 
          marginTop: "16px",
          padding: "12px", 
          background: "rgba(16, 185, 129, 0.1)", 
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "8px",
          color: "#10b981"
        }}>
          ✅ כבר מוטמע: ולידציות פועלות ב-UploadToScreen
        </div>
      </section>

      {/* סיכום */}
      <div style={{ 
        padding: "24px", 
        background: "rgba(251, 191, 36, 0.1)", 
        borderRadius: "16px",
        border: "2px solid rgba(251, 191, 36, 0.3)"
      }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fbbf24", marginBottom: "16px" }}>
          📌 סיכום ופעולות נדרשות
        </h3>
        
        <div style={{ lineHeight: "2.2" }}>
          <p>✅ <strong>הוטמע בקוד:</strong> XSS Protection, File Validation, Input Sanitization</p>
          <p>⚠️ <strong>נדרש ממך:</strong> הגדרת RLS Permissions בדשבורד Base44 (ראה שכבה 1)</p>
          <p>💡 <strong>המלצה:</strong> עקוב אחר לוגים חריגים במערכת (מספר רב של העלאות מאותו IP)</p>
        </div>
      </div>

      <div style={{ marginTop: "32px", textAlign: "center", fontSize: "0.9rem", color: "#64748b" }}>
        <p>קומפוננטה זו נוצרה למטרות תיעוד בלבד.</p>
        <p>ניתן להסיר אותה מהקוד לאחר הטמעת ההנחיות.</p>
      </div>
    </div>
  );
}