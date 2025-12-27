import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Trophy, TrendingUp, Star, Music, Award, Target } from "lucide-react";
import NavigationMenu from "../components/NavigationMenu";
import ApyironLogo from "../components/ApyironLogo";

export default function Statistics() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser?.role !== 'admin') {
          window.location.href = '/Home';
        }
      } catch (error) {
        window.location.href = '/Home';
      }
    };
    fetchUser();
  }, []);

  const { data: requests = [] } = useQuery({
    queryKey: ['karaoke-requests'],
    queryFn: () => base44.entities.KaraokeRequest.list('-created_date', 1000),
    refetchInterval: 10000,
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  // Top Singers (by average rating)
  const singerStats = {};
  requests.forEach(req => {
    if (req.status === 'done' && req.average_rating > 0) {
      if (!singerStats[req.singer_name]) {
        singerStats[req.singer_name] = {
          name: req.singer_name,
          totalRating: 0,
          count: 0,
          totalPerformances: 0
        };
      }
      singerStats[req.singer_name].totalRating += req.average_rating;
      singerStats[req.singer_name].count += 1;
    }
    if (req.status === 'done') {
      if (!singerStats[req.singer_name]) {
        singerStats[req.singer_name] = {
          name: req.singer_name,
          totalRating: 0,
          count: 0,
          totalPerformances: 0
        };
      }
      singerStats[req.singer_name].totalPerformances += 1;
    }
  });

  const topSingers = Object.values(singerStats)
    .map(s => ({
      name: s.name,
      avgRating: s.count > 0 ? (s.totalRating / s.count).toFixed(2) : 0,
      performances: s.totalPerformances,
      ratingCount: s.count
    }))
    .filter(s => s.avgRating > 0)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 10);

  // Most Popular Songs
  const songStats = {};
  requests.forEach(req => {
    const songKey = `${req.song_title} - ${req.song_artist}`;
    if (!songStats[songKey]) {
      songStats[songKey] = {
        song: req.song_title,
        artist: req.song_artist,
        count: 0,
        totalRating: 0,
        ratingCount: 0
      };
    }
    songStats[songKey].count += 1;
    if (req.average_rating > 0) {
      songStats[songKey].totalRating += req.average_rating;
      songStats[songKey].ratingCount += 1;
    }
  });

  const topSongs = Object.values(songStats)
    .map(s => ({
      name: `${s.song} - ${s.artist}`,
      count: s.count,
      avgRating: s.ratingCount > 0 ? (s.totalRating / s.ratingCount).toFixed(2) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Status Distribution
  const statusData = [
    { name: "הושלם", value: requests.filter(r => r.status === 'done').length, color: "#10b981" },
    { name: "בתור", value: requests.filter(r => r.status === 'waiting').length, color: "#fbbf24" },
    { name: "מבוטל", value: requests.filter(r => r.status === 'skipped').length, color: "#f87171" },
    { name: "שר עכשיו", value: requests.filter(r => r.status === 'performing').length, color: "#00caff" }
  ];

  // General Stats
  const totalRequests = requests.length;
  const completedRequests = requests.filter(r => r.status === 'done').length;
  const avgRating = requests
    .filter(r => r.average_rating > 0)
    .reduce((sum, r) => sum + r.average_rating, 0) / 
    requests.filter(r => r.average_rating > 0).length || 0;

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#fff",
      padding: "20px"
    }}>
      <NavigationMenu />

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px", marginTop: "60px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <ApyironLogo size="medium" showCircle={true} />
          </div>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "900",
            background: "linear-gradient(90deg, #00caff, #0088ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "10px"
          }}>
            📊 סטטיסטיקות ותחרות
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
            ניתוח מעמיק של ביצועי הזמרים והשירים הפופולריים
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "40px"
        }}>
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "20px",
            padding: "24px",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            boxShadow: "0 10px 40px rgba(0, 202, 255, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <Music className="w-8 h-8" style={{ color: "#00caff" }} />
              <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>
                סה"כ בקשות
              </div>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#00caff" }}>
              {totalRequests}
            </div>
          </div>

          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "20px",
            padding: "24px",
            border: "2px solid rgba(16, 185, 129, 0.3)",
            boxShadow: "0 10px 40px rgba(16, 185, 129, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <Target className="w-8 h-8" style={{ color: "#10b981" }} />
              <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>
                הושלם
              </div>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#10b981" }}>
              {completedRequests}
            </div>
          </div>

          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "20px",
            padding: "24px",
            border: "2px solid rgba(251, 191, 36, 0.3)",
            boxShadow: "0 10px 40px rgba(251, 191, 36, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <Star className="w-8 h-8" style={{ color: "#fbbf24" }} />
              <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>
                דירוג ממוצע
              </div>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#fbbf24" }}>
              {avgRating.toFixed(1)} ⭐
            </div>
          </div>

          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "20px",
            padding: "24px",
            border: "2px solid rgba(139, 92, 246, 0.3)",
            boxShadow: "0 10px 40px rgba(139, 92, 246, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <TrendingUp className="w-8 h-8" style={{ color: "#a78bfa" }} />
              <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>
                זמרים ייחודיים
              </div>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#a78bfa" }}>
              {Object.keys(singerStats).length}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "30px",
          marginBottom: "40px"
        }}>
          {/* Status Distribution */}
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "20px",
            padding: "30px",
            border: "1px solid rgba(0, 202, 255, 0.2)"
          }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#00caff",
              marginBottom: "20px"
            }}>
              התפלגות סטטוס
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Songs */}
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "20px",
            padding: "30px",
            border: "1px solid rgba(0, 202, 255, 0.2)"
          }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#00caff",
              marginBottom: "20px"
            }}>
              🎵 שירים פופולריים
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSongs.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(0, 202, 255, 0.3)",
                    borderRadius: "10px"
                  }}
                />
                <Bar dataKey="count" fill="#00caff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Singers Leaderboard */}
        <div style={{
          background: "rgba(15, 23, 42, 0.95)",
          borderRadius: "20px",
          padding: "30px",
          border: "2px solid rgba(251, 191, 36, 0.3)",
          boxShadow: "0 10px 40px rgba(251, 191, 36, 0.2)",
          marginBottom: "40px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "30px" }}>
            <Trophy className="w-10 h-10" style={{ color: "#fbbf24" }} />
            <h2 style={{
              fontSize: "2rem",
              fontWeight: "900",
              color: "#fbbf24",
              margin: 0
            }}>
              🏆 ליגת הזמרים
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {topSingers.map((singer, idx) => {
              const medalEmoji = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "";
              const borderColor = idx === 0 ? "#fbbf24" : idx === 1 ? "#94a3b8" : idx === 2 ? "#fb923c" : "rgba(0, 202, 255, 0.2)";
              
              return (
                <div
                  key={idx}
                  style={{
                    background: "rgba(30, 41, 59, 0.5)",
                    borderRadius: "16px",
                    padding: "20px",
                    border: `2px solid ${borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    transition: "transform 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${borderColor}, rgba(0, 0, 0, 0.3))`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: "900",
                    color: "#fff"
                  }}>
                    {medalEmoji || `#${idx + 1}`}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "1.3rem",
                      fontWeight: "800",
                      color: "#fff",
                      marginBottom: "6px"
                    }}>
                      {singer.name}
                    </div>
                    <div style={{
                      fontSize: "0.9rem",
                      color: "#94a3b8"
                    }}>
                      {singer.performances} ביצועים • {singer.ratingCount} דירוגים
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    color: "#fbbf24"
                  }}>
                    <Star className="w-6 h-6" fill="#fbbf24" />
                    {singer.avgRating}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Songs Table */}
        <div style={{
          background: "rgba(15, 23, 42, 0.95)",
          borderRadius: "20px",
          padding: "30px",
          border: "1px solid rgba(0, 202, 255, 0.2)"
        }}>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#00caff",
            marginBottom: "20px"
          }}>
            📋 כל השירים
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "3fr 1fr 1fr",
            gap: "12px",
            fontSize: "0.9rem",
            color: "#94a3b8",
            fontWeight: "700",
            padding: "12px 16px",
            borderBottom: "2px solid rgba(0, 202, 255, 0.2)",
            marginBottom: "12px"
          }}>
            <div>שיר</div>
            <div style={{ textAlign: "center" }}>פעמים</div>
            <div style={{ textAlign: "center" }}>דירוג</div>
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {topSongs.map((song, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 1fr 1fr",
                  gap: "12px",
                  padding: "16px",
                  background: "rgba(30, 41, 59, 0.3)",
                  borderRadius: "12px",
                  marginBottom: "8px",
                  alignItems: "center"
                }}
              >
                <div style={{ color: "#e2e8f0", fontWeight: "600" }}>{song.name}</div>
                <div style={{ textAlign: "center", color: "#00caff", fontWeight: "700" }}>
                  {song.count}
                </div>
                <div style={{ textAlign: "center", color: "#fbbf24", fontWeight: "700" }}>
                  {song.avgRating > 0 ? `⭐ ${song.avgRating}` : "-"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}