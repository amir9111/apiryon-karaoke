import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ApyironLogo from "../components/ApyironLogo";
import { ArrowRight } from "lucide-react";

export default function Terms() {
  return (
    <div 
      dir="rtl"
      className="min-h-screen w-full p-4 md:p-8"
      style={{ 
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", 
        color: "#f9fafb" 
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Link 
          to={createPageUrl("Home")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(0, 202, 255, 0.3)",
            borderRadius: "12px",
            color: "#00caff",
            textDecoration: "none",
            fontSize: "0.9rem",
            marginBottom: "20px"
          }}
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לדף הבית
        </Link>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <ApyironLogo size="medium" showCircle={true} />
          </div>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            color: "#00caff",
            textShadow: "0 0 30px rgba(0, 202, 255, 0.5)",
            marginBottom: "8px"
          }}>
            תקנון ותנאי בילוי
          </h1>
          <p style={{ fontSize: "1rem", color: "#94a3b8" }}>
            מועדון אפריון (Apiryon Club)
          </p>
        </div>

        <div 
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "24px",
            padding: "32px",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            boxShadow: "0 0 60px rgba(0, 202, 255, 0.2)"
          }}
        >
          <div style={{ color: "#e2e8f0", fontSize: "1rem", lineHeight: "1.8" }}>
            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ 
                color: "#00caff", 
                fontSize: "1.4rem", 
                marginBottom: "16px", 
                fontWeight: "700",
                textShadow: "0 0 15px rgba(0, 202, 255, 0.3)"
              }}>
                1️⃣ כללי
              </h2>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>1.1.</strong> הוראות תקנון זה חלות על כל אדם הנכנס לשטח מועדון "אפריון" (להלן: "המועדון" או "המקום") ו/או המבצע הזמנת מקום.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>1.2.</strong> עצם הכניסה למועדון ו/או רכישת כרטיס מהווה הסכמה מלאה ובלתי מסויגת לכל תנאי התקנון.
                </p>
                <p>
                  <strong>1.3.</strong> הנהלת המועדון שומרת לעצמה את הזכות לשנות את התקנון בכל עת וללא הודעה מוקדמת.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                2️⃣ כניסה והגבלת גיל
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>2.1.</strong> הכניסה למועדון מותרת לגילאי 18 ומעלה בלבד, בהצגת תעודה מזהה רשמית בתוקף (ת.ז., דרכון או רישיון נהיגה).
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>2.2.</strong> הנהלת המועדון ו/או צוות האבטחה (הדורמן) שומרים לעצמם את הזכות הבלעדית למנוע כניסה של אדם ו/או להרחיק מבלים משטח המועדון בשל התנהגות בלתי הולמת, שכרות, אלימות או אי-עמידה בקוד הלבוש, וזאת ללא החזר כספי.
                </p>
                <p>
                  <strong>2.3.</strong> תשלום דמי הכניסה ("תשלום לדורמן") הינו עבור הכניסה והאווירה בלבד ואינו ניתן להחזרה במקרה של עזיבה מוקדמת.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                3️⃣ התנהגות ובטיחות
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>3.1.</strong> חל איסור מוחלט על הכנסת נשק, סמים, חפצים חדים או כל חומר מסוכן אחר לשטח המועדון.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>3.2.</strong> המועדון נוקט במדיניות "אפס סובלנות" כלפי אלימות פיזית או מילולית, הטרדות מכל סוג שהוא, או התנהגות המסכנת את יתר המבלים. עבירה על סעיף זה תגרור הרחקה מיידית ודיווח לרשויות החוק במידת הצורך.
                </p>
                <p>
                  <strong>3.3.</strong> יש להישמע להוראות המאבטחים וצוות המקום בכל עת.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                4️⃣ אלכוהול וצריכה
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>4.1.</strong> מכירת אלכוהול אסורה למי שטרם מלאו לו 18 שנים. הברמנים רשאים לדרוש תעודה מזהה בכל הזמנה.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>4.2.</strong> הנהלת המועדון רשאית לסרב להגיש אלכוהול למבלה הנראה במצב של שכרות יתר, על פי שיקול דעתה הבלעדי ולשם שמירה על ביטחונו וביטחון הסובבים.
                </p>
                <p>
                  <strong>4.3.</strong> לא תתאפשר הכנסת שתייה או מזון מבחוץ לשטח המועדון.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                5️⃣ ציוד ורכוש
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>5.1.</strong> המבלה אחראי באופן אישי לכל נזק שיגרם לרכוש המועדון (לרבות: מיקרופונים, מסכים, רהיטים, ציוד הגברה) כתוצאה מרשלנותו או זדונו. המועדון יחייב את המבלה בעלות התיקון או ההחלפה המלאה.
                </p>
                <p>
                  <strong>5.2.</strong> השימוש בציוד הקריוקי יעשה בהתאם להוראות הצוות בלבד.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                6️⃣ צילום ותיעוד
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>6.1.</strong> המועדון הינו מקום ציבורי מצולם. בעצם כניסתך למקום, הנך מאשר/ת להנהלת המועדון לצלם אותך (סטילס או וידאו) ולעשות שימוש בחומרים אלו לצרכי פרסום, שיווק ויחסי ציבור ברשתות החברתיות ובכל מדיה אחרת, ללא תמורה וללא הגבלת זמן.
                </p>
                <p>
                  <strong>6.2.</strong> במידה ואינך מעוניין/ת להופיע בפרסומים, יש לפנות לצלם או לצוות הניהול במקום בזמן אמת.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                7️⃣ אחריות וחפצים אישיים
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p>
                  <strong>7.1.</strong> הנהלת המועדון אינה אחראית על אובדן, גניבה או נזק לחפצים אישיים של המבלים (טלפונים, ארנקים, תיקים וכו'). המבלים מתבקשים לשמור על חפציהם.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                8️⃣ ביטולים והזמנות
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>8.1.</strong> הזמנת שולחן מותנית בתיאום מראש.
                </p>
                <p>
                  <strong>8.2.</strong> במקרה של ביטול הזמנה פחות מ-24 שעות לפני האירוע, המועדון רשאי לגבות דמי ביטול (או לחילופין: המקדמה לא תוחזר).
                </p>
              </div>
            </section>

            <div style={{ 
              marginTop: "32px", 
              paddingTop: "24px", 
              borderTop: "1px solid rgba(0, 202, 255, 0.2)",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "1rem",
              fontWeight: "700"
            }}>
              <p style={{ fontSize: "1.2rem", color: "#00caff" }}>ט.ל.ח</p>
              <p style={{ marginTop: "12px" }}>
                תנאי שימוש אלה נכנסו לתוקף ביום 31 בדצמבר 2025
              </p>
              <p style={{ marginTop: "8px" }}>
                © 2025 מועדון אפריון (Apiryon Club) | כל הזכויות שמורות
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}