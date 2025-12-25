import React from "react";
import ApyironLogo from "../components/ApyironLogo";
import NavigationMenu from "../components/NavigationMenu";

export default function ManualQueue() {
  const [numPages, setNumPages] = React.useState(1);
  const todayDate = new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  const totalCards = numPages * 4;

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
            gridTemplateRows: "1fr 1fr",
            gap: "5mm",
            height: "calc(297mm - 20mm)"
          }}>
            {Array.from({ length: 4 }).map((_, cardIndex) => (
          <div key={cardIndex} style={{
            border: "2px dashed #00caff",
            borderRadius: "6px",
            padding: "3mm",
            background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
            pageBreakInside: "avoid",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 2px 8px rgba(0, 202, 255, 0.15)"
          }}>

              {/* כותרת */}
              <div style={{
                textAlign: "center",
                marginBottom: "2mm",
                paddingBottom: "1.5mm",
                borderBottom: "1.5px solid #00caff"
              }}>
                <div style={{
                  fontSize: "0.7rem",
                  fontWeight: "900",
                  color: "#00caff",
                  marginBottom: "0.5mm",
                  letterSpacing: "0.02em"
                }}>
                  🎤 רישום לתור קריוקי 🎤
                </div>
                <div style={{
                  fontSize: "0.5rem",
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
                marginBottom: "2mm",
                background: "rgba(0, 202, 255, 0.08)",
                padding: "1mm",
                borderRadius: "4px"
              }}>
                <div style={{ transform: "scale(0.3)" }}>
                  <ApyironLogo size="small" showCircle={true} />
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5mm", flex: 1 }}>
                {/* שם המבצע */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "1.5mm",
                  borderRadius: "3px",
                  border: "1px solid rgba(0, 202, 255, 0.2)"
                }}>
                  <div style={{
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: "#00caff",
                    marginBottom: "1mm",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5mm"
                  }}>
                    <span style={{ fontSize: "0.75rem" }}>👤</span>
                    שם המבצע:
                  </div>
                  <div style={{
                    borderBottom: "1.5px solid #00caff",
                    height: "5mm"
                  }}></div>
                </div>

                {/* שם השיר */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "1.5mm",
                  borderRadius: "3px",
                  border: "1px solid rgba(0, 202, 255, 0.2)"
                }}>
                  <div style={{
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: "#00caff",
                    marginBottom: "1mm",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5mm"
                  }}>
                    <span style={{ fontSize: "0.75rem" }}>🎵</span>
                    שם השיר:
                  </div>
                  <div style={{
                    borderBottom: "1.5px solid #00caff",
                    height: "5mm"
                  }}></div>
                </div>

                {/* שם הזמר */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "1.5mm",
                  borderRadius: "3px",
                  border: "1px solid rgba(0, 202, 255, 0.2)"
                }}>
                  <div style={{
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: "#00caff",
                    marginBottom: "1mm",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5mm"
                  }}>
                    <span style={{ fontSize: "0.75rem" }}>🎸</span>
                    שם הזמר:
                  </div>
                  <div style={{
                    borderBottom: "1.5px solid #00caff",
                    height: "5mm"
                  }}></div>
                </div>
              </div>

              {/* QR Code + שיווק */}
              <div style={{
                marginTop: "2mm",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.5mm",
                padding: "1.5mm",
                background: "rgba(0, 202, 255, 0.05)",
                borderRadius: "3px"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "0.55rem",
                    fontWeight: "700",
                    color: "#00caff",
                    marginBottom: "0.5mm",
                    lineHeight: "1.2"
                  }}>
                    🎤 הצטרפו לערבי קריוקי
                  </div>
                  <div style={{
                    fontSize: "0.45rem",
                    color: "#64748b",
                    fontWeight: "600"
                  }}>
                    סרקו להצטרפות לקבוצה
                  </div>
                </div>
                <div style={{
                  width: "12mm",
                  height: "12mm",
                  background: "#fff",
                  padding: "0.5mm",
                  borderRadius: "2px",
                  border: "1px solid #00caff"
                }}>
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
                    style={{ width: "100%", height: "100%", display: "block" }}
                    alt="QR"
                  />
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