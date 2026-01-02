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
            {/* הקדמה */}
            <div style={{ 
              marginBottom: "32px", 
              padding: "20px", 
              background: "rgba(251, 191, 36, 0.1)", 
              borderRadius: "12px",
              border: "2px solid rgba(251, 191, 36, 0.3)"
            }}>
              <p style={{ color: "#fbbf24", fontWeight: "700", fontSize: "1.1rem", marginBottom: "12px" }}>
                ⚠️ חשוב לקרוא בעיון
              </p>
              <p style={{ color: "#cbd5e1" }}>
                תקנון זה מהווה הסכם משפטי מחייב בינך לבין מועדון אפריון. קריאת התקנון והכניסה למועדון מהווים הסכמה מפורשת לכל תנאיו. אם אינך מסכים לתנאים אלו, אנא אל תיכנס למקום.
              </p>
            </div>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ 
                color: "#00caff", 
                fontSize: "1.4rem", 
                marginBottom: "16px", 
                fontWeight: "700",
                textShadow: "0 0 15px rgba(0, 202, 255, 0.3)"
              }}>
                1️⃣ הגדרות וכללי
              </h2>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>1.1.</strong> "המועדון" – מועדון אפריון (Apiryon Club), לרבות כל שטחיו, מתקניו וציודו.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>1.2.</strong> "המבלה" – כל אדם הנכנס לשטח המועדון, בין אם שילם דמי כניסה ובין אם לאו.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>1.3.</strong> הוראות תקנון זה חלות על כל אדם הנכנס לשטח המועדון ו/או המבצע הזמנת מקום בכל דרך שהיא (באתר, בטלפון, בהודעת WhatsApp וכו').
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>1.4.</strong> עצם הכניסה למועדון, רכישת כרטיס, ביצוע הזמנה או השתתפות בפעילות כלשהי במועדון מהווים הסכמה מלאה, בלתי חוזרת ובלתי מסויגת לכל תנאי התקנון.
                </p>
                <p>
                  <strong>1.5.</strong> הנהלת המועדון שומרת לעצמה את הזכות המלאה לשנות, לעדכן או לתקן את התקנון בכל עת וללא הודעה מוקדמת. על המבלים לעיין בתקנון המעודכן טרם כל כניסה למועדון.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                2️⃣ כניסה, גיל וזכות סירוב
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>2.1.</strong> הכניסה למועדון מותרת אך ורק לבני 18 שנה ומעלה. יש להציג תעודה מזהה רשמית ותקפה (תעודת זהות, דרכון או רישיון נהיגה) בכניסה ובכל עת לפי דרישת צוות המועדון או האבטחה.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>2.2.</strong> הנהלת המועדון, צוות האבטחה (הדורמן) והמנהלים שומרים על זכותם הבלעדית והמוחלטת למנוע כניסה של כל אדם למועדון ו/או להרחיק מבלה מהמקום בכל עת, מכל סיבה שהיא, לפי שיקול דעתם הבלעדי, לרבות: שכרות, התנהגות בלתי הולמת, אלימות, אי-עמידה בקוד הלבוש, חשד להפרעה לסדר או כל סיבה אחרת – וזאת ללא צורך במתן הסבר וללא זכות להחזר כספי.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>2.3.</strong> תשלום דמי הכניסה ("תשלום לדורמן") או תשלום מקדמה הינם עבור הכניסה, האווירה והשירות במועדון בלבד, ואינם ניתנים להחזרה במקרה של עזיבה מוקדמת, סירוב כניסה או הרחקה מהמקום מכל סיבה שהיא.
                </p>
                <p>
                  <strong>2.4.</strong> המועדון אינו מקום ציבורי לכל דבר ועניין. הכניסה אליו הינה בהסכמת בעל המקום בלבד, והמבלה אינו רשאי לתבוע "זכות כניסה" או להתלונן על אפליה במידה ונמנעה כניסתו.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                3️⃣ התנהגות, בטיחות ואיסורים
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>3.1.</strong> חל איסור מוחלט וללא יוצא מן הכלל על הכנסת נשק, סמים מכל סוג, חפצים חדים, כלי נשק לבנים, חומרי נפץ, גז מדמיע או כל חומר מסוכן אחר לשטח המועדון. הכנסת פריטים אלו תגרור הרחקה מיידית, מסירה למשטרה והגשת תביעה פלילית.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>3.2.</strong> המועדון נוקט במדיניית "אפס סובלנות" כלפי אלימות פיזית או מילולית, הטרדות מיניות, הטרדות מכל סוג שהוא, גזענות, קללות בוטות כלפי הצוות או המבלים, או התנהגות המסכנת את בטיחות ונוחות יתר המבלים. עבירה על סעיף זה תגרור הרחקה מיידית ודיווח לרשויות החוק, וכן תביעה אזרחית ו/או פלילית לפי העניין.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>3.3.</strong> על המבלים לנהוג בכבוד כלפי צוות המועדון, המאבטחים, הברמנים, הזמרים האחרים והמבלים האחרים. כל התנהגות פוגענית או מעליבה תגרום להרחקה מיידית.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>3.4.</strong> יש להישמע להוראות צוות המועדון, המאבטחים והמנהלים בכל עת ובלא דיחוי. אי ציות להוראות הצוות מהווה עילה להרחקה מיידית.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>3.5.</strong> חל איסור מוחלט על עישון במקומות סגורים בהתאם לחוק. עישון מותר אך ורק במקומות המיועדים לכך. עבירה על איסור זה תגרור הרחקה וקנס כחוק.
                </p>
                <p>
                  <strong>3.6.</strong> חל איסור על כניסה עם חיות מחמד למועדון, למעט כלבי נחייה מאומנים לבעלי מוגבלויות.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                4️⃣ אלכוהול, משקאות ומזון
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>4.1.</strong> מכירת משקאות אלכוהוליים אסורה בהחלט למי שטרם מלאו לו 18 שנים. הברמנים רשאים ומחויבים לדרוש תעודה מזהה בכל הזמנת משקה המכיל אלכוהול.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>4.2.</strong> הנהלת המועדון והברמנים רשאים לסרב להגיש משקאות אלכוהוליים למבלה הנראה במצב של שכרות, על פי שיקול דעתם המקצועי והבלעדי, וזאת לשם שמירה על בטיחותו, בריאותו וביטחון יתר המבלים.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>4.3.</strong> חל איסור מוחלט על הכנסת משקאות אלכוהוליים, משקאות קלים או מזון מבחוץ לשטח המועדון. עבירה על סעיף זה תגרור הרחקה מיידית ללא זכות החזר.
                </p>
                <p>
                  <strong>4.4.</strong> המועדון אינו נושא באחריות כלשהי לתופעות לוואי, שיכרון, מצבי חירום רפואיים או תאונות הנובעים מצריכת אלכוהול במועדון. כל מבלה אחראי לצריכתו האישית.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                5️⃣ נזקים, ציוד ורכוש המועדון
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>5.1.</strong> המבלה אחראי באופן אישי, מלא ובלעדי לכל נזק שייגרם לרכוש המועדון (לרבות: מיקרופונים, מסכים, רמקולים, מערכות הגברה, רהיטים, כיסאות, שולחנות, קישוטים, ציוד מטבח, כלים וכל ציוד אחר) כתוצאה מרשלנותו, אי זהירות או זדון.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>5.2.</strong> במקרה של נזק, המועדון רשאי לחייב את המבלה בעלות התיקון המלאה או עלות החלפת הציוד החדש, לפי המחיר המקורי, וכן בהוצאות נוספות שייגרמו למועדון כתוצאה מהנזק. התשלום יבוצע באופן מיידי או באמצעות הליכים משפטיים.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>5.3.</strong> השימוש במערכות הקריוקי, מיקרופונים ומסכים יעשה אך ורק בהתאם להוראות הצוות ובאישורם. אין לנתק, להזיז או לשנות הגדרות של ציוד טכני ללא אישור מפורש מהמנהל.
                </p>
                <p>
                  <strong>5.4.</strong> חל איסור על גרימת רעש מופרז, זריקת חפצים, ריקודים בלתי מבוקרים או שימוש בציוד באופן שעלול לגרום נזק.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                6️⃣ צילום, תיעוד ופרטיות
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>6.1.</strong> המועדון הינו מקום ציבורי מצולם באמצעות מצלמות אבטחה ומצלמי תוכן. בעצם כניסתך למקום, הנך מאשר/ת במפורש ובאופן בלתי חוזר להנהלת המועדון לצלם ולתעד אותך (צילום סטילס, צילום וידאו, הקלטות שמע) ולעשות שימוש חופשי בחומרים אלו לצרכי פרסום, שיווק, יחסי ציבור, פרסום ברשתות חברתיות (אינסטגרם, פייסבוק, טיקטוק, יוטיוב וכו'), פרסום באתרי אינטרנט, חומרי דפוס וכל מדיה אחרת, ללא תמורה כלשהי, ללא הגבלת זמן וללא צורך בקבלת אישור נוסף.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>6.2.</strong> במידה ואינך מעוניין/ת להופיע בפרסומים או בחומרי תיעוד, עליך להודיע על כך בכתב למנהל המועדון מיד עם הכניסה. המועדון ינסה להימנע מפרסום תמונותיך, אך אינו יכול להתחייב לכך באופן מוחלט בשל אופי האירועים.
                </p>
                <p>
                  <strong>6.3.</strong> מצלמות האבטחה במועדון פועלות 24/7 לצורכי בטחון. החומרים המתועדים עשויים להימסר לרשויות החוק במקרה של חקירה פלילית או אירוע אלימות.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                7️⃣ אחריות, חפצים אישיים ואבידות
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>7.1.</strong> הנהלת המועדון אינה נושאת בכל אחריות, בכל צורה שהיא, על אובדן, גניבה, נזק או השחתה של חפצים אישיים של המבלים (לרבות: טלפונים ניידים, ארנקים, תיקים, תכשיטים, מפתחות, בגדים, משקפיים וכל חפץ אחר).
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>7.2.</strong> המבלים נדרשים לשמור על חפציהם האישיים בכל עת. אין לשים חפצים על שולחנות ריקים או באזורים לא מפוקחים.
                </p>
                <p>
                  <strong>7.3.</strong> המועדון אינו מפעיל שירות מלתחה או שמירת חפצים, ואינו נושא באחריות לחפצים שהושארו במקום לאחר סיום האירוע.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                8️⃣ בריאות, חירום רפואי ואחריות
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>8.1.</strong> המבלה מצהיר כי הוא כשיר מבחינה בריאותית להשתתף באירועי המועדון, ואינו סובל ממצב רפואי המונע ממנו צריכת אלכוהול, ריקודים או פעילות גופנית.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>8.2.</strong> המועדון אינו נושא באחריות לכל פגיעה גופנית, מצב רפואי, התקף, נפילה, תאונה או כל מקרה חירום רפואי שיתרחש במהלך השהייה במקום, אלא אם נגרם כתוצאה מרשלנות חמורה של בעל המועדון או עובדיו.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>8.3.</strong> במקרה של חירום רפואי, הצוות יפעל לזימון אמבולנס. העלות הרפואית תחול על המבלה.
                </p>
                <p>
                  <strong>8.4.</strong> המבלה מתחייב להימנע מפעילות המסכנת את בריאותו או בריאות הזולת, ומצהיר כי הוא מודע לכך שצריכת אלכוהול יתרה עלולה לפגוע בשיפוט, בריאות ובטיחות.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                9️⃣ הזמנות שולחנות, ביטולים והחזרים כספיים
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>9.1.</strong> הזמנת שולחן מותנית בתיאום מראש עם הנהלת המועדון (טלפון, WhatsApp או אתר האינטרנט).
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>9.2.</strong> במידה ונדרשה תשלום מקדמה או דמי הזמנה, סכומים אלו אינם ניתנים להחזר במקרה של ביטול הזמנה פחות מ-48 שעות לפני מועד האירוע.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>9.3.</strong> ביטול הזמנה מעל 48 שעות מראש – המקדמה תוחזר בניכוי דמי טיפול של 10%.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>9.4.</strong> המועדון שומר לעצמו את הזכות לבטל הזמנה מסיבות תפעוליות (כוח עליון, אירוע פרטי, תקלה טכנית) ולהחזיר את התשלום במלואו.
                </p>
                <p>
                  <strong>9.5.</strong> שולחן שהוזמן נשמר למשך 15 דקות בלבד מהמועד המוסכם. לאחר מכן, המועדון רשאי להעמיד את השולחן לרשות מבלים אחרים ללא החזר כספי.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                🔟 קריוקי וזכויות יוצרים
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>10.1.</strong> המועדון פועל בהתאם לחוק זכויות יוצרים ומשלם תמלוגים לאקו"ם עבור ביצוע פומבי של יצירות מוגנות.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>10.2.</strong> המבלים רשאים לשיר שירים מתוך רשימת השירים המאושרת של המועדון בלבד.
                </p>
                <p>
                  <strong>10.3.</strong> המועדון שומר לעצמו את הזכות להגביל זמן ביצוע, מספר שירים או לדלג על שיר מסוים מטעמים תפעוליים או אם השיר פוגע ברגשות הציבור.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                1️⃣1️⃣ אחריות בגין נזקי צד שלישי
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>11.1.</strong> המבלה מתחייב לשפות את המועדון בגין כל תביעה, נזק, הוצאה או אובדן שייגרמו למועדון ו/או לצד שלישי כתוצאה מהתנהגות המבלה.
                </p>
                <p>
                  <strong>11.2.</strong> במידה ויגרם נזק למבלה אחר על ידי מבלה אחר, המועדון לא ישא באחריות והנפגע יפנה ישירות לגורם הפוגע.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                1️⃣2️⃣ סמכות שיפוט ודין החל
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>12.1.</strong> על תקנון זה יחול הדין הישראלי בלבד.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>12.2.</strong> סמכות השיפוט הבלעדית בכל סכסוך הנובע מתקנון זה תהא לבתי המשפט המוסמכים במחוז צפון (נצרת/עכו) בלבד.
                </p>
                <p>
                  <strong>12.3.</strong> על המבלה לפנות להנהלת המועדון תחילה בכל תלונה טרם פנייה לערכאות משפטיות.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                1️⃣3️⃣ תוקף ושינויים
              </h3>
              <div style={{ color: "#cbd5e1" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>13.1.</strong> תקנון זה תקף מיום פרסומו והוא מחליף כל הסכם, מצג או הבנה בע"פ או בכתב שהיו קודם לכן.
                </p>
                <p>
                  <strong>13.2.</strong> המועדון רשאי לשנות תקנון זה בכל עת. הגרסה המעודכנת תהיה זמינה באתר המועדון ובמקום עצמו.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h3 style={{ color: "#00caff", fontSize: "1.2rem", marginBottom: "12px", fontWeight: "700" }}>
                1️⃣4️⃣ הצהרת המבלה
              </h3>
              <div style={{ color: "#cbd5e1", background: "rgba(0, 202, 255, 0.05)", padding: "16px", borderRadius: "12px", border: "2px solid rgba(0, 202, 255, 0.2)" }}>
                <p style={{ marginBottom: "10px" }}>
                  בעצם הכניסה למועדון אני מצהיר/ה ומאשר/ת כי:
                </p>
                <p style={{ marginBottom: "8px" }}>✓ קראתי והבנתי את מלוא תנאי התקנון</p>
                <p style={{ marginBottom: "8px" }}>✓ אני מסכים/ה באופן מלא ובלתי חוזר לכל תנאי התקנון</p>
                <p style={{ marginBottom: "8px" }}>✓ אני מודע/ת לסיכונים הכרוכים בצריכת אלכוהול ובפעילות במועדון</p>
                <p style={{ marginBottom: "8px" }}>✓ אני בן/בת 18 ומעלה</p>
                <p style={{ marginBottom: "8px" }}>✓ אני כשיר/ה מבחינה בריאותית להשתתף בפעילות</p>
                <p>✓ אני מוותר/ת על כל תביעה כלפי המועדון בגין נושאים המפורטים בתקנון זה</p>
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
              <p style={{ fontSize: "1.2rem", color: "#00caff", marginBottom: "16px" }}>ט.ל.ח - טעות לעולם חוזרת</p>
              <p style={{ marginBottom: "12px", color: "#fbbf24" }}>
                ⚖️ תקנון זה מהווה הסכם משפטי מחייב
              </p>
              <p style={{ marginTop: "12px" }}>
                תנאי שימוש אלה נכנסו לתוקף ביום 2 בינואר 2026
              </p>
              <p style={{ marginTop: "8px" }}>
                © 2025-2026 מועדון אפריון (Apiryon Club) | כל הזכויות שמורות
              </p>
              <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "#64748b" }}>
                לשאלות או בעיות, צרו קשר: 052-540-0396
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}