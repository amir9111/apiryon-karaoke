import React from "react";
import ApyironLogo from "../components/ApyironLogo";
import NavigationMenu from "../components/NavigationMenu";

export default function ManualQueue() {
  const handlePrint = () => {
    window.print();
  };

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
          🖨️ הדפס דפים
        </button>
      </div>

      {/* A4 Page Container */}
      <div style={{
        maxWidth: "210mm",
        margin: "0 auto",
        background: "#fff",
        padding: "10mm",
        minHeight: "297mm"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5mm"
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <div key={num} style={{
              border: "2px dashed #00caff",
              borderRadius: "8px",
              padding: "8mm",
              background: "#f8fafc",
              pageBreakInside: "avoid"
            }}>
              {/* Logo */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "8mm"
              }}>
                <div style={{ transform: "scale(0.6)" }}>
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

              {/* Card Number */}
              <div style={{
                textAlign: "center",
                marginTop: "5mm",
                fontSize: "0.7rem",
                color: "#94a3b8"
              }}>
                כרטיס #{num}
              </div>
            </div>
          ))}
        </div>
      </div>

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