import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Eye } from "lucide-react";
import ApyironLogo from "../components/ApyironLogo";
import MenuButton from "../components/MenuButton";

export default function GalleryStats() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [currentUserEmail, setCurrentUserEmail] = React.useState(null);

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
          window.location.href = '/';
        } else {
          setIsAdmin(true);
          setCurrentUserEmail(user.email);
        }
      } catch (err) {
        window.location.href = '/';
      }
    };
    checkAdmin();
  }, []);

  const { data: views = [] } = useQuery({
    queryKey: ['gallery-views'],
    queryFn: () => base44.entities.GalleryView.list('-created_date', 1000),
    enabled: isAdmin
  });

  const { data: downloads = [] } = useQuery({
    queryKey: ['gallery-downloads'],
    queryFn: () => base44.entities.GalleryDownload.list('-created_date', 1000),
    enabled: isAdmin
  });

  const { data: galleries = [] } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => base44.entities.GalleryCategory.list('-date', 100),
    enabled: isAdmin
  });

  const { data: images = [] } = useQuery({
    queryKey: ['all-images'],
    queryFn: () => base44.entities.GalleryImage.list('-created_date', 1000),
    enabled: isAdmin
  });

  if (!isAdmin) {
    return null;
  }

  // Calculate stats
  const totalViews = views.length;
  const totalDownloads = downloads.length;

  // Get all visitors with their details (exclude current user)
  const visitorsList = views
    .filter(view => view.user_identifier !== currentUserEmail)
    .reduce((acc, view) => {
      const existing = acc.find(v => v.user_identifier === view.user_identifier);
      if (existing) {
        existing.visits++;
      } else {
        acc.push({
          user_identifier: view.user_identifier,
          visits: 1,
          first_visit: view.created_date
        });
      }
      return acc;
    }, []).sort((a, b) => b.visits - a.visits);

  // Views by gallery
  const viewsByGallery = {};
  views.forEach(v => {
    if (v.gallery_id) {
      viewsByGallery[v.gallery_id] = (viewsByGallery[v.gallery_id] || 0) + 1;
    }
  });

  const galleryViewsData = galleries.map(g => ({
    name: g.name,
    views: viewsByGallery[g.id] || 0
  })).sort((a, b) => b.views - a.views).slice(0, 10);

  // Downloads by image
  const downloadsByImage = {};
  downloads.forEach(d => {
    downloadsByImage[d.image_id] = (downloadsByImage[d.image_id] || 0) + 1;
  });

  const topDownloadedImages = Object.entries(downloadsByImage)
    .map(([imageId, count]) => ({
      imageId,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Views over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const viewsByDate = {};
  views.forEach(v => {
    const date = new Date(v.created_date).toISOString().split('T')[0];
    viewsByDate[date] = (viewsByDate[date] || 0) + 1;
  });

  const viewsTimelineData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
    views: viewsByDate[date] || 0
  }));

  const COLORS = ['#00caff', '#fbbf24', '#8b5cf6', '#10b981', '#f87171'];

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#f9fafb",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <ApyironLogo size="medium" showCircle={true} />
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: "900",
            color: "#00caff",
            marginTop: "20px",
            marginBottom: "16px",
            textShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
          }}>
            📊 סטטיסטיקות גלריה
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#cbd5e1" }}>
            מעקב אחר צפיות והורדות מהגלריה
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "40px"
        }}>
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "2px solid rgba(0, 202, 255, 0.3)",
            borderRadius: "20px",
            padding: "24px",
            textAlign: "center"
          }}>
            <Eye className="w-12 h-12" style={{ margin: "0 auto 16px", color: "#00caff" }} />
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#00caff", marginBottom: "8px" }}>
              {totalViews}
            </div>
            <div style={{ fontSize: "1rem", color: "#cbd5e1" }}>סך כניסות לגלריה</div>
          </div>

          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "2px solid rgba(251, 191, 36, 0.3)",
            borderRadius: "20px",
            padding: "24px",
            textAlign: "center"
          }}>
            <Download className="w-12 h-12" style={{ margin: "0 auto 16px", color: "#fbbf24" }} />
            <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#fbbf24", marginBottom: "8px" }}>
              {totalDownloads}
            </div>
            <div style={{ fontSize: "1rem", color: "#cbd5e1" }}>סך הורדות תמונות</div>
          </div>
        </div>

        {/* Visitors List */}
        <div style={{
          background: "rgba(15, 23, 42, 0.95)",
          borderRadius: "20px",
          padding: "24px",
          border: "2px solid rgba(0, 202, 255, 0.3)",
          marginBottom: "40px"
        }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#00caff", marginBottom: "20px" }}>
            👥 רשימת מבקרים
          </h3>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {visitorsList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                עדיין אין מבקרים
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {visitorsList.map((visitor, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "16px",
                      background: "rgba(30, 41, 59, 0.5)",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 202, 255, 0.2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "1rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "4px" }}>
                        {visitor.user_identifier}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                        ביקור ראשון: {new Date(visitor.first_visit).toLocaleDateString('he-IL', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div style={{
                      padding: "8px 16px",
                      background: "rgba(0, 202, 255, 0.1)",
                      borderRadius: "8px",
                      color: "#00caff",
                      fontWeight: "700",
                      fontSize: "0.9rem"
                    }}>
                      {visitor.visits} ביקורים
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Views Timeline */}
        <div style={{
          background: "rgba(15, 23, 42, 0.95)",
          border: "2px solid rgba(0, 202, 255, 0.3)",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "30px"
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#00caff", marginBottom: "24px" }}>
            צפיות ב-7 ימים אחרונים
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viewsTimelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(0, 202, 255, 0.3)",
                  borderRadius: "8px",
                  color: "#f9fafb"
                }}
              />
              <Bar dataKey="views" fill="#00caff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Galleries */}
        {galleryViewsData.length > 0 && (
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "2px solid rgba(251, 191, 36, 0.3)",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#fbbf24", marginBottom: "24px" }}>
              הגלריות הפופולריות ביותר
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={galleryViewsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={150} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: "8px",
                    color: "#f9fafb"
                  }}
                />
                <Bar dataKey="views" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Downloaded Images */}
        {topDownloadedImages.length > 0 && (
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "2px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "20px",
            padding: "30px"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#a78bfa", marginBottom: "24px" }}>
              התמונות הכי מורדות (Top 5)
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {topDownloadedImages.map((item, idx) => {
                const image = images.find(img => img.id === item.imageId);
                return (
                  <div key={item.imageId} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    background: "rgba(30, 41, 59, 0.5)",
                    borderRadius: "12px",
                    border: "1px solid rgba(139, 92, 246, 0.2)"
                  }}>
                    <div style={{
                      fontSize: "1.5rem",
                      fontWeight: "900",
                      color: COLORS[idx % COLORS.length],
                      minWidth: "40px"
                    }}>
                      #{idx + 1}
                    </div>
                    {image && (
                      <img
                        src={image.image_url}
                        alt="תמונה"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "8px",
                          objectFit: "cover"
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "1rem", color: "#e2e8f0", marginBottom: "4px" }}>
                        {image?.original_filename || 'תמונה'}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                        הורדה {item.count} פעמים
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <MenuButton />
    </div>
  );
}

GalleryStats.isPublic = false;