import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Shield, Download, Calendar, User, Activity } from "lucide-react";
import ApyironLogo from "../components/ApyironLogo";
import NavigationMenu from "../components/NavigationMenu";

export default function AdminLogs() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const currentUser = await base44.auth.me();
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    checkAuth();
    return () => { mounted = false; };
  }, []);

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: () => base44.entities.AdminLog.list('-created_date', 500),
    refetchInterval: 10000,
    enabled: user?.role === 'admin'
  });

  const handleBackupNow = async () => {
    if (!confirm('לבצע גיבוי מלא של המערכת כעת?')) return;
    
    setIsBackingUp(true);
    try {
      const result = await base44.functions.invoke('dailyBackup');
      
      if (result.data.success) {
        // הורדת הקובץ
        const link = document.createElement('a');
        link.href = result.data.backup_url;
        link.download = `apiryon-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`✅ גיבוי הושלם!\n\n📊 סטטיסטיקה:\n• ${result.data.stats.total_karaoke_requests} בקשות קריוקי\n• ${result.data.stats.total_songs} שירים\n• ${result.data.stats.total_gallery_images} תמונות`);
      }
    } catch (error) {
      alert('❌ שגיאה בגיבוי: ' + error.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  if (loading || logsLoading) {
    return (
      <div dir="rtl" style={{ background: "#020617", color: "#e5e7eb", minHeight: "100vh", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <NavigationMenu />
        <div style={{ fontSize: "1.2rem" }}>טוען...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div dir="rtl" style={{ background: "#020617", color: "#e5e7eb", minHeight: "100vh", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <NavigationMenu />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>🚫</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "600" }}>אין לך הרשאה</div>
        </div>
      </div>
    );
  }

  const actionTypeColors = {
    delete: { bg: "rgba(248, 113, 113, 0.1)", border: "rgba(248, 113, 113, 0.3)", text: "#f87171" },
    update: { bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.3)", text: "#fbbf24" },
    create: { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)", text: "#10b981" },
    reset: { bg: "rgba(248, 113, 113, 0.15)", border: "rgba(248, 113, 113, 0.4)", text: "#f87171" },
    upload: { bg: "rgba(139, 92, 246, 0.1)", border: "rgba(139, 92, 246, 0.3)", text: "#a78bfa" },
    other: { bg: "rgba(148, 163, 184, 0.1)", border: "rgba(148, 163, 184, 0.3)", text: "#94a3b8" }
  };

  const actionTypeLabels = {
    delete: "🗑️ מחיקה",
    update: "✏️ עדכון",
    create: "➕ יצירה",
    reset: "🔄 איפוס",
    upload: "📤 העלאה",
    other: "📋 אחר"
  };

  return (
    <div dir="rtl" style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", color: "#f1f5f9", minHeight: "100vh", padding: "20px" }}>
      <NavigationMenu />
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <ApyironLogo size="small" showCircle={false} />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 8px 0", color: "#00caff", textShadow: "0 0 20px rgba(0, 202, 255, 0.5)" }}>
            🔒 לוג אבטחה ומערכת
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            כל פעולות המנהלים במערכת
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "24px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={handleBackupNow}
            disabled={isBackingUp}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: isBackingUp ? "rgba(100, 116, 139, 0.5)" : "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: "700",
              cursor: isBackingUp ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)"
            }}
          >
            <Download className="w-5 h-5" />
            {isBackingUp ? "מבצע גיבוי..." : "💾 גיבוי מלא עכשיו"}
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <div style={{
            background: "rgba(0, 202, 255, 0.1)",
            border: "1px solid rgba(0, 202, 255, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center"
          }}>
            <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: "#00caff" }} />
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#00caff" }}>{logs.length}</div>
            <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>סה"כ פעולות</div>
          </div>

          <div style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center"
          }}>
            <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: "#10b981" }} />
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#10b981" }}>
              {new Set(logs.map(l => l.admin_email)).size}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>מנהלים פעילים</div>
          </div>
        </div>

        {/* Logs List */}
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(0, 202, 255, 0.2)",
          borderRadius: "20px",
          padding: "24px"
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f1f5f9", marginBottom: "20px" }}>
            📜 רשומות אחרונות
          </h2>

          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              אין רשומות עדיין
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {logs.map((log) => {
                const colors = actionTypeColors[log.action_type] || actionTypeColors.other;
                return (
                  <div
                    key={log.id}
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "12px",
                      padding: "16px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          padding: "8px 16px",
                          background: colors.bg,
                          border: `2px solid ${colors.border}`,
                          borderRadius: "8px",
                          color: colors.text,
                          fontSize: "0.85rem",
                          fontWeight: "700"
                        }}>
                          {actionTypeLabels[log.action_type] || log.action_type}
                        </div>
                        <div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", color: "#f1f5f9" }}>
                            {log.action_description}
                          </div>
                          {log.entity_type && (
                            <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>
                              📦 {log.entity_type}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "left", fontSize: "0.85rem", color: "#64748b" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          <User className="w-4 h-4" />
                          {log.admin_name || log.admin_email}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Calendar className="w-4 h-4" />
                          {new Date(log.created_date).toLocaleString('he-IL')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}