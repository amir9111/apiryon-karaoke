import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Check, SkipForward, UserPlus, Monitor, Settings, QrCode } from "lucide-react";
import ApyironLogo from "../components/ApyironLogo";
import AudioWave from "../components/AudioWave";
import AudienceRating from "../components/AudienceRating";
import StarRating from "../components/StarRating";

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

  const markCurrentDone = () => {
    const current = requests.find(r => r.status === "performing");
    if (current) {
      updateMutation.mutate({ id: current.id, data: { status: "done" } });
    }
  };

  const startPerforming = (id) => {
    updateMutation.mutate({ id, data: { status: "performing" } });
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
    <div dir="rtl" style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", color: "#f1f5f9", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <ApyironLogo size="small" showCircle={false} />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 8px 0", color: "#00caff", textShadow: "0 0 20px rgba(0, 202, 255, 0.5)" }}>
            🎤 ניהול קריוקי
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
            ניהול מתקדם של תור השירים והזמרים
          </p>
          <div style={{ display: "inline-flex", gap: "12px", marginTop: "12px", padding: "8px 16px", background: "rgba(15,23,42,0.6)", borderRadius: "999px", border: "1px solid rgba(0, 202, 255, 0.3)", boxShadow: "0 0 20px rgba(0, 202, 255, 0.2)" }}>
            <span style={{ fontSize: "0.9rem", color: "#00caff" }}>⏳ {waiting.length} ממתינים</span>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>•</span>
            <span style={{ fontSize: "0.9rem", color: "#00caff" }}>✅ {done.length} בוצעו</span>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>•</span>
            <span style={{ fontSize: "0.9rem", color: "#00caff" }}>🎵 {requests.length} סה"כ</span>
          </div>
        </div>

        <Tabs defaultValue="control" dir="rtl" style={{ width: "100%" }}>
          <TabsList style={{ display: "flex", gap: "8px", background: "rgba(15,23,42,0.8)", padding: "6px", borderRadius: "16px", border: "1px solid rgba(0, 202, 255, 0.2)", marginBottom: "20px", width: "100%", justifyContent: "center", boxShadow: "0 0 20px rgba(0, 202, 255, 0.1)" }}>
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
              {/* Current Song Control */}
              <div style={{ background: "rgba(15,23,42,0.5)", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0, 202, 255, 0.2)", backdropFilter: "blur(10px)", boxShadow: "0 0 30px rgba(0, 202, 255, 0.1)" }}>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f1f5f9" }}>🎤 שיר נוכחי / הבא</div>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>נהל את השיר המתנגן</div>
                </div>

                {currentSong ? (
                  <div style={{
                    background: "rgba(0, 202, 255, 0.08)",
                    border: "2px solid rgba(0, 202, 255, 0.3)",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "16px",
                    boxShadow: "0 0 30px rgba(0, 202, 255, 0.2)"
                  }}>
                    <div style={{ fontSize: "0.85rem", color: "#00caff", marginBottom: "8px", fontWeight: "600" }}>🎤 שר כרגע</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f1f5f9", marginBottom: "6px" }}>{currentSong.singer_name}</div>
                    <div style={{ fontSize: "1.1rem", color: "#cbd5e1", marginBottom: "4px" }}>{currentSong.song_title}</div>
                    {currentSong.song_artist && (
                      <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "12px" }}>{currentSong.song_artist}</div>
                    )}
                    <button
                      onClick={markCurrentDone}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                        fontSize: "1rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
                      }}
                    >
                      <Check className="w-5 h-5" />
                      סיים שיר
                    </button>
                  </div>
                ) : waitingList.length > 0 ? (
                  <div style={{
                    background: "rgba(0, 202, 255, 0.08)",
                    border: "2px solid rgba(0, 202, 255, 0.3)",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "16px",
                    boxShadow: "0 0 30px rgba(0, 202, 255, 0.2)"
                  }}>
                    <div style={{ fontSize: "0.85rem", color: "#00caff", marginBottom: "8px", fontWeight: "600" }}>⏭️ הבא בתור</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f1f5f9", marginBottom: "6px" }}>{waitingList[0].singer_name}</div>
                    <div style={{ fontSize: "1.1rem", color: "#cbd5e1", marginBottom: "4px" }}>{waitingList[0].song_title}</div>
                    {waitingList[0].song_artist && (
                      <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "12px" }}>{waitingList[0].song_artist}</div>
                    )}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => startPerforming(waitingList[0].id)}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: "12px",
                          border: "none",
                          background: "linear-gradient(135deg, #00caff, #0088ff)",
                          color: "#001a2e",
                          fontSize: "1rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 0 20px rgba(0, 202, 255, 0.4)"
                        }}
                      >
                        <Play className="w-5 h-5" />
                        התחל שיר
                      </button>
                      <button
                        onClick={() => setStatus(waitingList[0].id, "skipped")}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "1px solid rgba(248, 113, 113, 0.3)",
                          background: "rgba(248, 113, 113, 0.1)",
                          color: "#f87171",
                          fontSize: "1rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <SkipForward className="w-5 h-5" />
                        דלג
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: "rgba(0, 202, 255, 0.05)",
                    border: "1px dashed rgba(0, 202, 255, 0.3)",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "16px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#94a3b8" }}>אין שירים בתור</div>
                  </div>
                )}

                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: "#f1f5f9", marginBottom: "8px" }}>📋 ממתינים בתור ({waitingList.length})</div>
                </div>

                <div style={{ maxHeight: "50vh", overflow: "auto", borderRadius: "16px", background: "rgba(15,23,42,0.3)" }}>
                  {waitingList.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>אין שירים ממתינים</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px" }}>
                      {waitingList.map((req, index) => (
                        <div key={req.id} style={{
                          background: index === 0 ? "rgba(0, 202, 255, 0.15)" : "rgba(30,41,59,0.5)",
                          border: index === 0 ? "1px solid rgba(0, 202, 255, 0.4)" : "1px solid rgba(51,65,85,0.5)",
                          borderRadius: "12px",
                          padding: "12px",
                          boxShadow: index === 0 ? "0 0 20px rgba(0, 202, 255, 0.2)" : "none"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: index === 0 ? "linear-gradient(135deg, #00caff, #0088ff)" : "rgba(51, 65, 85, 0.8)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "0.9rem",
                              color: index === 0 ? "#001a2e" : "#94a3b8"
                            }}>
                              {index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "1rem", fontWeight: "700", color: "#f1f5f9" }}>{req.singer_name}</div>
                              <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                                {req.song_title}{req.song_artist ? ` • ${req.song_artist}` : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: "rgba(15,23,42,0.5)", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0, 202, 255, 0.2)", backdropFilter: "blur(10px)", boxShadow: "0 0 30px rgba(0, 202, 255, 0.1)" }}>
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
                  background: "rgba(0, 202, 255, 0.08)", 
                  border: "1px solid rgba(0, 202, 255, 0.3)", 
                  borderRadius: "14px", 
                  padding: "16px",
                  marginBottom: "16px",
                  boxShadow: "0 0 20px rgba(0, 202, 255, 0.15)"
                }}>
                  {!currentSong ? (
                    <div style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center" }}>
                      🎤 אין שיר מתנגן כרגע
                      <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>לחץ "הבא בתור" להתחיל</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: "0.8rem", color: "#00caff", marginBottom: "6px", fontWeight: "600", textShadow: "0 0 10px rgba(0, 202, 255, 0.4)" }}>🎵 שר עכשיו</div>
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
                              background: "rgba(0, 202, 255, 0.2)", 
                              color: "#00caff", 
                              borderRadius: "6px", 
                              padding: "2px 8px", 
                              fontSize: "0.75rem", 
                              fontWeight: "600",
                              boxShadow: "0 0 10px rgba(0, 202, 255, 0.2)"
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
            {/* Logo and Header */}
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                <ApyironLogo size="large" showCircle={true} />
              </div>
              <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#00caff", textShadow: "0 0 40px rgba(0, 202, 255, 0.8)", fontWeight: "900", letterSpacing: "0.05em" }}>
                🎤 מועדון האפריון 🎤
              </h1>
              <p style={{ margin: "12px 0 0", fontSize: "clamp(1rem, 2vw, 1.3rem)", color: "#e2e8f0", fontWeight: "600" }}>
                ערב קריוקי מטורף • שרים, מדרגים ונהנים
              </p>
            </div>

            {/* Stats Bar */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: "16px", 
              flexWrap: "wrap",
              marginBottom: "8px"
            }}>
              <div style={{
                background: "rgba(0, 202, 255, 0.1)",
                border: "1px solid rgba(0, 202, 255, 0.3)",
                borderRadius: "12px",
                padding: "8px 16px",
                boxShadow: "0 0 20px rgba(0, 202, 255, 0.2)"
              }}>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>זמרים הערב</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#00caff" }}>{done.length + now.length}</div>
              </div>
              <div style={{
                background: "rgba(0, 202, 255, 0.1)",
                border: "1px solid rgba(0, 202, 255, 0.3)",
                borderRadius: "12px",
                padding: "8px 16px",
                boxShadow: "0 0 20px rgba(0, 202, 255, 0.2)"
              }}>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>ממתינים</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#00caff" }}>{waiting.length}</div>
              </div>
              <div style={{
                background: "rgba(0, 202, 255, 0.1)",
                border: "1px solid rgba(0, 202, 255, 0.3)",
                borderRadius: "12px",
                padding: "8px 16px",
                boxShadow: "0 0 20px rgba(0, 202, 255, 0.2)"
              }}>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>סה"כ שירים</div>
                <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#00caff" }}>{requests.length}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 850 ? "minmax(0, 2fr) minmax(0, 1fr)" : "minmax(0, 1fr)", gap: "16px", alignItems: "start" }}>
              {/* Now Playing */}
              <div style={{
                background: "radial-gradient(ellipse at top left, rgba(0, 202, 255, 0.15), rgba(2, 6, 23, 0.95) 60%)",
                borderRadius: "24px",
                padding: "clamp(20px, 3vw, 32px)",
                border: "2px solid rgba(0, 202, 255, 0.4)",
                boxShadow: "0 0 60px rgba(0, 202, 255, 0.3), 0 20px 50px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minHeight: "280px",
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Animated background effect */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "radial-gradient(circle at 50% 50%, rgba(0, 202, 255, 0.1) 0%, transparent 50%)",
                  animation: "pulse 3s ease-in-out infinite",
                  pointerEvents: "none"
                }}></div>

                <div style={{ position: "relative", zIndex: 1 }}>
                  {!currentSong ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                        <AudioWave isPlaying={false} />
                      </div>
                      <div style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: "#00caff", marginBottom: "12px", textAlign: "center", textShadow: "0 0 10px rgba(0, 202, 255, 0.5)" }}>
                        ⏳ ממתינים לזמר הראשון
                      </div>
                      <div style={{ fontSize: "clamp(1.4rem, 2.8vw, 2rem)", fontWeight: "700", marginBottom: "8px", textAlign: "center", color: "#f1f5f9" }}>
                        הבמה מחכה לכם!
                      </div>
                      <div style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)", color: "#cbd5e1", textAlign: "center" }}>
                        לחצו "הבא בתור" להתחיל את המופע 🎭
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                        <AudioWave isPlaying={true} />
                      </div>
                      <div style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: "#00caff", marginBottom: "12px", textAlign: "center", textShadow: "0 0 15px rgba(0, 202, 255, 0.6)" }}>
                        🎤 כרגע על הבמה
                      </div>
                      <div style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: "800", marginBottom: "12px", textAlign: "center", color: "#ffffff", textShadow: "0 0 20px rgba(0, 202, 255, 0.4)" }}>
                        {currentSong.singer_name}
                      </div>
                      <div style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: "#e2e8f0", marginBottom: "8px", textAlign: "center", fontWeight: "600" }}>
                        {currentSong.song_title}
                      </div>
                      {currentSong.song_artist && (
                        <div style={{ fontSize: "clamp(1rem, 1.8vw, 1.3rem)", color: "#94a3b8", textAlign: "center", marginBottom: "16px" }}>
                          {currentSong.song_artist}
                        </div>
                      )}
                      {/* Display current rating */}
                      {currentSong.average_rating > 0 && (
                        <div style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "12px",
                          marginTop: "16px",
                          padding: "12px 20px",
                          background: "rgba(251, 191, 36, 0.1)",
                          borderRadius: "16px",
                          border: "1px solid rgba(251, 191, 36, 0.3)"
                        }}>
                          <StarRating rating={currentSong.average_rating} readonly size="medium" />
                          <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                            ({currentSong.ratings?.length || 0} דירוגים)
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar - Up Next & Rating */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Audience Rating Component */}
                {currentSong && (
                  <AudienceRating 
                    currentSong={currentSong}
                    onRatingSubmitted={() => queryClient.invalidateQueries({ queryKey: ['karaoke-requests'] })}
                  />
                )}

                <div style={{ 
                  background: "rgba(15,23,42,0.96)", 
                  borderRadius: "20px", 
                  padding: "16px 14px", 
                  border: "1px solid rgba(0, 202, 255, 0.3)", 
                  boxShadow: "0 0 30px rgba(0, 202, 255, 0.15), 0 12px 40px rgba(0,0,0,0.5)" 
                }}>
                <div style={{ 
                  fontSize: "clamp(1rem, 1.8vw, 1.2rem)", 
                  fontWeight: "700", 
                  marginBottom: "12px",
                  color: "#00caff",
                  textShadow: "0 0 10px rgba(0, 202, 255, 0.4)"
                }}>
                  📋 הבאים בתור
                </div>
                {waitingList.length === 0 ? (
                  <div style={{ 
                    padding: "16px", 
                    borderRadius: "12px",
                    background: "rgba(0, 202, 255, 0.05)",
                    border: "1px dashed rgba(0, 202, 255, 0.3)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "6px" }}>אין כרגע שירים ממתינים</div>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>הצטרפו לתור דרך הטופס 📱</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {waitingList.slice(0, 7).map((r, i) => (
                      <div key={r.id} style={{ 
                        padding: "10px 12px",
                        borderRadius: "12px",
                        background: i === 0 ? "rgba(0, 202, 255, 0.15)" : "rgba(30, 41, 59, 0.5)",
                        border: i === 0 ? "1px solid rgba(0, 202, 255, 0.4)" : "1px solid rgba(51, 65, 85, 0.5)",
                        boxShadow: i === 0 ? "0 0 20px rgba(0, 202, 255, 0.2)" : "none"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "10px"
                        }}>
                          <div style={{
                            minWidth: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: i === 0 ? "linear-gradient(135deg, #00caff, #0088ff)" : "rgba(51, 65, 85, 0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                            color: i === 0 ? "#001a2e" : "#94a3b8",
                            boxShadow: i === 0 ? "0 0 15px rgba(0, 202, 255, 0.4)" : "none"
                          }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontSize: "0.95rem", 
                              fontWeight: "700",
                              color: i === 0 ? "#00caff" : "#f1f5f9",
                              textShadow: i === 0 ? "0 0 10px rgba(0, 202, 255, 0.3)" : "none",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {r.singer_name}
                            </div>
                            <div style={{ 
                              fontSize: "0.8rem", 
                              color: "#94a3b8",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {r.song_title}{r.song_artist ? ` · ${r.song_artist}` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ 
                  marginTop: "16px", 
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(0, 202, 255, 0.08)",
                  border: "2px solid rgba(0, 202, 255, 0.3)",
                  textAlign: "center",
                  boxShadow: "0 0 30px rgba(0, 202, 255, 0.2)"
                }}>
                  <QrCode style={{ width: "120px", height: "120px", color: "#00caff", margin: "0 auto 12px" }} />
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: "#00caff", marginBottom: "8px" }}>
                    סרקו להצטרפות לקבוצת הווטסאפ 💬
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                    הצטרפו לקבוצה לעדכונים על ערבים הבאים!
                  </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
                marginTop: "16px", 
                fontSize: "0.8rem", 
                color: "#94a3b8", 
                textAlign: "center",
                padding: "12px",
                background: "rgba(0, 202, 255, 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(0, 202, 255, 0.2)"
              }}>
                💡 טיפ: לחץ F11 למצב מסך מלא והשאר על "מסך תצוגה לקהל" להצגה מושלמת
              </div>

              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.3; }
                  50% { opacity: 0.6; }
                }
              `}</style>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}