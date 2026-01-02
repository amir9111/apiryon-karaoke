import React, { useState, useEffect } from "react";
import { Menu, X, Tv, Shield, BarChart3, UserPlus, Camera, Home, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function NavigationMenu({ onSummaryClick }) {
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
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", maxHeight: "calc(100vh - 100px)" }}>
          {/* Main Action */}
          <Link
            to={createPageUrl("Home")}
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 20px",
              borderRadius: "12px",
              background: "rgba(0, 202, 255, 0.15)",
              border: "2px solid rgba(0, 202, 255, 0.4)",
              color: "#00caff",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: "700",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 202, 255, 0.25)";
              e.currentTarget.style.transform = "translateX(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 202, 255, 0.15)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <Home className="w-5 h-5" />
            <span>🎤 רישום לקריוקי</span>
          </Link>

          {user?.role === 'admin' && (
            <>
              {/* Admin Section */}
              <div style={{ 
                fontSize: "0.75rem", 
                color: "#64748b", 
                fontWeight: "700", 
                marginTop: "20px",
                marginBottom: "8px",
                paddingRight: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                ניהול מנהל
              </div>

              <Link
                to={createPageUrl("Admin")}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(0, 202, 255, 0.08)",
                  border: "1px solid rgba(0, 202, 255, 0.2)",
                  color: "#00caff",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 202, 255, 0.15)";
                  e.currentTarget.style.transform = "translateX(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 202, 255, 0.08)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <Shield className="w-5 h-5" />
                <span>ניהול קריוקי</span>
              </Link>

              <Link
                to={createPageUrl("Statistics")}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(251, 191, 36, 0.08)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                  color: "#fbbf24",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(251, 191, 36, 0.15)";
                  e.currentTarget.style.transform = "translateX(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(251, 191, 36, 0.08)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <BarChart3 className="w-5 h-5" />
                <span>סטטיסטיקות</span>
              </Link>

              <Link
                to={createPageUrl("UserManagement")}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(139, 92, 246, 0.08)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  color: "#a78bfa",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                  e.currentTarget.style.transform = "translateX(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.08)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <Users className="w-5 h-5" />
                <span>משתמשים</span>
              </Link>

              {/* Display Screens Section */}
              <div style={{ 
                fontSize: "0.75rem", 
                color: "#64748b", 
                fontWeight: "700", 
                marginTop: "20px",
                marginBottom: "8px",
                paddingRight: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                מסכי תצוגה
              </div>

              <Link
                to={createPageUrl("Audience")}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(0, 202, 255, 0.08)",
                  border: "1px solid rgba(0, 202, 255, 0.2)",
                  color: "#00caff",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 202, 255, 0.15)";
                  e.currentTarget.style.transform = "translateX(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 202, 255, 0.08)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <Tv className="w-5 h-5" />
                <span>מסך קהל</span>
              </Link>
            </>
          )}

          {/* Public Section */}
          <div style={{ 
            fontSize: "0.75rem", 
            color: "#64748b", 
            fontWeight: "700", 
            marginTop: "20px",
            marginBottom: "8px",
            paddingRight: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            דפים כלליים
          </div>

          <Link
            to={createPageUrl("Landing")}
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(251, 191, 36, 0.08)",
              border: "1px solid rgba(251, 191, 36, 0.2)",
              color: "#fbbf24",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(251, 191, 36, 0.15)";
              e.currentTarget.style.transform = "translateX(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(251, 191, 36, 0.08)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <Home className="w-5 h-5" />
            <span>דף בית</span>
          </Link>

          <Link
            to={createPageUrl("Gallery")}
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.08)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              color: "#a78bfa",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
              e.currentTarget.style.transform = "translateX(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.08)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <Camera className="w-5 h-5" />
            <span>גלריה</span>
          </Link>

          <Link
            to={createPageUrl("UploadToScreen")}
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.08)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              color: "#a78bfa",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
              e.currentTarget.style.transform = "translateX(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.08)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <Tv className="w-5 h-5" />
            <span>העלאה למסך</span>
          </Link>
        </div>
      </div>
    </>
  );
}