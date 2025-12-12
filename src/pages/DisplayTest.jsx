import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function DisplayTest() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  
  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  };

  useEffect(() => {
    addLog("✅ Component mounted");
    
    addLog("🔄 Trying to fetch data...");
    base44.entities.KaraokeRequest.list('-created_date', 5)
      .then(data => {
        addLog(`✅ Data fetched successfully: ${data.length} items`);
      })
      .catch(err => {
        addLog(`❌ Error fetching data: ${err.message}`);
        setError(err.message);
      });
  }, []);

  return (
    <div dir="rtl" style={{ 
      background: "#020617", 
      color: "#fff", 
      minHeight: "100vh", 
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "2rem", color: "#00caff", marginBottom: "20px" }}>🔧 דף בדיקה</h1>
      
      <div style={{ 
        background: "rgba(0, 202, 255, 0.1)", 
        border: "2px solid #00caff", 
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px"
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>📋 לוג אירועים:</h2>
        {logs.map((log, i) => (
          <div key={i} style={{ 
            padding: "8px", 
            background: "rgba(255,255,255,0.05)",
            marginBottom: "5px",
            borderRadius: "6px",
            fontFamily: "monospace"
          }}>
            <span style={{ color: "#94a3b8" }}>[{log.time}]</span> {log.message}
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          background: "rgba(248, 113, 113, 0.2)",
          border: "2px solid #f87171",
          borderRadius: "12px",
          padding: "20px",
          color: "#fca5a5"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>❌ שגיאה:</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{error}</pre>
        </div>
      )}
    </div>
  );
}