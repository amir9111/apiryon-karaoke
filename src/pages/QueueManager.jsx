import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function QueueManager() {
  const [viewMode, setViewMode] = useState("admin");
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['karaokeRequests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 100),
    refetchInterval: 3000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.KaraokeRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['karaokeRequests'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.KaraokeRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['karaokeRequests'] });
    },
  });

  const setNowPlaying = (id) => {
    requests.forEach(r => {
      if (r.status === "performing") {
        updateMutation.mutate({ id: r.id, data: { status: "done" } });
      }
    });
    updateMutation.mutate({ id, data: { status: "performing" } });
  };

  const skipRequest = (id) => {
    updateMutation.mutate({ id, data: { status: "done" } });
  };

  const goNextAuto = () => {
    const current = requests.find(r => r.status === "performing");
    if (current) {
      updateMutation.mutate({ id: current.id, data: { status: "done" } });
    }
    const next = requests.find(r => r.status === "waiting");
    if (next) {
      updateMutation.mutate({ id: next.id, data: { status: "performing" } });
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
  const ordered = [...now, ...waiting, ...done];

  const waitingCount = waiting.length;
  const doneCount = done.length;
  const currentSong = requests.find(r => r.status === "performing");

  return (
    <div 
      dir="rtl" 
      className="min-h-screen p-3"
      style={{ background: "#020617", color: "#e5e7eb" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
          <div>
            <div className="text-[1.2rem] font-semibold">ניהול תור קריוקי</div>
            <div className="text-[0.8rem]" style={{ color: "#9ca3af" }}>
              בחר מצב תצוגה: ניהול למפעיל / מסך גדול לקהל
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div 
              className="inline-flex rounded-full p-0.5"
              style={{ background: "#020617", border: "1px solid #111827" }}
            >
              <button
                onClick={() => setViewMode("admin")}
                className={`border-0 px-3 py-1.5 rounded-full cursor-pointer text-[0.9rem] whitespace-nowrap ${
                  viewMode === "admin" 
                    ? "font-semibold" 
                    : ""
                }`}
                style={{
                  background: viewMode === "admin" ? "#22c55e" : "transparent",
                  color: viewMode === "admin" ? "#022c22" : "#9ca3af"
                }}
              >
                מסך ניהול
              </button>
              <button
                onClick={() => setViewMode("display")}
                className={`border-0 px-3 py-1.5 rounded-full cursor-pointer text-[0.9rem] whitespace-nowrap ${
                  viewMode === "display" 
                    ? "font-semibold" 
                    : ""
                }`}
                style={{
                  background: viewMode === "display" ? "#22c55e" : "transparent",
                  color: viewMode === "display" ? "#022c22" : "#9ca3af"
                }}
              >
                מסך תצוגה לקהל
              </button>
            </div>
            <div 
              className="text-[0.8rem] py-1 px-2.5 rounded-full"
              style={{ background: "rgba(15,23,42,0.9)", border: "1px solid #111827", color: "#9ca3af" }}
            >
              תור: {waitingCount} ממתינים · {doneCount} בוצעו
            </div>
          </div>
        </div>

        {viewMode === "admin" ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.3fr)" }}>
            <style jsx>{`
              @media (max-width: 900px) {
                div[style*="grid-template-columns"] {
                  grid-template-columns: minmax(0, 1fr) !important;
                }
              }
            `}</style>

            <div 
              className="rounded-2xl p-3"
              style={{ background: "rgba(15,23,42,0.96)", border: "1px solid #111827", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <div className="text-base font-semibold">תור שירים</div>
                  <div className="text-[0.8rem]" style={{ color: "#9ca3af" }}>
                    מכאן אתה שולט על מי שר עכשיו, הבא בתור, ודילוגים.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goNextAuto}
                    className="border-0 rounded-full py-1 px-3 text-[0.8rem] cursor-pointer inline-flex items-center gap-1 whitespace-nowrap font-semibold"
                    style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#022c22" }}
                    onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    הבא בתור ▶️
                  </button>
                  <button
                    onClick={markCurrentDone}
                    className="border rounded-full py-1 px-3 text-[0.8rem] cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                    style={{ background: "transparent", color: "#e5e7eb", borderColor: "#374151" }}
                    onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    סמן בוצע ✅
                  </button>
                </div>
              </div>

              <div 
                className="rounded-xl overflow-auto"
                style={{ maxHeight: "60vh", border: "1px solid #1f2937" }}
              >
                <table className="w-full text-[0.85rem]" style={{ borderCollapse: "collapse" }}>
                  <thead className="sticky top-0 z-10" style={{ background: "#020617" }}>
                    <tr>
                      <th className="p-1.5 text-right text-[0.8rem] font-semibold whitespace-nowrap" style={{ color: "#9ca3af", borderBottom: "1px solid #111827" }}>#</th>
                      <th className="p-1.5 text-right text-[0.8rem] font-semibold whitespace-nowrap" style={{ color: "#9ca3af", borderBottom: "1px solid #111827" }}>שם זמר</th>
                      <th className="p-1.5 text-right text-[0.8rem] font-semibold whitespace-nowrap" style={{ color: "#9ca3af", borderBottom: "1px solid #111827" }}>שם השיר</th>
                      <th className="p-1.5 text-right text-[0.8rem] font-semibold whitespace-nowrap" style={{ color: "#9ca3af", borderBottom: "1px solid #111827" }}>אמן</th>
                      <th className="p-1.5 text-right text-[0.8rem] font-semibold whitespace-nowrap" style={{ color: "#9ca3af", borderBottom: "1px solid #111827" }}>סטטוס</th>
                      <th className="p-1.5 text-right text-[0.8rem] font-semibold whitespace-nowrap" style={{ color: "#9ca3af", borderBottom: "1px solid #111827" }}>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordered.map((req, index) => (
                      <tr key={req.id}>
                        <td className="p-1.5 text-right" style={{ 
                          borderBottom: "1px solid #111827",
                          background: index % 2 === 0 ? "rgba(15,23,42,0.9)" : "rgba(15,23,42,0.8)"
                        }}>{index + 1}</td>
                        <td className="p-1.5 text-right" style={{ 
                          borderBottom: "1px solid #111827",
                          background: index % 2 === 0 ? "rgba(15,23,42,0.9)" : "rgba(15,23,42,0.8)"
                        }}>{req.singer_name}</td>
                        <td className="p-1.5 text-right" style={{ 
                          borderBottom: "1px solid #111827",
                          background: index % 2 === 0 ? "rgba(15,23,42,0.9)" : "rgba(15,23,42,0.8)"
                        }}>{req.song_title}</td>
                        <td className="p-1.5 text-right" style={{ 
                          borderBottom: "1px solid #111827",
                          background: index % 2 === 0 ? "rgba(15,23,42,0.9)" : "rgba(15,23,42,0.8)"
                        }}>{req.song_artist || "-"}</td>
                        <td className="p-1.5 text-right" style={{ 
                          borderBottom: "1px solid #111827",
                          background: index % 2 === 0 ? "rgba(15,23,42,0.9)" : "rgba(15,23,42,0.8)"
                        }}>
                          <span 
                            className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[0.7rem] font-medium"
                            style={{
                              background: req.status === "waiting" ? "rgba(59,130,246,0.1)" : 
                                         req.status === "performing" ? "rgba(34,197,94,0.12)" : "rgba(148,163,184,0.14)",
                              color: req.status === "waiting" ? "#93c5fd" : 
                                     req.status === "performing" ? "#86efac" : "#cbd5f5"
                            }}
                          >
                            {req.status === "waiting" ? "ממתין" : req.status === "performing" ? "מתנגן עכשיו" : "בוצע"}
                          </span>
                        </td>
                        <td className="p-1.5 text-right whitespace-nowrap" style={{ 
                          borderBottom: "1px solid #111827",
                          background: index % 2 === 0 ? "rgba(15,23,42,0.9)" : "rgba(15,23,42,0.8)"
                        }}>
                          <button
                            onClick={() => setNowPlaying(req.id)}
                            className="border rounded-full py-1 px-2.5 text-[0.8rem] cursor-pointer"
                            style={{ background: "transparent", color: "#e5e7eb", borderColor: "#374151" }}
                          >
                            שיר זה עכשיו
                          </button>
                          <button
                            onClick={() => skipRequest(req.id)}
                            className="border rounded-full py-1 px-2.5 text-[0.8rem] cursor-pointer mr-1"
                            style={{ background: "transparent", color: "#e5e7eb", borderColor: "#374151" }}
                          >
                            דלג
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-2.5 text-[0.75rem] text-center" style={{ color: "#9ca3af" }}>
                הטבלה מחוברת ל־Database של Base44 ומתעדכנת אוטומטית כשמישהו נרשם דרך הטופס.
              </div>
            </div>

            <div 
              className="rounded-2xl p-3"
              style={{ background: "rgba(15,23,42,0.96)", border: "1px solid #111827", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <div className="text-base font-semibold">כאן ועכשיו</div>
                  <div className="text-[0.8rem]" style={{ color: "#9ca3af" }}>
                    תקציר מהיר למה שקורה במועדון.
                  </div>
                </div>
                <button
                  onClick={addDemoSong}
                  className="border rounded-full py-1 px-2.5 text-[0.8rem] cursor-pointer"
                  style={{ background: "transparent", color: "#e5e7eb", borderColor: "#374151" }}
                >
                  הוסף שיר לדוגמה לבדיקה
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {!currentSong ? (
                  <div className="text-[0.8rem]" style={{ color: "#9ca3af" }}>
                    כרגע אין שיר שמתנגן. לחץ "הבא בתור" כדי להתחיל.
                  </div>
                ) : (
                  <>
                    <div className="font-semibold">עכשיו שר: {currentSong.singer_name}</div>
                    <div className="text-[0.8rem]" style={{ color: "#9ca3af" }}>
                      השיר: {currentSong.song_title}{currentSong.song_artist ? ` · ${currentSong.song_artist}` : ""}
                    </div>
                  </>
                )}
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #111827", margin: "10px 0" }} />

              <div className="flex flex-col gap-1.5">
                <div className="text-[0.8rem]" style={{ color: "#9ca3af" }}>הבאים בתור:</div>
                {waiting.length === 0 ? (
                  <div className="text-[0.8rem]" style={{ color: "#9ca3af" }}>אין שירים ממתינים כרגע.</div>
                ) : (
                  waiting.slice(0, 5).map((r, i) => (
                    <div key={r.id} className="text-[0.8rem]" style={{ color: "#9ca3af" }}>
                      {i + 1}. {r.singer_name} – {r.song_title}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[80vh] flex flex-col gap-3">
            <div className="text-center mb-1">
              <h1 className="m-0 font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)" }}>
                ערב קריוקי
              </h1>
              <p className="mt-1 mb-0" style={{ fontSize: "clamp(0.8rem, 1.4vw, 0.95rem)", color: "#9ca3af" }}>
                המסך מציג מי שר עכשיו ומי הבא בתור. להצטרפות – סרקו את ה־QR במועדון.
              </p>
            </div>

            <div className="grid gap-2.5 items-stretch" style={{ gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.2fr)" }}>
              <style jsx>{`
                @media (max-width: 850px) {
                  div[style*="grid-template-columns"]:not(:first-child) {
                    grid-template-columns: minmax(0, 1fr) !important;
                  }
                }
              `}</style>

              <div 
                className="rounded-[22px] flex flex-col justify-center"
                style={{
                  background: "radial-gradient(circle at top left, #22c55e33, #020617 55%)",
                  border: "1px solid #16a34a",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.6)",
                  padding: "clamp(14px, 2vw, 20px)",
                  minHeight: "220px"
                }}
              >
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

              <div 
                className="rounded-[18px] p-3"
                style={{ background: "rgba(15,23,42,0.96)", border: "1px solid #111827", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}
              >
                <div className="font-semibold mb-1.5" style={{ fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                  הבאים בתור
                </div>
                {waiting.length === 0 ? (
                  <div className="py-1" style={{ borderBottom: "1px dashed #1f2937" }}>
                    <div className="text-[0.9rem] font-semibold">אין כרגע שירים ממתינים</div>
                    <div className="text-[0.8rem]" style={{ color: "#9ca3af" }}>
                      הצטרפו לתור דרך הטופס או ה־QR 📱
                    </div>
                  </div>
                ) : (
                  waiting.slice(0, 6).map((r, i) => (
                    <div 
                      key={r.id}
                      className="py-1"
                      style={{ 
                        borderBottom: i === waiting.slice(0, 6).length - 1 ? "none" : "1px dashed #1f2937"
                      }}
                    >
                      <div className="text-[0.9rem] font-semibold">
                        {i + 1}. {r.singer_name}
                      </div>
                      <div className="text-[0.8rem]" style={{ color: "#9ca3af" }}>
                        {r.song_title}{r.song_artist ? ` · ${r.song_artist}` : ""}
                      </div>
                    </div>
                  ))
                )}

                <div className="mt-2 text-[0.8rem]" style={{ color: "#9ca3af" }}>
                  כאן תוכל בעתיד להוסיף QR-code של טופס ההרשמה, או את קישור הווטסאפ:
                  <br />
                  <span>קבוצת הווטסאפ: </span>
                  <span>https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15?mode=hqrt3</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 text-[0.75rem] text-center" style={{ color: "#9ca3af" }}>
              להצגה על מסך גדול: פתח את ה־URL הזה בכרום, לחץ F11 למצב מסך מלא, והשאר על "מסך תצוגה לקהל".
            </div>
          </div>
        )}
      </div>
    </div>
  );
}