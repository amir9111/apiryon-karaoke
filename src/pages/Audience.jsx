import React from "react";

export default function Audience() {
  const [requests, setRequests] = React.useState([]);

  React.useEffect(() => {
    function loadData() {
      fetch('/api/entities/KaraokeRequest?sort=-created_date&limit=50')
        .then(res => res.json())
        .then(data => setRequests(data || []))
        .catch(err => console.error(err));
    }
    
    loadData();
    const timer = setInterval(loadData, 3000);
    return () => clearInterval(timer);
  }, []);

  const current = requests.find(r => r.status === "performing");
  const next = requests.filter(r => r.status === "waiting")[0];

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "#020617",
      color: "#fff",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <h1 style={{ textAlign: "center", fontSize: "3rem", color: "#00caff", marginBottom: "60px" }}>
          🎤 APIRYON קריוקי
        </h1>

        {current && (
          <div style={{
            background: "rgba(15, 23, 42, 0.9)",
            borderRadius: "30px",
            padding: "60px",
            marginBottom: "40px",
            border: "3px solid #00caff",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "1.5rem", color: "#00caff", marginBottom: "20px" }}>
              שר עכשיו
            </div>
            
            {current.photo_url && (
              <img 
                src={current.photo_url} 
                alt={current.singer_name}
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "30px",
                  border: "5px solid #00caff"
                }}
              />
            )}

            <div style={{ fontSize: "4rem", fontWeight: "900", marginBottom: "20px" }}>
              {current.singer_name}
            </div>
            <div style={{ fontSize: "2.5rem", color: "#e2e8f0" }}>
              {current.song_title}
            </div>
            {current.song_artist && (
              <div style={{ fontSize: "1.8rem", color: "#94a3b8", marginTop: "10px" }}>
                {current.song_artist}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 900 ? "1fr 1fr" : "1fr", gap: "30px" }}>
          
          <div style={{
            background: "rgba(15, 23, 42, 0.9)",
            borderRadius: "25px",
            padding: "40px",
            border: "2px solid #00caff",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "1.8rem", color: "#00caff", marginBottom: "30px" }}>
              הבא בתור
            </div>
            
            {next ? (
              <>
                {next.photo_url && (
                  <img 
                    src={next.photo_url} 
                    alt={next.singer_name}
                    style={{
                      width: "140px",
                      height: "140px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "20px",
                      border: "4px solid #00caff"
                    }}
                  />
                )}
                <div style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "10px" }}>
                  {next.singer_name}
                </div>
                <div style={{ fontSize: "1.5rem", color: "#cbd5e1" }}>
                  {next.song_title}
                </div>
                {next.song_artist && (
                  <div style={{ fontSize: "1.2rem", color: "#94a3b8", marginTop: "8px" }}>
                    {next.song_artist}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "#64748b", fontSize: "1.5rem", padding: "40px" }}>
                אין ממתינים
              </div>
            )}
          </div>

          <div style={{
            background: "rgba(15, 23, 42, 0.9)",
            borderRadius: "25px",
            padding: "40px",
            border: "2px solid #00caff",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{ fontSize: "1.8rem", color: "#00caff", marginBottom: "20px" }}>
              הצטרפו לווצאפ
            </div>
            <div style={{
              width: "200px",
              height: "200px",
              background: "#fff",
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4rem"
            }}>
              📱
            </div>
            <div style={{ marginTop: "20px", fontSize: "1.2rem", color: "#cbd5e1" }}>
              סרקו להצטרפות
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Audience.isPublic = true;