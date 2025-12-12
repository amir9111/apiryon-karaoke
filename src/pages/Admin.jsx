import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const [viewMode, setViewMode] = useState("admin");
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
    <div dir="rtl" style={{ background: "#020617", color: "#e5e7eb", minHeight: "100vh", padding: "12px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Top Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: "600" }}>ניהול תור קריוקי</div>
            <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>בחר מצב תצוגה: ניהול למפעיל / מסך גדול לקהל</div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "inline-flex", background: "#020617", border: "1px solid #111827", borderRadius: "999px", padding: "2px" }}>
              <button
                onClick={() => setViewMode("admin")}
                style={{
                  border: "none",
                  background: viewMode === "admin" ? "#22c55e" : "transparent",
                  color: viewMode === "admin" ? "#022c22" : "#9ca3af",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: viewMode === "admin" ? "600" : "normal"
                }}
              >
                מסך ניהול
              </button>
              <button
                onClick={() => setViewMode("display")}
                style={{
                  border: "none",
                  background: viewMode === "display" ? "#22c55e" : "transparent",
                  color: viewMode === "display" ? "#022c22" : "#9ca3af",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: viewMode === "display" ? "600" : "normal"
                }}
              >
                מסך תצוגה לקהל
              </button>
            </div>
            <div style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "999px", background: "rgba(15,23,42,0.9)", border: "1px solid #111827", color: "#9ca3af" }}>
              תור: {waiting.length} ממתינים · {done.length} בוצעו
            </div>
          </div>
        </div>

        {/* Admin Panel */}
        {viewMode === "admin" && (
          <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 900 ? "minmax(0, 2.2fr) minmax(0, 1.3fr)" : "minmax(0, 1fr)", gap: "12px" }}>
            {/* Queue Table */}
            <div style={{ background: "rgba(15,23,42,0.96)", borderRadius: "16px", padding: "12px 10px", border: "1px solid #111827", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: "600" }}>תור שירים</div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>מכאן אתה שולט על מי שר עכשיו, הבא בתור, ודילוגים.</div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={goNextAuto} style={{ border: "none", borderRadius: "999px", padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#022c22", fontWeight: "600" }}>
                    הבא בתור ▶️
                  </button>
                  <button onClick={markCurrentDone} style={{ border: "none", borderRadius: "999px", padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer", background: "transparent", color: "#e5e7eb", border: "1px solid #374151" }}>
                    סמן בוצע ✅
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: "60vh", overflow: "auto", borderRadius: "12px", border: "1px solid #1f2937" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#020617", zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: "6px 8px", textAlign: "right", borderBottom: "1px solid #111827", fontWeight: "600", color: "#9ca3af", fontSize: "0.8rem" }}>#</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", borderBottom: "1px solid #111827", fontWeight: "600", color: "#9ca3af", fontSize: "0.8rem" }}>שם זמר</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", borderBottom: "1px solid #111827", fontWeight: "600", color: "#9ca3af", fontSize: "0.8rem" }}>שם השיר</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", borderBottom: "1px solid #111827", fontWeight: "600", color: "#9ca3af", fontSize: "0.8rem" }}>אמן</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", borderBottom: "1px solid #111827", fontWeight: "600", color: "#9ca3af", fontSize: "0.8rem" }}>סטטוס</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", borderBottom: "1px solid #111827", fontWeight: "600", color: "#9ca3af", fontSize: "0.8rem" }}>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}>טוען...</td></tr>
                    ) : ordered.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}>אין בקשות בתור</td></tr>
                    ) : (
                      ordered.map((req, index) => (
                        <tr key={req.id} style={{ background: index % 2 === 0 ? "rgba(15,23,42,0.9)" : "rgba(15,23,42,0.8)" }}>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #111827" }}>{index + 1}</td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #111827" }}>{req.singer_name}</td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #111827" }}>{req.song_title}</td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #111827" }}>{req.song_artist || "-"}</td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #111827" }}>
                            <span style={{
                              display: "inline-flex",
                              padding: "2px 8px",
                              borderRadius: "999px",
                              fontSize: "0.7rem",
                              fontWeight: "500",
                              background: req.status === "waiting" ? "rgba(59,130,246,0.1)" : req.status === "performing" ? "rgba(34,197,94,0.12)" : req.status === "done" ? "rgba(148,163,184,0.14)" : "rgba(248,113,113,0.12)",
                              color: req.status === "waiting" ? "#93c5fd" : req.status === "performing" ? "#86efac" : req.status === "done" ? "#cbd5f5" : "#fecaca"
                            }}>
                              {req.status === "waiting" ? "ממתין" : req.status === "performing" ? "מתנגן עכשיו" : req.status === "done" ? "בוצע" : "דילגת"}
                            </span>
                          </td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #111827", whiteSpace: "nowrap" }}>
                            <button onClick={() => setStatus(req.id, "performing")} style={{ border: "1px solid #374151", borderRadius: "999px", padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer", background: "transparent", color: "#e5e7eb", marginLeft: "4px" }}>
                              שיר זה עכשיו
                            </button>
                            <button onClick={() => setStatus(req.id, "skipped")} style={{ border: "1px solid #374151", borderRadius: "999px", padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer", background: "transparent", color: "#e5e7eb" }}>
                              דלג
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: "rgba(15,23,42,0.96)", borderRadius: "16px", padding: "12px 10px", border: "1px solid #111827", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: "600" }}>כאן ועכשיו</div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>תקציר מהיר למה שקורה במועדון.</div>
                </div>
                <button onClick={addDemoSong} style={{ border: "1px solid #374151", borderRadius: "999px", padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer", background: "transparent", color: "#e5e7eb" }}>
                  הוסף שיר לדוגמה
                </button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {!currentSong ? (
                  <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>כרגע אין שיר שמתנגן. לחץ "הבא בתור" כדי להתחיל.</div>
                ) : (
                  <>
                    <div style={{ fontWeight: "600" }}>עכשיו שר: {currentSong.singer_name}</div>
                    <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                      השיר: {currentSong.song_title}{currentSong.song_artist ? ` · ${currentSong.song_artist}` : ""}
                    </div>
                  </>
                )}
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #111827", margin: "10px 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>הבאים בתור:</div>
                {waitingList.length === 0 ? (
                  <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>אין שירים ממתינים כרגע.</div>
                ) : (
                  waitingList.slice(0, 5).map((r, i) => (
                    <div key={r.id} style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                      {i + 1}. {r.singer_name} – {r.song_title}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Display Panel */}
        {viewMode === "display" && (
          <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 3vw, 2.1rem)" }}>ערב קריוקי</h1>
              <p style={{ margin: "4px 0 0", fontSize: "clamp(0.8rem, 1.4vw, 0.95rem)", color: "#9ca3af" }}>
                המסך מציג מי שר עכשיו ומי הבא בתור. להצטרפות – סרקו את ה־QR במועדון.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 850 ? "minmax(0, 2.2fr) minmax(0, 1.2fr)" : "minmax(0, 1fr)", gap: "10px", alignItems: "stretch" }}>
              {/* Now Playing */}
              <div style={{
                background: "radial-gradient(circle at top left, #22c55e33, #020617 55%)",
                borderRadius: "22px",
                padding: "clamp(14px, 2vw, 20px)",
                border: "1px solid #16a34a",
                boxShadow: "0 18px 50px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minHeight: "220px"
              }}>
                {!currentSong ? (
                  <>
                    <div style={{ fontSize: "clamp(0.85rem, 1.4vw, 1rem)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#bbf7d0", marginBottom: "6px" }}>
                      כרגע על הבמה
                    </div>
                    <div style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)", fontWeight: "800", marginBottom: "6px" }}>
                      ממתינים לזמר הראשון…
                    </div>
                    <div style={{ fontSize: "clamp(1.1rem, 2.3vw, 1.7rem)", color: "#e5e7eb" }}>
                      ברגע שהמפעיל ילחץ "הבא בתור" – השם שלכם יופיע כאן.
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "clamp(0.85rem, 1.4vw, 1rem)", textTransform: "uppercase", letterSpacing: "0.08em", color: "#bbf7d0", marginBottom: "6px" }}>
                      כרגע על הבמה
                    </div>
                    <div style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)", fontWeight: "800", marginBottom: "6px" }}>
                      {currentSong.singer_name}
                    </div>
                    <div style={{ fontSize: "clamp(1.1rem, 2.3vw, 1.7rem)", color: "#e5e7eb", marginBottom: "4px" }}>
                      {currentSong.song_title}
                    </div>
                    {currentSong.song_artist && (
                      <div style={{ fontSize: "clamp(0.9rem, 1.6vw, 1rem)", color: "#a5b4fc" }}>
                        {currentSong.song_artist}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Up Next */}
              <div style={{ background: "rgba(15,23,42,0.96)", borderRadius: "18px", padding: "12px 10px", border: "1px solid #111827", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                <div style={{ fontSize: "clamp(0.9rem, 1.6vw, 1rem)", fontWeight: "600", marginBottom: "6px" }}>
                  הבאים בתור
                </div>
                {waitingList.length === 0 ? (
                  <div style={{ padding: "4px 0", borderBottom: "1px dashed #1f2937" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>אין כרגע שירים ממתינים</div>
                    <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>הצטרפו לתור דרך הטופס או ה־QR 📱</div>
                  </div>
                ) : (
                  waitingList.slice(0, 6).map((r, i) => (
                    <div key={r.id} style={{ padding: "4px 0", borderBottom: i < waitingList.slice(0, 6).length - 1 ? "1px dashed #1f2937" : "none" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{i + 1}. {r.singer_name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                        {r.song_title}{r.song_artist ? ` · ${r.song_artist}` : ""}
                      </div>
                    </div>
                  ))
                )}
                <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "#9ca3af" }}>
                  להצטרפות לקבוצת הווטסאפ:
                  <br />
                  https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15
                </div>
              </div>
            </div>

            <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "#9ca3af", textAlign: "center" }}>
              להצגה על מסך גדול: לחץ F11 למצב מסך מלא, והשאר על "מסך תצוגה לקהל".
            </div>
          </div>
        )}
      </div>
    </div>
  );
}