import React, { useState, useEffect } from "react";

export default function DisplayTest() {
  const [logs, setLogs] = useState(["🚀 קובץ נטען"]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    addLog("✅ Component mounted - useEffect started");
    
    // Test 1: Check if base44 exists
    addLog("🔍 בודק אם base44 זמין...");
    
    import("@/api/base44Client").then(module => {
      addLog("✅ base44Client imported successfully");
      const base44 = module.base44;
      
      if (!base44) {
        addLog("❌ base44 is undefined!");
        setError("base44 is undefined");
        return;
      }
      
      addLog("✅ base44 object exists");
      addLog("🔍 בודק אם base44.entities זמין...");
      
      if (!base44.entities) {
        addLog("❌ base44.entities is undefined!");
        setError("base44.entities is undefined");
        return;
      }
      
      addLog("✅ base44.entities exists");
      addLog("🔍 בודק אם KaraokeRequest זמין...");
      
      if (!base44.entities.KaraokeRequest) {
        addLog("❌ KaraokeRequest entity not found!");
        setError("KaraokeRequest entity not found");
        return;
      }
      
      addLog("✅ KaraokeRequest entity exists");
      addLog("🔄 מנסה לטעון נתונים...");
      
      base44.entities.KaraokeRequest.list('-created_date', 5)
        .then(result => {
          addLog(`✅ SUCCESS! Fetched ${result.length} items`);
          setData(result);
        })
        .catch(err => {
          addLog(`❌ FETCH ERROR: ${err.message}`);
          addLog(`Error stack: ${err.stack}`);
          setError({
            message: err.message,
            stack: err.stack,
            name: err.name
          });
        });
    }).catch(importErr => {
      addLog(`❌ IMPORT ERROR: ${importErr.message}`);
      setError({
        message: importErr.message,
        stack: importErr.stack
      });
    });
  }, []);

  return (
    <div dir="rtl" style={{ 
      background: "#020617", 
      color: "#fff", 
      minHeight: "100vh", 
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "rgba(0, 202, 255, 0.2)",
        border: "3px solid #00caff",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "20px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "2.5rem", color: "#00caff", marginBottom: "10px" }}>🔧 מסך בדיקה מפורט</h1>
        <p style={{ fontSize: "1rem", color: "#94a3b8" }}>כל הפעולות והלוגים להלן</p>
      </div>
      
      <div style={{ 
        background: "rgba(0, 202, 255, 0.1)", 
        border: "2px solid #00caff", 
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px"
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#00caff" }}>📋 לוג פעולות ({logs.length}):</h2>
        <div style={{ maxHeight: "400px", overflow: "auto" }}>
          {logs.map((log, i) => (
            <div key={i} style={{ 
              padding: "10px", 
              background: i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
              marginBottom: "3px",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "0.9rem",
              borderLeft: "3px solid #00caff"
            }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          background: "rgba(248, 113, 113, 0.2)",
          border: "3px solid #f87171",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "10px", color: "#f87171" }}>❌ שגיאה שנתפסה:</h2>
          <div style={{ 
            background: "rgba(0,0,0,0.3)", 
            padding: "15px", 
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "0.85rem"
          }}>
            {typeof error === 'string' ? (
              <div>{error}</div>
            ) : (
              <>
                <div style={{ color: "#fca5a5", marginBottom: "10px" }}>
                  <strong>Message:</strong> {error.message}
                </div>
                {error.name && (
                  <div style={{ color: "#fca5a5", marginBottom: "10px" }}>
                    <strong>Name:</strong> {error.name}
                  </div>
                )}
                {error.stack && (
                  <div style={{ color: "#94a3b8" }}>
                    <strong>Stack:</strong>
                    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: "5px" }}>
                      {error.stack}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {data && (
        <div style={{
          background: "rgba(16, 185, 129, 0.2)",
          border: "3px solid #10b981",
          borderRadius: "12px",
          padding: "20px"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "10px", color: "#10b981" }}>✅ נתונים שהתקבלו:</h2>
          <div style={{ 
            background: "rgba(0,0,0,0.3)", 
            padding: "15px", 
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            maxHeight: "300px",
            overflow: "auto"
          }}>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#10b981" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}