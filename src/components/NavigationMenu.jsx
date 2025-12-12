import React, { useState, useEffect } from "react";
import { Menu, X, Tv, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function NavigationMenu() {
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

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "12px",
          border: "none",
          background: "rgba(15, 23, 42, 0.95)",
          color: "#00caff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          boxShadow: "0 0 20px rgba(0, 202, 255, 0.3)",
          border: "1px solid rgba(0, 202, 255, 0.3)"
        }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
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
            zIndex: 9998
          }}
        />
      )}

      {/* Side Menu */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : "-300px",
          width: "280px",
          height: "100vh",
          background: "rgba(15, 23, 42, 0.98)",
          boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.5)",
          zIndex: 9999,
          transition: "right 0.3s ease",
          padding: "80px 20px 20px 20px",
          borderLeft: "1px solid rgba(0, 202, 255, 0.3)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {user?.role === 'admin' && (
            <Link
              to={createPageUrl("Admin")}
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 20px",
                borderRadius: "12px",
                background: "rgba(0, 202, 255, 0.1)",
                border: "1px solid rgba(0, 202, 255, 0.3)",
                color: "#00caff",
                textDecoration: "none",
                fontSize: "1.1rem",
                fontWeight: "600",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 202, 255, 0.2)";
                e.currentTarget.style.transform = "translateX(-5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 202, 255, 0.1)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <Shield className="w-5 h-5" />
              <span>ניהול קריוקי</span>
            </Link>
          )}

          <Link
            to={createPageUrl("Audience")}
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 20px",
              borderRadius: "12px",
              background: "rgba(0, 202, 255, 0.1)",
              border: "1px solid rgba(0, 202, 255, 0.3)",
              color: "#00caff",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 202, 255, 0.2)";
              e.currentTarget.style.transform = "translateX(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 202, 255, 0.1)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <Tv className="w-5 h-5" />
            <span>מסך קהל</span>
          </Link>
        </div>
      </div>
    </>
  );
}