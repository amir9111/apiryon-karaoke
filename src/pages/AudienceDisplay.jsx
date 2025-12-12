import React from "react";
import ApyironLogo from "../components/ApyironLogo";
import AudioWave from "../components/AudioWave";
import { QrCode } from "lucide-react";

export default function AudienceDisplay() {
  const [currentSong, setCurrentSong] = React.useState(null);
  const [nextSong, setNextSong] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  function loadData() {
    fetch('/api/entities/KaraokeRequest?sort=-created_date&limit=50')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then(requests => {
        const performing = requests.find(r => r.status === "performing");
        const waiting = requests.filter(r => r.status === "waiting");
        
        setCurrentSong(performing || null);
        setNextSong(waiting.length > 0 ? waiting[0] : null);
        setLoading(false);
        setError(null);
      })
      .catch(err => {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      });
  }

  if (loading) {
    return (
      <div dir="rtl" style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f1f5f9"
      }}>
        <div style={{ textAlign: "center" }}>
          <ApyironLogo size="large" showCircle={true} />
          <div style={{ fontSize: "1.5rem", marginTop: "20px" }}>טוען...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f1f5f9",
        padding: "20px"
      }}>
        <div style={{ textAlign: "center" }}>
          <ApyironLogo size="medium" showCircle={true} />
          <div style={{ fontSize: "1.5rem", marginTop: "20px", color: "#f87171" }}>שגיאה בטעינת הנתונים</div>
          <div style={{ fontSize: "1rem", marginTop: "10px", color: "#94a3b8" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#f1f5f9",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <ApyironLogo size="large" showCircle={true} />
          <div style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "#00caff",
            marginTop: "20px",
            textShadow: "0 0 30px rgba(0, 202, 255, 0.6)"
          }}>
            🎤 תצוגת קריוקי לקהל
          </div>
        </div>

        {/* Current Song */}
        {currentSong ? (
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "30px",
            padding: "60px 40px",
            marginBottom: "40px",
            border: "3px solid rgba(0, 202, 255, 0.4)",
            boxShadow: "0 0 60px rgba(0, 202, 255, 0.3)",
            textAlign: "center"
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <AudioWave isPlaying={true} />
            </div>
            
            <div style={{
              fontSize: "1.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#00caff",
              marginBottom: "20px",
              textShadow: "0 0 20px rgba(0, 202, 255, 0.8)"
            }}>
              🎤 שר עכשיו על הבמה
            </div>

            {currentSong.photo_url && (
              <div style={{ marginBottom: "30px" }}>
                <img 
                  src={currentSong.photo_url} 
                  alt={currentSong.singer_name}
                  style={{
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "5px solid rgba(0, 202, 255, 0.5)",
                    boxShadow: "0 0 40px rgba(0, 202, 255, 0.4)"
                  }}
                />
              </div>
            )}

            <div style={{
              fontSize: "4rem",
              fontWeight: "900",
              marginBottom: "20px",
              color: "#ffffff",
              textShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
            }}>
              {currentSong.singer_name}
            </div>

            <div style={{
              fontSize: "2.5rem",
              color: "#e2e8f0",
              marginBottom: "10px",
              fontWeight: "700"
            }}>
              {currentSong.song_title}
            </div>

            {currentSong.song_artist && (
              <div style={{
                fontSize: "1.8rem",
                color: "#94a3b8",
                fontWeight: "500"
              }}>
                {currentSong.song_artist}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "30px",
            padding: "60px 40px",
            marginBottom: "40px",
            border: "2px dashed rgba(0, 202, 255, 0.3)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🎵</div>
            <div style={{ fontSize: "2rem", color: "#94a3b8" }}>אין שיר מתנגן כרגע</div>
          </div>
        )}

        {/* Grid Layout for Next Singer and QR Code */}
        <div style={{
          display: "grid",
          gridTemplateColumns: window.innerWidth > 900 ? "1fr 1fr" : "1fr",
          gap: "30px"
        }}>
          {/* Next Singer */}
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "25px",
            padding: "40px 30px",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)"
          }}>
            <div style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#00caff",
              marginBottom: "30px",
              textAlign: "center",
              textShadow: "0 0 15px rgba(0, 202, 255, 0.5)"
            }}>
              ⏭️ הבא בתור
            </div>

            {nextSong ? (
              <div style={{ textAlign: "center" }}>
                {nextSong.photo_url && (
                  <div style={{ marginBottom: "20px" }}>
                    <img 
                      src={nextSong.photo_url} 
                      alt={nextSong.singer_name}
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "4px solid rgba(0, 202, 255, 0.4)",
                        boxShadow: "0 0 30px rgba(0, 202, 255, 0.3)"
                      }}
                    />
                  </div>
                )}

                <div style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "#f1f5f9",
                  marginBottom: "15px"
                }}>
                  {nextSong.singer_name}
                </div>

                <div style={{
                  fontSize: "1.6rem",
                  color: "#cbd5e1",
                  marginBottom: "8px",
                  fontWeight: "600"
                }}>
                  {nextSong.song_title}
                </div>

                {nextSong.song_artist && (
                  <div style={{
                    fontSize: "1.3rem",
                    color: "#94a3b8"
                  }}>
                    {nextSong.song_artist}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                color: "#64748b",
                fontSize: "1.5rem",
                padding: "40px 20px"
              }}>
                אין ממתינים בתור
              </div>
            )}
          </div>

          {/* QR Code */}
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "25px",
            padding: "40px 30px",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 202, 255, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#00caff",
              marginBottom: "30px",
              textAlign: "center",
              textShadow: "0 0 15px rgba(0, 202, 255, 0.5)"
            }}>
              💬 הצטרפו לקבוצת הווצאפ
            </div>

            <div style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 0 40px rgba(0, 202, 255, 0.3)"
            }}>
              <QrCode style={{ width: "200px", height: "200px", color: "#020617" }} />
            </div>

            <div style={{
              marginTop: "30px",
              fontSize: "1.3rem",
              color: "#cbd5e1",
              textAlign: "center",
              lineHeight: "1.6"
            }}>
              סרקו להצטרפות מהירה<br />
              ועדכונים על ערבי קריוקי
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

AudienceDisplay.isPublic = true;