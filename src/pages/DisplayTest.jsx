import React from "react";

export default function DisplayTest() {
  return (
    <div dir="rtl" style={{ 
      background: "#020617", 
      color: "#fff", 
      minHeight: "100vh", 
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "20px"
    }}>
      <h1 style={{ fontSize: "3rem", color: "#00caff" }}>בדיקה</h1>
      <p style={{ fontSize: "1.5rem" }}>אם אתה רואה את זה - הדף עובד!</p>
      <div style={{
        padding: "20px",
        background: "rgba(0, 202, 255, 0.1)",
        border: "2px solid #00caff",
        borderRadius: "12px"
      }}>
        <p>הזמן: {new Date().toLocaleTimeString('he-IL')}</p>
      </div>
    </div>
  );
}