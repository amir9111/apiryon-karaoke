import React from "react";

export default function AudienceDisplay() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  function loadData() {
    fetch('/api/entities/KaraokeRequest?sort=-created_date&limit=50')
      .then(res => res.json())
      .then(requests => {
        const performing = requests.find(r => r.status === "performing");
        const waiting = requests.filter(r => r.status === "waiting");
        setData({ performing, next: waiting[0] });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2rem"
      }}>
        טוען...
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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <h1 style={{
          textAlign: "center",
          fontSize: "3rem",
          color: "#00caff",
          marginBottom: "40px",
          textShadow: "0 0 30px rgba(0, 202, 255, 0.6)"
        }}>
          🎤 APIRYON - תצוגת קריוקי
        </h1>

        {/* Current Song */}
        {data?.performing ? (
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "30px",
            padding: "60px 40px",
            marginBottom: "40px",
            border: "3px solid rgba(0, 202, 255, 0.4)",
            boxShadow: "0 0 60px rgba(0, 202, 255, 0.3)",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "1.5rem",
              color: "#00caff",
              marginBottom: "20px",
              textShadow: "0 0 20px rgba(0, 202, 255, 0.8)"
            }}>
              🎤 שר עכשיו על הבמה
            </div>

            {data.performing.photo_url && (
              <img 
                src={data.performing.photo_url} 
                alt={data.performing.singer_name}
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "5px solid rgba(0, 202, 255, 0.5)",
                  marginBottom: "30px"
                }}
              />
            )}

            <div style={{
              fontSize: "4rem",
              fontWeight: "900",
              marginBottom: "20px",
              color: "#ffffff"
            }}>
              {data.performing.singer_name}
            </div>

            <div style={{
              fontSize: "2.5rem",
              color: "#e2e8f0",
              marginBottom: "10px"
            }}>
              {data.performing.song_title}
            </div>

            {data.performing.song_artist && (
              <div style={{
                fontSize: "1.8rem",
                color: "#94a3b8"
              }}>
                {data.performing.song_artist}
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

        {/* Next Singer and QR */}
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
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#00caff",
              marginBottom: "30px"
            }}>
              ⏭️ הבא בתור
            </div>

            {data?.next ? (
              <div>
                {data.next.photo_url && (
                  <img 
                    src={data.next.photo_url} 
                    alt={data.next.singer_name}
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid rgba(0, 202, 255, 0.4)",
                      marginBottom: "20px"
                    }}
                  />
                )}

                <div style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "#f1f5f9",
                  marginBottom: "15px"
                }}>
                  {data.next.singer_name}
                </div>

                <div style={{
                  fontSize: "1.6rem",
                  color: "#cbd5e1",
                  marginBottom: "8px"
                }}>
                  {data.next.song_title}
                </div>

                {data.next.song_artist && (
                  <div style={{
                    fontSize: "1.3rem",
                    color: "#94a3b8"
                  }}>
                    {data.next.song_artist}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#00caff",
              marginBottom: "30px"
            }}>
              💬 הצטרפו לקבוצת הווצאפ
            </div>

            <div style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              width: "260px",
              height: "260px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{
                width: "200px",
                height: "200px",
                background: "#020617",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem"
              }}>
                📱
              </div>
            </div>

            <div style={{
              marginTop: "30px",
              fontSize: "1.3rem",
              color: "#cbd5e1",
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