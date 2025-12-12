import React, { useState, useEffect } from "react";
import { Menu, X, LogOut, Phone, Settings, FileText, User } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function MenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('apiryon_user_id');
    localStorage.removeItem('apiryon_visited');
    localStorage.removeItem('apiryon_terms_accepted');
    window.location.reload();
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00caff, #0088ff)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0, 202, 255, 0.4)",
          zIndex: 1000,
          transition: "transform 0.3s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {isOpen ? (
          <X className="w-7 h-7" style={{ color: "#001a2e" }} />
        ) : (
          <Menu className="w-7 h-7" style={{ color: "#001a2e" }} />
        )}
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 998
            }}
          />

          <div
            style={{
              position: "fixed",
              bottom: "90px",
              right: "20px",
              background: "rgba(15, 23, 42, 0.98)",
              borderRadius: "20px",
              padding: "16px",
              border: "2px solid rgba(0, 202, 255, 0.3)",
              boxShadow: "0 10px 40px rgba(0, 202, 255, 0.3)",
              zIndex: 999,
              minWidth: "280px",
              animation: "slideUp 0.3s ease-out"
            }}
            dir="rtl"
          >
            <style>{`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>

            {/* Contact Section */}
            <div style={{
              marginBottom: "12px",
              padding: "12px",
              background: "rgba(0, 202, 255, 0.08)",
              borderRadius: "12px",
              border: "1px solid rgba(0, 202, 255, 0.2)"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
                fontSize: "0.95rem",
                fontWeight: "700",
                color: "#00caff"
              }}>
                <Phone className="w-5 h-5" />
                צור קשר
              </div>
              <div style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: "1.8" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>הבעלים - יהושע דבוש:</strong>
                  <br />
                  <a href="tel:0525400396" style={{ color: "#00caff", textDecoration: "none" }}>
                    0525400396
                  </a>
                </div>
                <div>
                  <strong>בעל האתר - אמיר:</strong>
                  <br />
                  <a href="tel:0546238130" style={{ color: "#00caff", textDecoration: "none" }}>
                    0546238130
                  </a>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link
                to={createPageUrl("Profile")}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px",
                  background: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0, 202, 255, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(30, 41, 59, 0.5)"}
              >
                <User className="w-5 h-5" style={{ color: "#00caff" }} />
                הפרופיל שלי
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to={createPageUrl("Admin")}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    background: "rgba(30, 41, 59, 0.5)",
                    borderRadius: "10px",
                    textDecoration: "none",
                    color: "#e2e8f0",
                    fontSize: "0.9rem",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0, 202, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(30, 41, 59, 0.5)"}
                >
                  <Settings className="w-5 h-5" style={{ color: "#00caff" }} />
                  מסך ניהול
                </Link>
              )}

              <Link
                to={createPageUrl("Terms")}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px",
                  background: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0, 202, 255, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(30, 41, 59, 0.5)"}
              >
                <FileText className="w-5 h-5" style={{ color: "#00caff" }} />
                תנאי שימוש
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px",
                  background: "rgba(248, 113, 113, 0.1)",
                  borderRadius: "10px",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  color: "#f87171",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  width: "100%",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248, 113, 113, 0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)"}
              >
                <LogOut className="w-5 h-5" />
                התנתק מהמערכת
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}