import React from "react";
import ApyironLogo from "../components/ApyironLogo";
import NavigationMenu from "../components/NavigationMenu";

export default function ManualQueue() {
  const [numPages, setNumPages] = React.useState(1);
  const [startNumber, setStartNumber] = React.useState(1);
  const todayDate = new Date().toISOString().split('T')[0];

  React.useEffect(() => {
    try {
      const savedLastDate = localStorage.getItem('manual_queue_last_date') || "";
      const savedLastNumber = parseInt(localStorage.getItem('manual_queue_last_number') || "0");

      // אם התאריך זהה, המשך מהמספר האחרון
      if (todayDate === savedLastDate) {
        setStartNumber(savedLastNumber + 1);
      } else {
        setStartNumber(1);
      }
    } catch (e) {
      // silent fail
    }
  }, [todayDate]);

  const handlePrint = () => {
    try {
      localStorage.setItem('manual_queue_last_date', todayDate);
      localStorage.setItem('manual_queue_last_number', (startNumber + totalCards - 1).toString());
    } catch (e) {
      // silent fail
    }
    window.print();
  };

  const totalCards = numPages * 4;
  const allCardNumbers = Array.from({ length: totalCards }, (_, i) => startNumber + i);

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#fff",
      padding: "20px"
    }}>
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10000 }} className="no-print">
        <NavigationMenu />
      </div>

      <div className="no-print" style={{
        maxWidth: "900px",
        margin: "0 auto 30px",
        textAlign: "center"
      }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: "900",
          background: "linear-gradient(135deg, #00caff, #0088ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "15px"
        }}>
          ניהול קריוקי ידני
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: "1.1rem", marginBottom: "25px" }}>
          הדפס דפים אלו, גזור לכרטיסים קטנים וחלק בין האנשים למילוי ידני
        </p>

        <div style={{
          background: "rgba(15, 23, 42, 0.9)",
          borderRadius: "16px",
          padding: "25px",
          marginBottom: "25px",
          border: "2px solid rgba(0, 202, 255, 0.3)",
          maxWidth: "500px",
          margin: "0 auto 25px"
        }}>
          <div style={{
            padding: "12px",
            background: "rgba(251, 191, 36, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            textAlign: "center"
          }}>
            <div style={{ color: "#fbbf24", fontSize: "0.9rem", fontWeight: "600" }}>
              📝 המספור יתחיל מ-{startNumber} ויסתיים ב-{startNumber + totalCards - 1}
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "15px",
          marginBottom: "20px"
        }}>
          <label style={{ color: "#cbd5e1", fontSize: "1rem", fontWeight: "600" }}>
            כמות דפים:
          </label>
          <select
            value={numPages}
            onChange={(e) => setNumPages(parseInt(e.target.value))}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "2px solid rgba(0, 202, 255, 0.3)",
              background: "rgba(15, 23, 42, 0.9)",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            {Array.from({ length: 50 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} דפים ({n * 4} כרטיסים)</option>
            ))}
          </select>
        </div>

        <button
          onClick={handlePrint}
          style={{
            padding: "14px 32px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #00caff, #0088ff)",
            color: "#001a2e",
            fontSize: "1.1rem",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(0, 202, 255, 0.4)"
          }}
        >
          🖨️ הדפס {totalCards} כרטיסים
        </button>
      </div>

      {/* A4 Pages Container */}
      {Array.from({ length: numPages }, (_, pageIndex) => (
        <div key={pageIndex} style={{
          maxWidth: "210mm",
          margin: "0 auto",
          background: "#fff",
          padding: "10mm",
          minHeight: "297mm",
          pageBreakAfter: pageIndex < numPages - 1 ? "always" : "auto"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5mm"
          }}>
            {allCardNumbers.slice(pageIndex * 4, (pageIndex + 1) * 4).map((num) => (
            <div key={num} style={{
              border: "2px dashed #00caff",
              borderRadius: "8px",
              padding: "8mm",
              background: "#f8fafc",
              pageBreakInside: "avoid",
              position: "relative"
            }}>
              {/* מספר סידורי בפינה */}
              <div style={{
                position: "absolute",
                top: "3mm",
                left: "3mm",
                width: "12mm",
                height: "12mm",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00caff, #0088ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                fontWeight: "900",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(0, 202, 255, 0.3)"
              }}>
                {num}
              </div>

              {/* כותרת */}
              <div style={{
                textAlign: "center",
                marginBottom: "5mm",
                paddingBottom: "4mm",
                borderBottom: "2px solid #00caff"
              }}>
                <div style={{
                  fontSize: "1.1rem",
                  fontWeight: "900",
                  color: "#00caff",
                  marginBottom: "2mm",
                  letterSpacing: "0.02em"
                }}>
                  🎤 רישום לתור קריוקי 🎤
                </div>
                <div style={{
                  fontSize: "0.7rem",
                  color: "#64748b",
                  fontWeight: "600"
                }}>
                  📅 {new Date(todayDate).toLocaleDateString('he-IL', { 
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Logo */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "6mm"
              }}>
                <div style={{ transform: "scale(0.5)" }}>
                  <ApyironLogo size="small" showCircle={true} />
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6mm" }}>
                {/* שם המבצע */}
                <div>
                  <div style={{
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    color: "#00caff",
                    marginBottom: "3mm"
                  }}>
                    שם המבצע:
                  </div>
                  <div style={{
                    borderBottom: "2px solid #cbd5e1",
                    height: "8mm"
                  }}></div>
                </div>

                {/* שם הזמר */}
                <div>
                  <div style={{
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    color: "#00caff",
                    marginBottom: "3mm"
                  }}>
                    שם הזמר:
                  </div>
                  <div style={{
                    borderBottom: "2px solid #cbd5e1",
                    height: "8mm"
                  }}></div>
                </div>

                {/* שם השיר */}
                <div>
                  <div style={{
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    color: "#00caff",
                    marginBottom: "3mm"
                  }}>
                    שם השיר:
                  </div>
                  <div style={{
                    borderBottom: "2px solid #cbd5e1",
                    height: "8mm"
                  }}></div>
                </div>
              </div>

              {/* הנחיות מילוי */}
              <div style={{
                marginTop: "5mm",
                padding: "3mm",
                background: "rgba(0, 202, 255, 0.05)",
                borderRadius: "4px",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: "0.65rem",
                  color: "#64748b",
                  fontWeight: "600",
                  lineHeight: "1.4"
                }}>
                  ✍️ אנא מלא בכתב יד ברור וקריא
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>
      ))}

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

ManualQueue.isPublic = false;