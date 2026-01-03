import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, Users, Music, Sparkles, Phone, MapPin, Clock, Star, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApyironLogo from "../components/ApyironLogo";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const [showVideo, setShowVideo] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === 'admin');
      } catch (err) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['approved-feedbacks'],
    queryFn: async () => {
      const all = await base44.entities.GalleryFeedback.filter({ is_approved: true }, '-created_date', 20);
      return all;
    }
  });

  const { data: galleryImages = [] } = useQuery({
    queryKey: ['landing-gallery-images'],
    queryFn: async () => {
      const images = await base44.entities.GalleryImage.list('-created_date', 20);
      return images.filter(img => img.image_url);
    },
    refetchInterval: 30000
  });

  // Auto-advance carousel
  React.useEffect(() => {
    if (galleryImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div dir="rtl" style={{
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#f9fafb"
    }}>
      {/* Back Button */}
      <Link
        to={createPageUrl(isAdmin ? "Admin" : "Home")}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 20px",
          background: "rgba(0, 202, 255, 0.15)",
          border: "2px solid rgba(0, 202, 255, 0.4)",
          borderRadius: "50px",
          color: "#00caff",
          textDecoration: "none",
          fontSize: "1rem",
          fontWeight: "700",
          zIndex: 1000,
          boxShadow: "0 0 20px rgba(0, 202, 255, 0.3)",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0, 202, 255, 0.25)";
          e.currentTarget.style.transform = "translateX(5px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 202, 255, 0.15)";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        <ArrowRight className="w-5 h-5" />
        {isAdmin ? "חזרה לניהול" : "חזרה לרישום"}
      </Link>

      {/* Hero Section */}
      <section style={{
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        {/* Background Video/Image */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.3,
          background: "radial-gradient(circle at 50% 50%, rgba(0, 202, 255, 0.15) 0%, transparent 70%)"
        }} />

        {/* Hero Content */}
        <div style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "20px",
          maxWidth: "900px"
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ marginBottom: "40px" }}>
              <ApyironLogo size="large" showCircle={true} />
            </div>

            <h1 style={{
              fontSize: "clamp(2rem, 6vw, 4rem)",
              fontWeight: "900",
              color: "#ffffff",
              marginBottom: "24px",
              lineHeight: "1.2",
              textShadow: "0 0 40px rgba(0, 202, 255, 0.5)"
            }}>
              המועדון המוביל בארץ<br />
              לערבי קריוקי ובילויים
            </h1>

            <p style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
              color: "#cbd5e1",
              marginBottom: "40px",
              lineHeight: "1.6"
            }}>
              בין ההרים של מירון לאוויר הצלול של הגליל -<br />
              הבית של מי שאוהב לשיר, לרקוד ולשמוח מכל הלב 🎤✨
            </p>

            <div style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
              <Link
                to={createPageUrl("ReserveTable")}
                style={{
                  padding: "18px 48px",
                  background: "linear-gradient(135deg, #00caff, #0088ff)",
                  color: "#001a2e",
                  border: "none",
                  borderRadius: "50px",
                  fontSize: "1.3rem",
                  fontWeight: "800",
                  textDecoration: "none",
                  display: "inline-block",
                  boxShadow: "0 0 40px rgba(0, 202, 255, 0.6)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 0 60px rgba(0, 202, 255, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(0, 202, 255, 0.6)";
                }}
              >
                🎉 שמור שולחן עכשיו
              </Link>

              <a
                href="https://wa.me/972525400396?text=היי%20אפריון!%20אשמח%20לקבל%20פרטים%20נוספים%20על%20המועדון%20🎤"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "18px 48px",
                  background: "rgba(37, 211, 102, 0.2)",
                  color: "#ffffff",
                  border: "2px solid rgba(37, 211, 102, 0.4)",
                  borderRadius: "50px",
                  fontSize: "1.3rem",
                  fontWeight: "800",
                  textDecoration: "none",
                  display: "inline-block",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(37, 211, 102, 0.3)";
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(37, 211, 102, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(37, 211, 102, 0.2)";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                💬 דברו איתנו בווטסאפ
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#00caff",
            fontSize: "2rem"
          }}
        >
          ↓
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: "100px 20px",
        background: "rgba(15, 23, 42, 0.5)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: "900",
            textAlign: "center",
            color: "#00caff",
            marginBottom: "60px",
            textShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
          }}>
            למה אפריון? 🌟
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px"
          }}>
            {[
              { icon: <Music className="w-12 h-12" />, title: "מערכת קריוקי מתקדמת", desc: "אלפי שירים, איכות סאונד מושלמת ומסכים ענקיים" },
              { icon: <Users className="w-12 h-12" />, title: "שירות VIP", desc: "צוות מקצועי ושירות ברמה הגבוהה ביותר" },
              { icon: <Sparkles className="w-12 h-12" />, title: "אווירה בלתי נשכחת", desc: "עיצוב מרהיב, תאורה מיוחדת וחוויה שלא תשכחו" },
              { icon: <Calendar className="w-12 h-12" />, title: "אירועים שבועיים", desc: "ערבי קריוקי, DJ סטים ואירועים מיוחדים" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                style={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(0, 202, 255, 0.2)",
                  borderRadius: "24px",
                  padding: "40px 30px",
                  textAlign: "center",
                  boxShadow: "0 10px 30px rgba(0, 202, 255, 0.1)"
                }}
              >
                <div style={{ color: "#00caff", marginBottom: "20px" }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: "#ffffff",
                  marginBottom: "12px"
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: "#cbd5e1",
                  fontSize: "1rem",
                  lineHeight: "1.6"
                }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Carousel Section */}
      {galleryImages.length > 0 && (
        <section style={{
          padding: "100px 20px",
          background: "rgba(15, 23, 42, 0.5)"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: "900",
              textAlign: "center",
              color: "#00caff",
              marginBottom: "60px",
              textShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
            }}>
              📸 הגלריה שלנו
            </h2>

            <div style={{
              position: "relative",
              width: "100%",
              maxWidth: "900px",
              margin: "0 auto",
              height: "500px",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 202, 255, 0.3)"
            }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={galleryImages[currentImageIndex]?.image_url}
                  alt="תמונה מהגלריה"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              </AnimatePresence>

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "rgba(0, 202, 255, 0.9)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0, 202, 255, 0.5)",
                  transition: "all 0.3s",
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                  e.currentTarget.style.boxShadow = "0 6px 30px rgba(0, 202, 255, 0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 202, 255, 0.5)";
                }}
              >
                <ChevronRight className="w-6 h-6" style={{ color: "#001a2e" }} />
              </button>

              <button
                onClick={nextImage}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "rgba(0, 202, 255, 0.9)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0, 202, 255, 0.5)",
                  transition: "all 0.3s",
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                  e.currentTarget.style.boxShadow = "0 6px 30px rgba(0, 202, 255, 0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 202, 255, 0.5)";
                }}
              >
                <ChevronLeft className="w-6 h-6" style={{ color: "#001a2e" }} />
              </button>

              {/* Dots Indicator */}
              <div style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "10px",
                zIndex: 10
              }}>
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{
                      width: idx === currentImageIndex ? "30px" : "10px",
                      height: "10px",
                      borderRadius: "5px",
                      background: idx === currentImageIndex ? "#00caff" : "rgba(255, 255, 255, 0.4)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      boxShadow: idx === currentImageIndex ? "0 0 10px rgba(0, 202, 255, 0.8)" : "none"
                    }}
                  />
                ))}
              </div>

              {/* Image Counter */}
              <div style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                background: "rgba(0, 0, 0, 0.7)",
                padding: "8px 16px",
                borderRadius: "20px",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: "700",
                backdropFilter: "blur(10px)"
              }}>
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
            </div>

            {/* View All Gallery Button */}
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <Link
                to={createPageUrl("Gallery")}
                style={{
                  padding: "16px 40px",
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50px",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "inline-block",
                  boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 0 50px rgba(139, 92, 246, 0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(139, 92, 246, 0.5)";
                }}
              >
                📸 צפו בכל הגלריה
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Story Section */}
      <section style={{
        padding: "100px 20px"
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: "900",
            color: "#00caff",
            marginBottom: "40px",
            textShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
          }}>
            הסיפור שלנו 📖
          </h2>

          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(0, 202, 255, 0.2)",
            borderRadius: "24px",
            padding: "50px 40px",
            boxShadow: "0 10px 30px rgba(0, 202, 255, 0.2)"
          }}>
            <p style={{
              fontSize: "1.2rem",
              color: "#e2e8f0",
              lineHeight: "2",
              marginBottom: "20px"
            }}>
              בין ההרים של מירון לאוויר הצלול של הגליל, הקמנו מקום שיודע לעשות שמח באמת. 
              אפריון הוא לא עוד מועדון קריוקי – הוא הבית של מי שאוהב לשיר, לרקוד ולשמוח מכל הלב.
            </p>
            <p style={{
              fontSize: "1.2rem",
              color: "#e2e8f0",
              lineHeight: "2",
              marginBottom: "20px"
            }}>
              אצלנו אין פוזות. יש אווירה של טברנה אמיתית, אנשים טובים, ומוזיקה שנכנסת ישר לנשמה. 
              בנינו את המקום הזה כדי לתת לצפון חווית בילוי שלא מתפשרת: החל מהעיצוב החם, דרך הסאונד המדויק, ועד לאירוח כיד המלך.
            </p>
            <p style={{
              fontSize: "1.2rem",
              color: "#e2e8f0",
              lineHeight: "2"
            }}>
              בין אם אתם זמרים מקצועיים ובין אם באתם רק לפרוק אנרגיה עם החבר'ה – באפריון המיקרופון שלכם, והבמה היא הבית שלכם. ✨
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {feedbacks.length > 0 && (
        <section style={{
          padding: "100px 20px",
          background: "rgba(15, 23, 42, 0.5)"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: "900",
              textAlign: "center",
              color: "#fbbf24",
              marginBottom: "60px",
              textShadow: "0 0 30px rgba(251, 191, 36, 0.5)"
            }}>
              מה אומרים עלינו? ⭐
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "30px"
            }}>
              {feedbacks.slice(0, 6).map((feedback, idx) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  style={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "2px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: "20px",
                    padding: "30px",
                    boxShadow: "0 10px 30px rgba(251, 191, 36, 0.2)"
                  }}
                >
                  <div style={{ display: "flex", gap: "4px", marginBottom: "16px", justifyContent: "center" }}>
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

                  <p style={{
                    fontSize: "1.1rem",
                    color: "#e2e8f0",
                    lineHeight: "1.7",
                    marginBottom: "20px",
                    fontStyle: "italic"
                  }}>
                    "{feedback.message}"
                  </p>

                  <div style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#fbbf24",
                    textAlign: "center"
                  }}>
                    - {feedback.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section style={{
        padding: "100px 20px",
        background: "rgba(15, 23, 42, 0.5)",
        textAlign: "center"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "900",
            color: "#ffffff",
            marginBottom: "30px",
            lineHeight: "1.3"
          }}>
            מוכנים לערב בלתי נשכח? 🎤
          </h2>

          <p style={{
            fontSize: "1.3rem",
            color: "#cbd5e1",
            marginBottom: "50px"
          }}>
            שמרו את השולחן שלכם עכשיו ותהנו מחוויה מוזיקלית ייחודית!
          </p>

          <Link
            to={createPageUrl("ReserveTable")}
            style={{
              padding: "20px 60px",
              background: "linear-gradient(135deg, #00caff, #0088ff)",
              color: "#001a2e",
              border: "none",
              borderRadius: "50px",
              fontSize: "1.5rem",
              fontWeight: "900",
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 0 50px rgba(0, 202, 255, 0.6)",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 70px rgba(0, 202, 255, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 50px rgba(0, 202, 255, 0.6)";
            }}
          >
            🎉 שמור שולחן עכשיו
          </Link>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section style={{
        padding: "80px 20px",
        background: "rgba(15, 23, 42, 0.95)"
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: "900",
            textAlign: "center",
            color: "#00caff",
            marginBottom: "60px",
            textShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
          }}>
            צרו קשר 📞
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
            marginBottom: "50px"
          }}>
            <a href="tel:+972525400396" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
              <Phone className="w-10 h-10" style={{ color: "#00caff", margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
                טלפון
              </h3>
              <span style={{ color: "#cbd5e1", fontSize: "1.3rem", fontWeight: "700" }}>
                052-540-0396
              </span>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "8px" }}>
                📞 לחץ להתקשר
              </p>
            </a>

            <a href="https://wa.me/972525400396?text=היי%20אפריון!%20אשמח%20לקבל%20פרטים%20נוספים%20🎤" target="_blank" rel="noopener noreferrer" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
              <div style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 16px",
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem"
              }}>
                💬
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
                WhatsApp
              </h3>
              <span style={{ color: "#cbd5e1", fontSize: "1.1rem" }}>
                שלחו הודעה
              </span>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "8px" }}>
                💬 תגובה מהירה
              </p>
            </a>

            <div style={{ textAlign: "center" }}>
              <MapPin className="w-10 h-10" style={{ color: "#00caff", margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
                מיקום
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "1.1rem", marginBottom: "8px" }}>
                הגליל העליון, ישראל
              </p>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                📍 בין מירון לצפת
              </p>
            </div>
          </div>

          {/* Opening Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: "rgba(0, 202, 255, 0.1)",
              border: "2px solid rgba(0, 202, 255, 0.3)",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "600px",
              margin: "0 auto"
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <Clock className="w-12 h-12" style={{ color: "#00caff", margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#fff" }}>
                שעות פעילות
              </h3>
            </div>
            
            <div style={{ fontSize: "1.1rem", color: "#cbd5e1", lineHeight: "2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontWeight: "700" }}>ימי חמישי:</span>
                <span>21:00 - אחרון הלקוחות</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "700" }}>שאר הימים:</span>
                <span style={{ color: "#64748b" }}>סגור</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "40px 20px",
        textAlign: "center",
        borderTop: "1px solid rgba(0, 202, 255, 0.2)"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <ApyironLogo size="small" showCircle={false} />
        </div>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
          © 2025 מועדון אפריון | כל הזכויות שמורות
        </p>
        <div style={{ marginTop: "16px" }}>
          <Link to={createPageUrl("Terms")} style={{ color: "#00caff", textDecoration: "none", marginLeft: "20px" }}>
            תקנון
          </Link>
          <Link to={createPageUrl("Home")} style={{ color: "#00caff", textDecoration: "none" }}>
            הצטרף לקריוקי
          </Link>
        </div>
      </footer>
    </div>
  );
}

Landing.isPublic = true;