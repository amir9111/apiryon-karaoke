import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, X, Star, Trash2 } from "lucide-react";
import ApyironLogo from "../components/ApyironLogo";
import MenuButton from "../components/MenuButton";

export default function FeedbackManagement() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
          window.location.href = '/';
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        window.location.href = '/';
      }
    };
    checkAdmin();
  }, []);

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => base44.entities.GalleryFeedback.list('-created_date', 100),
    enabled: isAdmin
  });

  const approveMutation = useMutation({
    mutationFn: (id) => base44.entities.GalleryFeedback.update(id, { is_approved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GalleryFeedback.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
  });

  if (!isAdmin) {
    return null;
  }

  const pendingFeedbacks = feedbacks.filter(f => !f.is_approved);
  const approvedFeedbacks = feedbacks.filter(f => f.is_approved);

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#f9fafb",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
            💬 ניהול ביקורות
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#cbd5e1" }}>
            אשר או מחק ביקורות מהגלריה
          </p>
        </div>

        {/* Pending Reviews */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fbbf24", marginBottom: "24px" }}>
            ממתינות לאישור ({pendingFeedbacks.length})
          </h2>

          {pendingFeedbacks.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "rgba(15, 23, 42, 0.5)",
              borderRadius: "20px",
              border: "2px dashed rgba(251, 191, 36, 0.3)"
            }}>
              <p style={{ fontSize: "1.2rem", color: "#94a3b8" }}>
                אין ביקורות ממתינות לאישור 👍
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {pendingFeedbacks.map((feedback) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "2px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 10px 30px rgba(251, 191, 36, 0.2)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fbbf24", marginBottom: "8px" }}>
                        {feedback.name}
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className="w-5 h-5" 
                            style={{ 
                              color: i < (feedback.rating || 5) ? "#fbbf24" : "#64748b",
                              fill: i < (feedback.rating || 5) ? "#fbbf24" : "none"
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                      {new Date(feedback.created_date).toLocaleDateString('he-IL')}
                    </div>
                  </div>

                  <p style={{ fontSize: "1.1rem", color: "#e2e8f0", lineHeight: "1.6", marginBottom: "20px" }}>
                    "{feedback.message}"
                  </p>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => approveMutation.mutate(feedback.id)}
                      disabled={approveMutation.isPending}
                      style={{
                        flex: 1,
                        padding: "12px 24px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        opacity: approveMutation.isPending ? 0.5 : 1
                      }}
                    >
                      <Check className="w-5 h-5" />
                      אשר
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('האם למחוק ביקורת זו?')) {
                          deleteMutation.mutate(feedback.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      style={{
                        padding: "12px 24px",
                        background: "rgba(248, 113, 113, 0.2)",
                        color: "#f87171",
                        border: "2px solid rgba(248, 113, 113, 0.4)",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        opacity: deleteMutation.isPending ? 0.5 : 1
                      }}
                    >
                      <X className="w-5 h-5" />
                      מחק
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Reviews */}
        <div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#10b981", marginBottom: "24px" }}>
            ביקורות מאושרות ({approvedFeedbacks.length})
          </h2>

          {approvedFeedbacks.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "rgba(15, 23, 42, 0.5)",
              borderRadius: "20px"
            }}>
              <p style={{ fontSize: "1rem", color: "#94a3b8" }}>
                אין ביקורות מאושרות עדיין
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {approvedFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  style={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "2px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "20px",
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#10b981", marginBottom: "8px" }}>
                      {feedback.name}
                    </div>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-4 h-4" 
                          style={{ 
                            color: i < (feedback.rating || 5) ? "#fbbf24" : "#64748b",
                            fill: i < (feedback.rating || 5) ? "#fbbf24" : "none"
                          }} 
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: "1rem", color: "#cbd5e1" }}>
                      "{feedback.message}"
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('האם למחוק ביקורת זו?')) {
                        deleteMutation.mutate(feedback.id);
                      }
                    }}
                    style={{
                      padding: "10px",
                      background: "rgba(248, 113, 113, 0.1)",
                      color: "#f87171",
                      border: "1px solid rgba(248, 113, 113, 0.3)",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MenuButton />
    </div>
  );
}

FeedbackManagement.isPublic = false;