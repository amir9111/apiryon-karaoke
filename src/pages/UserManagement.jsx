import React, { useState, useEffect } from "react";
import NavigationMenu from "../components/NavigationMenu";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Shield, User, Search, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function UserManagement() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (!currentUser || currentUser.role !== 'admin') {
          window.location.href = '/';
        }
      } catch (err) {
        window.location.href = '/';
      }
    };
    checkAuth();
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers;
    },
    enabled: !!user
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => 
      base44.entities.User.update(userId, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)"
      }}>
        <div className="spinner" style={{
          width: "60px",
          height: "60px",
          border: "6px solid rgba(0, 202, 255, 0.3)",
          borderTop: "6px solid #00caff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#fff",
      padding: "40px 20px"
    }}>
      <NavigationMenu />

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px"
          }}
        >
          <Users className="w-10 h-10" style={{ color: "#00caff" }} />
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "900",
            background: "linear-gradient(90deg, #00caff 0%, #0088ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            ניהול משתמשים
          </h1>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            marginBottom: "30px",
            position: "relative"
          }}
        >
          <Search 
            className="w-5 h-5" 
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b"
            }}
          />
          <input
            type="text"
            placeholder="חפש משתמש לפי שם או מייל..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 48px 14px 20px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "2px solid rgba(0, 202, 255, 0.3)",
              borderRadius: "14px",
              color: "#fff",
              fontSize: "1rem",
              outline: "none"
            }}
          />
        </motion.div>

        {/* Users List */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="spinner" style={{
              width: "50px",
              height: "50px",
              border: "5px solid rgba(0, 202, 255, 0.3)",
              borderTop: "5px solid #00caff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto"
            }} />
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredUsers.map((u, index) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "2px solid rgba(0, 202, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    color: "#e2e8f0",
                    marginBottom: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    {u.full_name || 'משתמש ללא שם'}
                    {u.role === 'admin' && (
                      <span style={{
                        padding: "4px 10px",
                        background: "rgba(251, 191, 36, 0.2)",
                        border: "1px solid rgba(251, 191, 36, 0.4)",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        color: "#fbbf24",
                        fontWeight: "600"
                      }}>
                        <Shield className="w-3 h-3" style={{ display: "inline", marginLeft: "4px" }} />
                        מנהל
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                    {u.email}
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  gap: "12px"
                }}>
                  <button
                    onClick={() => updateRoleMutation.mutate({ userId: u.id, newRole: 'user' })}
                    disabled={u.role === 'user'}
                    style={{
                      padding: "12px 20px",
                      background: u.role === 'user' 
                        ? "rgba(0, 202, 255, 0.3)" 
                        : "rgba(15, 23, 42, 0.5)",
                      border: u.role === 'user'
                        ? "2px solid rgba(0, 202, 255, 0.5)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                      borderRadius: "12px",
                      color: u.role === 'user' ? "#00caff" : "#94a3b8",
                      cursor: u.role === 'user' ? "default" : "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    {u.role === 'user' && <Check className="w-4 h-4" />}
                    <User className="w-4 h-4" />
                    משתמש
                  </button>

                  <button
                    onClick={() => updateRoleMutation.mutate({ userId: u.id, newRole: 'admin' })}
                    disabled={u.role === 'admin'}
                    style={{
                      padding: "12px 20px",
                      background: u.role === 'admin'
                        ? "rgba(251, 191, 36, 0.3)"
                        : "rgba(15, 23, 42, 0.5)",
                      border: u.role === 'admin'
                        ? "2px solid rgba(251, 191, 36, 0.5)"
                        : "2px solid rgba(100, 116, 139, 0.3)",
                      borderRadius: "12px",
                      color: u.role === 'admin' ? "#fbbf24" : "#94a3b8",
                      cursor: u.role === 'admin' ? "default" : "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    {u.role === 'admin' && <Check className="w-4 h-4" />}
                    <Shield className="w-4 h-4" />
                    מנהל
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredUsers.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#64748b",
                fontSize: "1.1rem"
              }}>
                לא נמצאו משתמשים
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}