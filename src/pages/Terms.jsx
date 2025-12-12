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
            תנאי שימוש והסכם משתמש
          </h1>
          <p style={{ fontSize: "1rem", color: "#94a3b8" }}>
            מסמך משפטי המסדיר את השימוש באפליקציה
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
                📜 הסכם רישיון שימוש באפליקציה
              </h2>
              <p style={{ color: "#cbd5e1" }}>
                ברוכים הבאים לאפליקציית "האפריון - מערכת קריוקי". מסמך זה מהווה הסכם משפטי מחייב 
                בינך לבין הבעלים של האפליקציה. השימוש באפליקציה מעיד על הסכמתך לכל התנאים המפורטים להלן.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                🏢 בעלות ורישיון
              </h3>
              <p style={{ color: "#cbd5e1", marginBottom: "12px" }}>
                אפליקציה זו ("האפריון - מערכת קריוקי") הנה קניינו הבלעדי של <strong>אמיר (ת.ז. 203687355)</strong> ("הבעלים"). 
              </p>
              <p style={{ color: "#cbd5e1" }}>
                כל הזכויות הקשורות באפליקציה, לרבות ומבלי לגרוע: זכויות יוצרים, סימני מסחר (כולל "APIRYON"), 
                עיצוב ממשק משתמש, קוד מקור, קוד אובייקט, בסיסי נתונים, אלגוריתמים, ומתודולוגיות - 
                כל אלה ועוד הינם קניין רוחני השמור לבעלים בלבד.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                ✅ תנאי השימוש המותרים
              </h3>
              <ul style={{ paddingRight: "20px", color: "#cbd5e1" }}>
                <li style={{ marginBottom: "8px" }}>השימוש באפליקציה מותר אך ורק למטרות אישיות וחוקיות</li>
                <li style={{ marginBottom: "8px" }}>רישום בקשות קריוקי במסגרת אירועים שבהם משתמשים באפליקציה</li>
                <li style={{ marginBottom: "8px" }}>צפייה במידע המוצג באפליקציה</li>
                <li style={{ marginBottom: "8px" }}>שימוש בפונקציונליות הבסיסית של האפליקציה כפי שתוכננה</li>
              </ul>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                🚫 שימושים אסורים בהחלט
              </h3>
              <ul style={{ paddingRight: "20px", color: "#cbd5e1" }}>
                <li style={{ marginBottom: "8px" }}><strong>אסור בהחלט</strong> להעתיק, לשכפל, להפיץ, למכור או להשכיר את האפליקציה או כל חלק ממנה</li>
                <li style={{ marginBottom: "8px" }}><strong>אסור בהחלט</strong> לבצע הנדסה לאחור (Reverse Engineering), לפרק, לנתח או לנסות לחלץ קוד מקור</li>
                <li style={{ marginBottom: "8px" }}><strong>אסור בהחלט</strong> ליצור יצירות נגזרות או לבצע שינויים באפליקציה</li>
                <li style={{ marginBottom: "8px" }}><strong>אסור בהחלט</strong> להסיר, לשנות או להסתיר כל סימן זכויות יוצרים או קניין רוחני</li>
                <li style={{ marginBottom: "8px" }}><strong>אסור בהחלט</strong> לעשות שימוש מסחרי באפליקציה ללא אישור בכתב מהבעלים</li>
                <li style={{ marginBottom: "8px" }}><strong>אסור בהחלט</strong> לנסות לפגוע, להציף או להפריע לפעילות התקינה של האפליקציה</li>
              </ul>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                🔒 פרטיות ואבטחת מידע
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "12px" }}><strong>איסוף מידע:</strong></p>
                <ul style={{ paddingRight: "20px", marginBottom: "12px" }}>
                  <li>האפליקציה אוספת מידע שאתה מספק מרצונך: שם מלא/שם במה, כתובת אימייל (אופציונלי), שם שיר, שם אמן</li>
                  <li>מידע טכני אוטומטי: זמן גישה, כתובת IP, סוג דפדפן (לצרכי תפעול בלבד)</li>
                </ul>

                <p style={{ marginBottom: "12px" }}><strong>שימוש במידע:</strong></p>
                <ul style={{ paddingRight: "20px", marginBottom: "12px" }}>
                  <li>המידע משמש אך ורק להפעלת מערכת הקריוקי - ניהול תור, הצגת מידע</li>
                  <li>לא נשתמש במידע למטרות שיווקיות ללא הסכמתך המפורשת</li>
                  <li>לא נמכור, נשכיר או נעביר את המידע לצדדים שלישיים</li>
                </ul>

                <p style={{ marginBottom: "12px" }}><strong>אבטחה:</strong></p>
                <ul style={{ paddingRight: "20px", marginBottom: "12px" }}>
                  <li>המידע נשמר במערכות ענן מאובטחות (Base44)</li>
                  <li>גישה למידע מוגבלת למנהל המערכת בלבד</li>
                  <li>נעשה שימוש בטכנולוגיות הצפנה מתקדמות</li>
                </ul>

                <p style={{ marginBottom: "12px" }}><strong>זכויותיך:</strong></p>
                <ul style={{ paddingRight: "20px" }}>
                  <li>תוכל לבקש מחיקת הנתונים שלך בכל עת</li>
                  <li>תוכל לבקש עותק של הנתונים השמורים עליך</li>
                  <li>תוכל לבקש תיקון נתונים שגויים</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                ⚠️ הגבלת אחריות וכתב שיפוי
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "12px" }}>
                  האפליקציה מסופקת <strong>"כמות שהיא" (AS IS)</strong> וללא כל אחריות מסוג כלשהו, 
                  בין אם מפורשת ובין אם משתמעת.
                </p>
                <p style={{ marginBottom: "12px" }}>
                  הבעלים לא יהיה אחראי, בשום מקרה ובכל תנאי, לכל נזק מכל סוג שהוא, לרבות:
                </p>
                <ul style={{ paddingRight: "20px" }}>
                  <li>נזק ישיר, עקיף, מקרי, מיוחד, עונשי או תוצאתי</li>
                  <li>אובדן רווחים, נתונים, מוניטין או הזדמנויות עסקיות</li>
                  <li>הפסקת שירות, איטיות, תקלות טכניות או בעיות ביצועים</li>
                  <li>נזקים הנובעים משימוש או מחוסר יכולת להשתמש באפליקציה</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                👤 שימוש אחראי והתחייבויות משתמש
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "12px" }}>בעצם השימוש באפליקציה, אתה מתחייב:</p>
                <ul style={{ paddingRight: "20px" }}>
                  <li style={{ marginBottom: "8px" }}>שלא להעלות תוכן פוגעני, מעליב, גזעני, מיני או בלתי חוקי</li>
                  <li style={{ marginBottom: "8px" }}>שלא להפר זכויות קניין רוחני של אחרים (כגון רישום שירים המפרים זכויות יוצרים)</li>
                  <li style={{ marginBottom: "8px" }}>שלא להשתמש באפליקציה לשם הטרדה, איומים או ספאם</li>
                  <li style={{ marginBottom: "8px" }}>שלא לבצע מעשה שעלול לפגוע באבטחה, זמינות או תקינות האפליקציה</li>
                  <li style={{ marginBottom: "8px" }}>שלא להתחזות למשתמש אחר או לספק מידע כוזב</li>
                  <li style={{ marginBottom: "8px" }}>לשמור על פרטי הגישה שלך (אם רלוונטי) בסודיות</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                © זכויות יוצרים וקניין רוחני
              </h3>
              <div 
                style={{ 
                  padding: "20px", 
                  background: "rgba(0, 202, 255, 0.1)", 
                  borderRadius: "16px",
                  border: "2px solid rgba(0, 202, 255, 0.3)"
                }}
              >
                <p style={{ color: "#cbd5e1", marginBottom: "12px" }}>
                  <strong style={{ color: "#00caff", fontSize: "1.1rem" }}>
                    © 2025 אמיר (ת.ז. 203687355) - כל הזכויות שמורות
                  </strong>
                </p>
                <p style={{ color: "#cbd5e1" }}>
                  כל התוכן, העיצוב, הקוד, הלוגו ("APIRYON"), הפונקציונליות והמראה החזותי של האפליקציה 
                  מוגנים בחוקי זכויות יוצרים, סימני מסחר וקניין רוחני במדינת ישראל ובעולם. 
                  כל שימוש, העתקה או שכפול ללא אישור בכתב מהווה הפרה של חוקי זכויות יוצרים 
                  ועלול לגרור הליכים משפטיים.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                🔄 שינויים בתנאי השימוש
              </h3>
              <p style={{ color: "#cbd5e1" }}>
                הבעלים שומר לעצמו את הזכות לעדכן, לשנות או להחליף תנאים אלה בכל עת וללא הודעה מוקדמת. 
                המשך שימוש באפליקציה לאחר ביצוע שינויים מהווה הסכמה אוטומטית לתנאים המעודכנים. 
                מומלץ לבדוק עמוד זה מעת לעת.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                ⚖️ סמכות שיפוט וחוק החל
              </h3>
              <p style={{ color: "#cbd5e1" }}>
                הסכם זה כפוף לדיני מדינת ישראל בלבד. כל סכסוך, מחלוקת או תביעה הנובעים מהסכם זה 
                או מהשימוש באפליקציה יהיו נתונים לסמכות השיפוט הבלעדית והייחודית של בתי המשפט 
                המוסמכים במחוז תל אביב, ישראל.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                📞 יצירת קשר ובקשות
              </h3>
              <div 
                style={{ 
                  padding: "16px", 
                  background: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "12px",
                  border: "1px solid rgba(0, 202, 255, 0.2)"
                }}
              >
                <p style={{ color: "#cbd5e1", marginBottom: "8px" }}>
                  לכל שאלה, בירור, בקשה למחיקת מידע, דיווח על הפרה, או נושא משפטי אחר:
                </p>
                <ul style={{ paddingRight: "20px", color: "#cbd5e1" }}>
                  <li>ניתן ליצור קשר עם הבעלים דרך פרטי הקשר שבמועדון "האפריון"</li>
                  <li>או באמצעות קבוצת הווטסאפ המצורפת באפליקציה</li>
                  <li>מייל: ניתן לבקש דרך המועדון</li>
                </ul>
              </div>
            </section>

            <div 
              style={{
                marginTop: "32px",
                padding: "20px",
                background: "rgba(248, 113, 113, 0.1)",
                border: "2px solid rgba(248, 113, 113, 0.4)",
                borderRadius: "16px",
                fontSize: "0.95rem"
              }}
            >
              <div style={{ 
                fontSize: "1.2rem", 
                fontWeight: "700", 
                color: "#fca5a5", 
                marginBottom: "12px",
                textAlign: "center"
              }}>
                ⚠️ אזהרה חשובה
              </div>
              <p style={{ color: "#fca5a5", textAlign: "center", lineHeight: "1.7" }}>
                הפרת תנאי שימוש אלה עלולה להוביל לחסימה מיידית מהאפליקציה, 
                ביטול גישה, ונקיטת הליכים משפטיים אזרחיים ו/או פליליים נגדך, 
                לרבות תביעות לפיצויים ואכיפה משפטית של זכויות הקניין הרוחני.
              </p>
            </div>

            <div style={{ 
              marginTop: "32px", 
              paddingTop: "24px", 
              borderTop: "1px solid rgba(0, 202, 255, 0.2)",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "0.9rem"
            }}>
              <p>מסמך זה עודכן לאחרונה: דצמבר 2025</p>
              <p style={{ marginTop: "8px" }}>
                © 2025 אמיר (ת.ז. 203687355) | האפריון - מערכת קריוקי
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}