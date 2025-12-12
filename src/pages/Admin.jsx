import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Check, SkipForward, UserPlus, Monitor, Settings, Music2, Users, TrendingUp } from "lucide-react";
import Logo from "../components/Logo";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    async function checkAuth() {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setLoading(false);
    }
    checkAuth();
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 3000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.KaraokeRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['karaoke-requests'] }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.KaraokeRequest.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['karaoke-requests'] }),
  });

  const setStatus = (id, status) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const goNextAuto = () => {
    const current = requests.find(r => r.status === "performing");
    const next = requests.find(r => r.status === "waiting");
    
    if (current) {
      updateMutation.mutate({ id: current.id, data: { status: "done" } });
    }
    if (next) {
      setTimeout(() => {
        updateMutation.mutate({ id: next.id, data: { status: "performing" } });
      }, 300);
    }
  };

  const markCurrentDone = () => {
    const current = requests.find(r => r.status === "performing");
    if (current) {
      updateMutation.mutate({ id: current.id, data: { status: "done" } });
    }
  };

  const addDemoSong = () => {
    createMutation.mutate({
      singer_name: "אורח חדש",
      song_title: "שיר בדיקה",
      song_artist: "",
      notes: "",
      status: "waiting"
    });
  };

  const now = requests.filter(r => r.status === "performing");
  const waiting = requests.filter(r => r.status === "waiting");
  const done = requests.filter(r => r.status === "done");
  const skipped = requests.filter(r => r.status === "skipped");
  const ordered = [...now, ...waiting, ...done, ...skipped];

  const currentSong = requests.find(r => r.status === "performing");
  const waitingList = requests.filter(r => r.status === "waiting");

  if (loading) {
    return (
      <div dir="rtl" style={{ background: "#020617", color: "#e5e7eb", minHeight: "100vh", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "1.2rem" }}>טוען...</div>
      </div>
    );
  }

  if (!user || user.email !== "amir.abu300@gmail.com") {
    return (
      <div dir="rtl" style={{ background: "#020617", color: "#e5e7eb", minHeight: "100vh", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>🚫</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px" }}>אין לך הרשאה</div>
          <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>רק המנהל יכול לגשת למסך הניהול</div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ background: "linear-gradient(to bottom, #0f172a, #020617)", color: "#f1f5f9", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <div style={{ marginBottom: "16px" }}>
            <Logo size="medium" showCircle={true} />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 8px 0", background: "linear-gradient(135deg, #00caff, #0088ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🎤 ניהול קריוקי
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
            ניהול מתקדם של תור השירים והזמרים
          </p>
          <div style={{ display: "inline-flex", gap: "12px", marginTop: "12px", padding: "8px 16px", background: "rgba(15,23,42,0.6)", borderRadius: "999px", border: "1px solid rgba(0,202,255,0.2)" }}>
            <span style={{ fontSize: "0.9rem" }}>⏳ {waiting.length} ממתינים</span>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>•</span>
            <span style={{ fontSize: "0.9rem" }}>✅ {done.length} בוצעו</span>
          </div>
        </div>

        <Tabs defaultValue="control" dir="rtl" style={{ width: "100%" }}>
          <TabsList style={{ display: "flex", gap: "8px", background: "rgba(15,23,42,0.8)", padding: "6px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.1)", marginBottom: "20px", width: "100%", justifyContent: "center" }}>
            <TabsTrigger value="control" style={{ flex: "0 1 auto", minWidth: "140px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem", padding: "10px 20px", borderRadius: "12px" }}>
              <Settings className="w-4 h-4" />
              מסך ניהול
            </TabsTrigger>
            <TabsTrigger value="display" style={{ flex: "0 1 auto", minWidth: "140px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem", padding: "10px 20px", borderRadius: "12px" }}>
              <Monitor className="w-4 h-4" />
              תצוגה לקהל
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control">
            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 900 ? "minmax(0, 2fr) minmax(0, 1fr)" : "minmax(0, 1fr)", gap: "20px" }}>
              {/* Queue Table */}
              <div style={{ background: "rgba(15,23,42,0.5)", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,202,255,0.2)", backdropFilter: "blur(10px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f1f5f9" }}>🎵 תור השירים</div>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>שלוט על התור בקלות</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button 
                      onClick={goNextAuto} 
                      style={{ 
                        border: "none", 
                        borderRadius: "12px", 
                        padding: "10px 16px", 
                        fontSize: "0.9rem", 
                        cursor: "pointer", 
                        background: "linear-gradient(135deg, #00caff, #0088ff)", 
                        color: "#001a2e", 
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 12px rgba(34,197,94,0.3)"
                      }}
                    >
                      <Play className="w-4 h-4" />
                      הבא בתור
                    </button>
                    <button 
                      onClick={markCurrentDone} 
                      style={{ 
                        border: "1px solid rgba(148,163,184,0.3)", 
                        borderRadius: "12px", 
                        padding: "10px 16px", 
                        fontSize: "0.9rem", 
                        cursor: "pointer", 
                        background: "rgba(30,41,59,0.5)", 
                        color: "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <Check className="w-4 h-4" />
                      סיים נוכחי
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: "65vh", overflow: "auto", borderRadius: "16px", background: "rgba(15,23,42,0.3)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "rgba(15,23,42,0.95)", backdropFilter: "blur(10px)", zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid rgba(0,202,255,0.2)", fontWeight: "600", color: "#94a3b8", fontSize: "0.85rem" }}>#</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid rgba(0,202,255,0.2)", fontWeight: "600", color: "#94a3b8", fontSize: "0.85rem" }}>זמר/ת</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid rgba(0,202,255,0.2)", fontWeight: "600", color: "#94a3b8", fontSize: "0.85rem" }}>שם השיר</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid rgba(0,202,255,0.2)", fontWeight: "600", color: "#94a3b8", fontSize: "0.85rem" }}>אמן</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid rgba(0,202,255,0.2)", fontWeight: "600", color: "#94a3b8", fontSize: "0.85rem" }}>סטטוס</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid rgba(0,202,255,0.2)", fontWeight: "600", color: "#94a3b8", fontSize: "0.85rem" }}>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>טוען...</td></tr>
                      ) : ordered.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>אין בקשות בתור כרגע</td></tr>
                      ) : (
                        ordered.map((req, index) => (
                          <tr key={req.id} style={{ 
                            background: req.status === "performing" ? "rgba(0,202,255,0.08)" : index % 2 === 0 ? "rgba(30,41,59,0.3)" : "rgba(30,41,59,0.5)",
                            transition: "all 0.2s"
                          }}>
                            <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(51,65,85,0.5)", fontWeight: "500", color: "#cbd5e1" }}>{index + 1}</td>
                            <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(51,65,85,0.5)", fontWeight: "600", color: "#f1f5f9" }}>{req.singer_name}</td>
                            <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(51,65,85,0.5)", color: "#e2e8f0" }}>{req.song_title}</td>
                            <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(51,65,85,0.5)", color: "#94a3b8" }}>{req.song_artist || "-"}</td>
                            <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(51,65,85,0.5)", textAlign: "center" }}>
                              <span style={{
                                display: "inline-flex",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                background: req.status === "waiting" ? "rgba(59,130,246,0.15)" : req.status === "performing" ? "rgba(0,202,255,0.2)" : req.status === "done" ? "rgba(100,116,139,0.15)" : "rgba(248,113,113,0.15)",
                                color: req.status === "waiting" ? "#60a5fa" : req.status === "performing" ? "#00caff" : req.status === "done" ? "#94a3b8" : "#f87171",
                                border: `1px solid ${req.status === "waiting" ? "rgba(59,130,246,0.3)" : req.status === "performing" ? "rgba(0,202,255,0.4)" : req.status === "done" ? "rgba(100,116,139,0.3)" : "rgba(248,113,113,0.3)"}`
                              }}>
                                {req.status === "waiting" ? "⏳ ממתין" : req.status === "performing" ? "🎤 שר עכשיו" : req.status === "done" ? "✅ הסתיים" : "⏭️ דולג"}
                              </span>
                            </td>
                            <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(51,65,85,0.5)", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                <button 
                                  onClick={() => setStatus(req.id, "performing")} 
                                  style={{ 
                                    border: "1px solid rgba(0,202,255,0.3)", 
                                    borderRadius: "8px", 
                                    padding: "6px 12px", 
                                    fontSize: "0.8rem", 
                                    cursor: "pointer", 
                                    background: "rgba(0,202,255,0.1)", 
                                    color: "#00caff",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontWeight: "500"
                                  }}
                                >
                                  <Play className="w-3 h-3" />
                                  שיר
                                </button>
                                <button 
                                  onClick={() => setStatus(req.id, "skipped")} 
                                  style={{ 
                                    border: "1px solid rgba(148,163,184,0.3)", 
                                    borderRadius: "8px", 
                                    padding: "6px 12px", 
                                    fontSize: "0.8rem", 
                                    cursor: "pointer", 
                                    background: "rgba(51,65,85,0.3)", 
                                    color: "#cbd5e1",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontWeight: "500"
                                  }}
                                >
                                  <SkipForward className="w-3 h-3" />
                                  דלג
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: "rgba(15,23,42,0.5)", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,202,255,0.2)", backdropFilter: "blur(10px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f1f5f9" }}>⚡ כרגע</div>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>מה קורה עכשיו</div>
                  </div>
                  <button 
                    onClick={addDemoSong} 
                    style={{ 
                      border: "1px solid rgba(148,163,184,0.3)", 
                      borderRadius: "10px", 
                      padding: "8px 14px", 
                      fontSize: "0.85rem", 
                      cursor: "pointer", 
                      background: "rgba(30,41,59,0.5)", 
                      color: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    הוסף לדוגמה
                  </button>
                </div>
                
                <div style={{ 
                  background: "rgba(0,202,255,0.05)", 
                  border: "1px solid rgba(0,202,255,0.2)", 
                  borderRadius: "14px", 
                  padding: "16px",
                  marginBottom: "16px"
                }}>
                  {!currentSong ? (
                    <div style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center" }}>
                      🎤 אין שיר מתנגן כרגע
                      <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>לחץ "הבא בתור" להתחיל</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: "0.8rem", color: "#00caff", marginBottom: "6px", fontWeight: "600" }}>🎵 שר עכשיו</div>
                      <div style={{ fontWeight: "700", fontSize: "1.1rem", color: "#f1f5f9", marginBottom: "4px" }}>{currentSong.singer_name}</div>
                      <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
                        {currentSong.song_title}
                        {currentSong.song_artist && <span style={{ color: "#94a3b8" }}> • {currentSong.song_artist}</span>}
                      </div>
                    </>
                  )}
                </div>

                <div style={{ borderTop: "1px solid rgba(51,65,85,0.5)", paddingTop: "16px" }}>
                  <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "12px", fontWeight: "600" }}>📋 הבאים בתור</div>
                  {waitingList.length === 0 ? (
                    <div style={{ color: "#64748b", fontSize: "0.85rem", padding: "12px", background: "rgba(30,41,59,0.3)", borderRadius: "10px", textAlign: "center" }}>
                      אין ממתינים כרגע
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {waitingList.slice(0, 5).map((r, i) => (
                        <div 
                          key={r.id} 
                          style={{ 
                            padding: "10px 12px", 
                            background: "rgba(30,41,59,0.4)", 
                            borderRadius: "10px",
                            border: "1px solid rgba(51,65,85,0.5)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ 
                              background: "rgba(0,202,255,0.2)", 
                              color: "#00caff", 
                              borderRadius: "6px", 
                              padding: "2px 8px", 
                              fontSize: "0.75rem", 
                              fontWeight: "600" 
                            }}>
                              #{i + 1}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#f1f5f9" }}>{r.singer_name}</div>
                              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{r.song_title}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display">
            <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <div style={{ marginBottom: "12px" }}>
                <Logo size="large" showCircle={true} />
              </div>
              <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: "800" }}>ערב קריוקי באפריון</h1>
              <p style={{ margin: "8px 0 0", fontSize: "clamp(0.85rem, 1.5vw, 1rem)", color: "#9ca3af" }}>
                המסך מציג מי שר עכשיו ומי הבא בתור
              </p>
            </div>

            {/* סטטיסטיקות */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
              <div style={{ background: "rgba(0,202,255,0.1)", border: "1px solid rgba(0,202,255,0.3)", borderRadius: "14px", padding: "12px", textAlign: "center" }}>
                <Users className="w-6 h-6 mx-auto mb-1" style={{ color: "#00caff" }} />
                <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#00caff" }}>{requests.length}</div>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>זמרים הערב</div>
              </div>
              <div style={{ background: "rgba(0,202,255,0.1)", border: "1px solid rgba(0,202,255,0.3)", borderRadius: "14px", padding: "12px", textAlign: "center" }}>
                <Music2 className="w-6 h-6 mx-auto mb-1" style={{ color: "#00caff" }} />
                <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#00caff" }}>{waiting.length}</div>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>ממתינים</div>
              </div>
              <div style={{ background: "rgba(0,202,255,0.1)", border: "1px solid rgba(0,202,255,0.3)", borderRadius: "14px", padding: "12px", textAlign: "center" }}>
                <TrendingUp className="w-6 h-6 mx-auto mb-1" style={{ color: "#00caff" }} />
                <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#00caff" }}>{done.length}</div>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>השלימו</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 850 ? "minmax(0, 2.2fr) minmax(0, 1.2fr)" : "minmax(0, 1fr)", gap: "14px", alignItems: "stretch" }}>
              {/* Now Playing - עם אנימציה */}
              <div style={{
                background: "radial-gradient(ellipse at top left, rgba(0,202,255,0.15), #020617 60%)",
                borderRadius: "24px",
                padding: "clamp(20px, 3vw, 28px)",
                border: "2px solid #00caff",
                boxShadow: "0 0 40px rgba(0,202,255,0.4), 0 20px 60px rgba(0,0,0,0.7)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minHeight: "240px",
                position: "relative",
                overflow: "hidden"
              }}>
                <style>{`
                  @keyframes pulse-border {
                    0%, 100% { box-shadow: 0 0 40px rgba(0,202,255,0.4), 0 20px 60px rgba(0,0,0,0.7); }
                    50% { box-shadow: 0 0 60px rgba(0,202,255,0.6), 0 20px 60px rgba(0,0,0,0.7); }
                  }
                  @keyframes wave {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  .performing-card {
                    animation: pulse-border 2s ease-in-out infinite;
                  }
                `}</style>

                {/* אפקט גלים */}
                {currentSong && (
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, transparent, #00caff, transparent)",
                    animation: "wave 2s linear infinite"
                  }} />
                )}

                {!currentSong ? (
                  <>
                    <div style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "#00caff", marginBottom: "10px", fontWeight: "600" }}>
                      🎤 כרגע על הבמה
                    </div>
                    <div style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: "900", marginBottom: "10px", color: "#f1f5f9" }}>
                      ממתינים לזמר הראשון
                    </div>
                    <div style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)", color: "#cbd5e1", lineHeight: "1.4" }}>
                      המפעיל יפעיל את השיר הראשון בקרוב…
                    </div>
                  </>
                ) : (
                  <div className="performing-card">
                    <div style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "#00caff", marginBottom: "10px", fontWeight: "600" }}>
                      🎤 כרגע על הבמה
                    </div>
                    <div style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: "900", marginBottom: "10px", color: "#ffffff", textShadow: "0 0 20px rgba(0,202,255,0.5)" }}>
                      {currentSong.singer_name}
                    </div>
                    <div style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.9rem)", color: "#e2e8f0", marginBottom: "6px", fontWeight: "600" }}>
                      {currentSong.song_title}
                    </div>
                    {currentSong.song_artist && (
                      <div style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", color: "#94a3b8" }}>
                        {currentSong.song_artist}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Up Next - משודרג */}
              <div style={{ background: "rgba(15,23,42,0.96)", borderRadius: "20px", padding: "16px 14px", border: "1px solid rgba(0,202,255,0.3)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                <div style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", fontWeight: "700", marginBottom: "12px", color: "#00caff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Music2 className="w-5 h-5" />
                  הבאים בתור
                </div>
                {waitingList.length === 0 ? (
                  <div style={{ padding: "16px 0", textAlign: "center", background: "rgba(30,41,59,0.4)", borderRadius: "12px", border: "1px dashed rgba(0,202,255,0.3)" }}>
                    <div style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "6px" }}>אין כרגע ממתינים</div>
                    <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>הצטרפו לתור דרך הטופס 📱</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {waitingList.slice(0, 7).map((r, i) => (
                      <div key={r.id} style={{ 
                        padding: "10px 12px", 
                        background: i === 0 ? "rgba(0,202,255,0.15)" : "rgba(30,41,59,0.4)", 
                        borderRadius: "12px",
                        border: i === 0 ? "1px solid rgba(0,202,255,0.4)" : "1px solid rgba(51,65,85,0.4)",
                        transition: "all 0.3s"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ 
                            minWidth: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: i === 0 ? "linear-gradient(135deg, #00caff, #0088ff)" : "rgba(51,65,85,0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                            color: i === 0 ? "#001a2e" : "#94a3b8"
                          }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.95rem", fontWeight: "700", color: i === 0 ? "#00caff" : "#f1f5f9", marginBottom: "2px" }}>
                              {r.singer_name}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                              {r.song_title}{r.song_artist ? ` · ${r.song_artist}` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: "14px", padding: "10px", background: "rgba(0,202,255,0.05)", borderRadius: "10px", border: "1px solid rgba(0,202,255,0.2)" }}>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "4px" }}>קבוצת ווטסאפ:</div>
                  <a 
                    href="https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.75rem", color: "#00caff", wordBreak: "break-all", textDecoration: "none" }}
                  >
                    הצטרפו לעדכונים →
                  </a>
                </div>
              </div>
            </div>

              <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "#9ca3af", textAlign: "center" }}>
                להצגה על מסך גדול: לחץ F11 למצב מסך מלא, והשאר על "מסך תצוגה לקהל".
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}