import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Check, SkipForward, UserPlus, Search, X, Music2 } from "lucide-react";
import ApyironLogo from "../components/ApyironLogo";
import NavigationMenu from "../components/NavigationMenu";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatsCard from "../components/admin/StatsCard";
import PerformanceTimer from "../components/admin/PerformanceTimer";
import SongHistory from "../components/admin/SongHistory";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("waiting");

  const queryClient = useQueryClient();

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

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 200),
    refetchInterval: 2000,
    staleTime: 1000,
  });

  const { data: songs = [] } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('-created_date', 1000),
    initialData: [],
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
    if (current && current.started_at) {
      const duration = Math.floor((Date.now() - new Date(current.started_at).getTime()) / 1000);
      updateMutation.mutate({ 
        id: current.id, 
        data: { 
          status: "done",
          performance_duration_seconds: duration
        } 
      });
    }
  };

  const startPerforming = (id) => {
    const current = requests.find(r => r.status === "performing");
    if (current) {
      markCurrentDone();
    }
    updateMutation.mutate({ 
      id, 
      data: { 
        status: "performing",
        started_at: new Date().toISOString()
      } 
    });
  };

  const returnToQueue = (id) => {
    updateMutation.mutate({ id, data: { status: "waiting" } });
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

  const currentSong = requests.find(r => r.status === "performing");
  const waitingList = requests.filter(r => r.status === "waiting");
  const doneList = requests.filter(r => r.status === "done");
  const skippedList = requests.filter(r => r.status === "skipped");

  // Statistics
  const stats = useMemo(() => {
    const completed = requests.filter(r => r.status === "done");
    
    // Top singer
    const singerCounts = {};
    completed.forEach(r => {
      singerCounts[r.singer_name] = (singerCounts[r.singer_name] || 0) + 1;
    });
    const topSinger = Object.entries(singerCounts).sort((a, b) => b[1] - a[1])[0];
    
    // Top song
    const songCounts = {};
    completed.forEach(r => {
      const key = `${r.song_title} - ${r.song_artist || 'לא ידוע'}`;
      songCounts[key] = (songCounts[key] || 0) + 1;
    });
    const topSong = Object.entries(songCounts).sort((a, b) => b[1] - a[1])[0];
    
    // Average duration
    const durations = completed.filter(r => r.performance_duration_seconds).map(r => r.performance_duration_seconds);
    const avgDuration = durations.length > 0 ? Math.floor(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    
    // Average rating
    const ratings = completed.filter(r => r.average_rating > 0).map(r => r.average_rating);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
    
    // Unique singers
    const uniqueSingers = new Set(completed.map(r => r.singer_name)).size;
    
    return {
      topSinger,
      topSong,
      avgDuration,
      avgRating,
      totalCompleted: completed.length,
      uniqueSingers
    };
  }, [requests]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered lists
  const filteredWaiting = waitingList.filter(r => 
    r.singer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.song_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div dir="rtl" style={{ background: "#020617", color: "#e5e7eb", minHeight: "100vh", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <NavigationMenu />
        <div style={{ fontSize: "1.2rem" }}>טוען...</div>
      </div>
    );
  }

  if (!user || (user.email !== "amir.abu300@gmail.com" && user.email !== "amit595959@gmail.com")) {
    return (
      <div dir="rtl" style={{ background: "#020617", color: "#e5e7eb", minHeight: "100vh", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <NavigationMenu />
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
      <NavigationMenu />
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <ApyironLogo size="small" showCircle={false} />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 8px 0", color: "#00caff", textShadow: "0 0 20px rgba(0, 202, 255, 0.5)" }}>
            🎤 מסך ניהול מקצועי
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: "0 0 12px 0" }}>
            ניהול, סטטיסטיקות וניתוח נתונים בזמן אמת
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to={createPageUrl("SongManager")}
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                color: "#ffffff",
                textDecoration: "none",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
              }}
            >
              <Music2 className="w-5 h-5" />
              מאגר בלייבקים
            </Link>
            <Link
              to={createPageUrl("Player")}
              target="_blank"
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                textDecoration: "none",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
              }}
            >
              <Play className="w-5 h-5" />
              מסך נגן
            </Link>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <StatsCard 
            icon="🏆" 
            label="זמר השיא" 
            value={stats.topSinger ? `${stats.topSinger[0].split(' ')[0]} (${stats.topSinger[1]})` : "-"}
            color="#00caff"
            delay={0}
          />
          <StatsCard 
            icon="🎵" 
            label="שיר פופולרי" 
            value={stats.topSong ? `${stats.topSong[1]}x` : "-"}
            color="#8b5cf6"
            delay={0.1}
          />
          <StatsCard 
            icon="⏱️" 
            label="זמן ממוצע" 
            value={stats.avgDuration > 0 ? formatDuration(stats.avgDuration) : "-"}
            color="#10b981"
            delay={0.2}
          />
          <StatsCard 
            icon="⭐" 
            label="ציון ממוצע" 
            value={stats.avgRating > 0 ? stats.avgRating : "-"}
            color="#f59e0b"
            delay={0.3}
          />
          <StatsCard 
            icon="📈" 
            label='סה"כ שירים' 
            value={stats.totalCompleted}
            color="#00caff"
            delay={0.4}
          />
          <StatsCard 
            icon="👥" 
            label="זמרים ייחודיים" 
            value={stats.uniqueSingers}
            color="#8b5cf6"
            delay={0.5}
          />
        </div>

        {/* Main Content */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
          gap: "20px"
        }}>
          {/* Left Column - Current & Queue */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Current Song */}
            <div style={{ background: "rgba(15,23,42,0.5)", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0, 202, 255, 0.2)", backdropFilter: "blur(10px)", boxShadow: "0 0 30px rgba(0, 202, 255, 0.1)" }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f1f5f9" }}>🎤 שיר נוכחי</div>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <div style={{ fontSize: "0.85rem", color: "#00caff", fontWeight: "600" }}>🎤 שר כרגע</div>
                    <PerformanceTimer startedAt={currentSong.started_at} />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f1f5f9", marginBottom: "6px" }}>{currentSong.singer_name}</div>
                  <div style={{ fontSize: "1.1rem", color: "#cbd5e1", marginBottom: "4px" }}>{currentSong.song_title}</div>
                  {currentSong.song_artist && (
                    <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "4px" }}>{currentSong.song_artist}</div>
                  )}
                  {currentSong.song_id && (
                    <div style={{ 
                      fontSize: "0.75rem", 
                      color: "#00caff", 
                      background: "rgba(0, 202, 255, 0.1)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      display: "inline-block",
                      marginBottom: "12px"
                    }}>
                      🎵 בלייבק ממאגר
                    </div>
                  )}
                  {!currentSong.song_id && (
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "12px" }}>
                      ⚠️ שיר ידני (ללא בלייבק)
                    </div>
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
                    <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "4px" }}>{waitingList[0].song_artist}</div>
                  )}
                  {waitingList[0].song_id && (
                    <div style={{ 
                      fontSize: "0.75rem", 
                      color: "#00caff", 
                      background: "rgba(0, 202, 255, 0.1)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      display: "inline-block",
                      marginBottom: "12px"
                    }}>
                      🎵 בלייבק ממאגר
                    </div>
                  )}
                  {!waitingList[0].song_id && (
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "12px" }}>
                      ⚠️ שיר ידני (ללא בלייבק)
                    </div>
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
            </div>

            {/* Queue List */}
            <div style={{ background: "rgba(15,23,42,0.5)", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0, 202, 255, 0.2)", backdropFilter: "blur(10px)", boxShadow: "0 0 30px rgba(0, 202, 255, 0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f1f5f9" }}>📋 תור ממתינים ({filteredWaiting.length})</div>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>רשימת כל הממתינים</div>
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
                  הוסף
                </button>
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <Search className="w-5 h-5" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="חפש זמר או שיר..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    borderRadius: "12px",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                    background: "rgba(15, 23, 42, 0.5)",
                    color: "#f1f5f9",
                    fontSize: "0.9rem"
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      padding: "4px"
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "50vh", overflow: "auto", borderRadius: "16px", background: "rgba(15,23,42,0.3)" }}>
                {filteredWaiting.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                    {searchTerm ? "לא נמצאו תוצאות" : "אין שירים ממתינים"}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px" }}>
                    {filteredWaiting.map((req, index) => (
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
          </div>

          {/* Right Column - History */}
          <div style={{ background: "rgba(15,23,42,0.5)", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0, 202, 255, 0.2)", backdropFilter: "blur(10px)", boxShadow: "0 0 30px rgba(0, 202, 255, 0.1)" }}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f1f5f9" }}>📊 היסטוריה</div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>שירים שבוצעו ודולגו</div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button
                onClick={() => setActiveTab("waiting")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: activeTab === "waiting" ? "2px solid rgba(0, 202, 255, 0.5)" : "1px solid rgba(51, 65, 85, 0.5)",
                  background: activeTab === "waiting" ? "rgba(0, 202, 255, 0.15)" : "rgba(30, 41, 59, 0.3)",
                  color: activeTab === "waiting" ? "#00caff" : "#94a3b8",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                ממתינים ({waitingList.length})
              </button>
              <button
                onClick={() => setActiveTab("done")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: activeTab === "done" ? "2px solid rgba(16, 185, 129, 0.5)" : "1px solid rgba(51, 65, 85, 0.5)",
                  background: activeTab === "done" ? "rgba(16, 185, 129, 0.15)" : "rgba(30, 41, 59, 0.3)",
                  color: activeTab === "done" ? "#10b981" : "#94a3b8",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                הושלמו ({doneList.length})
              </button>
              <button
                onClick={() => setActiveTab("skipped")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: activeTab === "skipped" ? "2px solid rgba(248, 113, 113, 0.5)" : "1px solid rgba(51, 65, 85, 0.5)",
                  background: activeTab === "skipped" ? "rgba(248, 113, 113, 0.15)" : "rgba(30, 41, 59, 0.3)",
                  color: activeTab === "skipped" ? "#f87171" : "#94a3b8",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                דולגו ({skippedList.length})
              </button>
            </div>

            <div style={{ maxHeight: "70vh", overflow: "auto" }}>
              {activeTab === "waiting" && <SongHistory songs={waitingList} />}
              {activeTab === "done" && <SongHistory songs={doneList} />}
              {activeTab === "skipped" && <SongHistory songs={skippedList} onReturnToQueue={returnToQueue} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}