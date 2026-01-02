import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Camera, Download, Share2, Upload, X, Plus, MessageSquare, Star, Quote } from "lucide-react";
import ApyironLogo from "../components/ApyironLogo";
import MenuButton from "../components/MenuButton";

export default function Gallery() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAddingWatermarks, setIsAddingWatermarks] = useState(false);
  const [watermarkProgress, setWatermarkProgress] = useState({ current: 0, total: 0 });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  
  const queryClient = useQueryClient();

  React.useEffect(() => {
    let mounted = true;
    async function checkAdmin() {
      try {
        const user = await base44.auth.me();
        if (mounted) {
          setIsAdmin(user?.role === 'admin');
        }
      } catch (err) {
        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setAuthChecked(true);
        }
      }
    }
    checkAdmin();
    return () => { mounted = false; };
  }, []);

  const handleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(img => img.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) {
      alert('לא נבחרו תמונות למחיקה');
      return;
    }

    if (!confirm(`למחוק ${selectedImages.length} תמונות?`)) {
      return;
    }

    try {
      for (const imageId of selectedImages) {
        await base44.entities.GalleryImage.delete(imageId);
      }
      alert(`✅ נמחקו ${selectedImages.length} תמונות`);
      setSelectedImages([]);
      setSelectionMode(false);
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    } catch (err) {
      alert('שגיאה במחיקה: ' + err.message);
    }
  };

  const handleAddWatermarksToAll = async () => {
    if (!confirm('להוסיף לוגו לכל התמונות בגלריה? זה עלול לקחת כמה דקות...')) {
      return;
    }

    setIsAddingWatermarks(true);
    setWatermarkProgress({ current: 0, total: 0 });

    try {
      // שליפת כל התמונות
      const allImages = await base44.entities.GalleryImage.list('-created_date', 1000);
      console.log('סה"כ תמונות למעבד:', allImages.length);
      setWatermarkProgress({ current: 0, total: allImages.length });

      let processed = 0;
      let updated = 0;
      for (const image of allImages) {
        try {
          console.log(`מעבד תמונה ${processed + 1}/${allImages.length}...`);

          // הוספת לוגו (ללא דילוג!)
          const result = await base44.functions.invoke('addWatermark', {
            image_url: image.image_url
          });

          console.log('תוצאה:', result.data);

          if (result.data.watermarked_url) {
            // עדכון התמונה בדטאבייס
            await base44.entities.GalleryImage.update(image.id, {
              image_url: result.data.watermarked_url,
              thumbnail_url: result.data.watermarked_url
            });
            console.log('תמונה עודכנה בהצלחה!');
            updated++;
          }

          processed++;
          setWatermarkProgress({ current: processed, total: allImages.length });
        } catch (err) {
          console.error('שגיאה בעיבוד תמונה:', image.id, err);
          processed++;
          setWatermarkProgress({ current: processed, total: allImages.length });
        }
      }

      alert(`✅ הלוגו התווסף ל-${updated} תמונות!`);
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    } catch (err) {
      console.error('שגיאה כללית:', err);
      alert('שגיאה: ' + err.message);
    } finally {
      setIsAddingWatermarks(false);
      setWatermarkProgress({ current: 0, total: 0 });
    }
  };

  // Track page view
  React.useEffect(() => {
    const trackView = async () => {
      try {
        let userIdentifier = 'anonymous';
        try {
          const user = await base44.auth.me();
          userIdentifier = user?.email || 'anonymous';
        } catch (err) {
          userIdentifier = 'anonymous';
        }

        await base44.entities.GalleryView.create({
          user_identifier: userIdentifier,
          gallery_id: selectedGallery?.id || null
        });
      } catch (err) {
        // Silent fail for tracking
      }
    };
    trackView();
  }, [selectedGallery]);

  const { data: galleries = [], isLoading: galleriesLoading, error: galleriesError } = useQuery({
    queryKey: ['galleries'],
    queryFn: async () => {
      return await base44.entities.GalleryCategory.filter({ is_active: true }, '-date', 50);
    },
    retry: 2,
    staleTime: 60000,
  });

  const { data: images = [], isLoading: imagesLoading, error: imagesError } = useQuery({
    queryKey: ['gallery-images', selectedGallery?.id],
    queryFn: async () => {
      return await base44.entities.GalleryImage.filter({ gallery_id: selectedGallery.id }, '-created_date', 500);
    },
    enabled: !!selectedGallery,
    retry: 2,
    staleTime: 60000,
  });

  const { data: approvedFeedbacks = [] } = useQuery({
    queryKey: ['approved-feedbacks'],
    queryFn: async () => {
      return await base44.entities.GalleryFeedback.filter({ is_approved: true }, '-created_date', 10);
    },
    staleTime: 60000,
  });

  const handleDownload = async (imageUrl, filename, imageId) => {
    try {
      // Track download
      try {
        let userIdentifier = 'anonymous';
        try {
          const user = await base44.auth.me();
          userIdentifier = user?.email || 'anonymous';
        } catch (err) {
          userIdentifier = 'anonymous';
        }

        await base44.entities.GalleryDownload.create({
          image_id: imageId,
          gallery_id: selectedGallery?.id || null,
          user_identifier: userIdentifier
        });
      } catch (err) {
        // Silent fail for tracking
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'apiryon-photo.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('שגיאה בהורדת התמונה');
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/Gallery`;
    const text = `🎤✨ הייתם אתמול באפריון?\n\n📸 כנסו עכשיו לגלריה וחפשו את התמונות שלכם!\n💾 הורידו את כל הרגעים המיוחדים שלכם בחינם\n\n${shareUrl}\n\n🎉 מועדון הקריוקי המוביל בצפון!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareImage = async (imageUrl, imageName) => {
    try {
      // Try Web Share API (works on mobile)
      if (navigator.share && navigator.canShare) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], imageName || 'apiryon-photo.jpg', { type: blob.type });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'תמונה מאפריון',
            text: '📸 תראו אותי בתמונה הזו מאפריון! 🎤✨'
          });
          return;
        }
      }
    } catch (err) {
      // Fallback to WhatsApp with link
    }
    
    // Fallback: WhatsApp with image link
    const text = `📸 תראו אותי בתמונה הזו מאפריון! 🎤✨\n\n${imageUrl}\n\n🎉 מועדון הקריוקי המוביל בצפון!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/972525400396?text=היי%20אפריון!%20רוצה%20להזמין%20שולחן%20🎤', '_blank');
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await base44.entities.GalleryFeedback.create({
        name: formData.get('name'),
        message: formData.get('message'),
        rating: parseInt(formData.get('rating')) || 5
      });
      
      alert('תודה על המשוב! 🙏');
      setShowFeedbackForm(false);
      e.target.reset();
    } catch (err) {
      alert('שגיאה בשליחת המשוב');
    }
  };

  const isLoading = !authChecked || galleriesLoading;

  if (isLoading) {
    return (
      <div dir="rtl" style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
        color: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <ApyironLogo size="medium" showCircle={true} />
          <div style={{ fontSize: "1.5rem", color: "#00caff", marginTop: "20px" }}>טוען גלריה...</div>
        </div>
      </div>
    );
  }

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
            📸 גלריית התמונות שלנו
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#cbd5e1", lineHeight: "1.6", maxWidth: "800px", margin: "0 auto" }}>
            כל הרגעים המיוחדים מערבי הקריוקי באפריון - תמונות, חיוכים וזיכרונות בלתי נשכחים 🎤✨
          </p>

          {/* Big CTA Button */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            style={{ marginTop: "32px", marginBottom: "16px" }}
          >
            <button
              onClick={handleWhatsAppContact}
              style={{
                padding: "20px 48px",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                color: "#001a2e",
                border: "none",
                borderRadius: "16px",
                fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
                fontWeight: "900",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                boxShadow: "0 0 40px rgba(251, 191, 36, 0.6)",
                width: "100%",
                maxWidth: "600px",
                margin: "0 auto"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0 60px rgba(251, 191, 36, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(251, 191, 36, 0.6)";
              }}
            >
              🎤 הזמינו מקום לשבוע הבא!
            </button>
          </motion.div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
            <button
              onClick={handleShare}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 0 20px rgba(37, 211, 102, 0.4)"
              }}
            >
              <Share2 className="w-5 h-5" />
              שתף בווטסאפ
            </button>

            <button
              onClick={() => setShowFeedbackForm(true)}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
              }}
            >
              <Star className="w-5 h-5" />
              השאירו ביקורת
            </button>

            <button
              onClick={() => window.open('https://chat.whatsapp.com/KgbFSjNZtna645X5iRkB15', '_blank')}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 0 20px rgba(37, 211, 102, 0.4)"
              }}
            >
              📢 הצטרפו לקבוצת העדכונים
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setSelectionMode(!selectionMode)}
                  style={{
                    padding: "12px 24px",
                    background: selectionMode ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
                  }}
                >
                  {selectionMode ? '❌ ביטול' : '✏️ מצב בחירה'}
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #00caff, #0088ff)",
                    color: "#001a2e",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 0 20px rgba(0, 202, 255, 0.4)"
                  }}
                >
                  <Plus className="w-5 h-5" />
                  הוסף גלריה חדשה
                </button>
              </>
            )}
          </div>
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(0, 202, 255, 0.2)",
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "40px",
            boxShadow: "0 10px 30px rgba(0, 202, 255, 0.1)"
          }}
        >
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#00caff", marginBottom: "20px" }}>
            הסיפור שלנו 📖
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#e2e8f0", lineHeight: "1.8", marginBottom: "16px" }}>
            בין ההרים של מירון לאוויר הצלול של הגליל, הקמנו מקום שיודע לעשות שמח באמת. 
            אפריון הוא לא עוד מועדון קריוקי – הוא הבית של מי שאוהב לשיר, לרקוד ולשמוח מכל הלב.
          </p>
          <p style={{ fontSize: "1.1rem", color: "#e2e8f0", lineHeight: "1.8" }}>
            כל תמונה בגלריה הזו מספרת סיפור של שמחה, של אנשים טובים, ושל רגעים שנשארים בלב. 
            תהנו מהתמונות, הורידו מה שאתם אוהבים, ושתפו עם החברים! 🎤✨
          </p>
        </motion.div>

        {/* Reviews Section */}
        {approvedFeedbacks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "2px solid rgba(251, 191, 36, 0.3)",
              borderRadius: "20px",
              padding: "40px",
              marginBottom: "40px",
              boxShadow: "0 10px 30px rgba(251, 191, 36, 0.2)"
            }}
          >
            <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fbbf24", marginBottom: "30px", textAlign: "center" }}>
              ⭐ מה אומרים המבקרים שלנו
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px"
            }}>
              {approvedFeedbacks.slice(0, 4).map((feedback) => (
                <div
                  key={feedback.id}
                  style={{
                    background: "rgba(30, 41, 59, 0.5)",
                    border: "1px solid rgba(251, 191, 36, 0.2)",
                    borderRadius: "16px",
                    padding: "24px",
                    position: "relative"
                  }}
                >
                  <Quote className="w-8 h-8" style={{ color: "rgba(251, 191, 36, 0.3)", marginBottom: "12px" }} />
                  
                  <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
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

                  <p style={{
                    fontSize: "1rem",
                    color: "#e2e8f0",
                    lineHeight: "1.6",
                    marginBottom: "16px",
                    fontStyle: "italic"
                  }}>
                    "{feedback.message}"
                  </p>

                  <div style={{
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    color: "#fbbf24"
                  }}>
                    - {feedback.name}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Selection Mode Controls */}
        {selectionMode && selectedGallery && (
          <div style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "2px solid rgba(139, 92, 246, 0.5)",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <button
              onClick={handleSelectAll}
              style={{
                padding: "10px 20px",
                background: "rgba(139, 92, 246, 0.2)",
                color: "#a78bfa",
                border: "2px solid rgba(139, 92, 246, 0.5)",
                borderRadius: "10px",
                fontSize: "0.95rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {selectedImages.length === images.length ? '❌ בטל הכל' : '✅ סמן הכל'}
            </button>
            <div style={{ fontSize: "1rem", color: "#cbd5e1" }}>
              נבחרו: {selectedImages.length} תמונות
            </div>
            {selectedImages.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                style={{
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)"
                }}
              >
                🗑️ מחק נבחרים
              </button>
            )}
          </div>
        )}

        {/* Galleries Grid */}
        {!selectedGallery ? (
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fbbf24", marginBottom: "24px" }}>
              בחר גלריה 🎨
            </h2>
            
            {galleriesError ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(248, 113, 113, 0.1)",
                borderRadius: "20px",
                border: "2px solid rgba(248, 113, 113, 0.3)"
              }}>
                <p style={{ fontSize: "1.2rem", color: "#f87171", marginBottom: "12px" }}>
                  ⚠️ שגיאה בטעינת הגלריות
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(0, 202, 255, 0.2)",
                    color: "#00caff",
                    border: "1px solid rgba(0, 202, 255, 0.3)",
                    borderRadius: "12px",
                    cursor: "pointer"
                  }}
                >
                  נסה שוב
                </button>
              </div>
            ) : galleries.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(15, 23, 42, 0.5)",
                borderRadius: "20px",
                border: "2px dashed rgba(0, 202, 255, 0.3)"
              }}>
                <Camera className="w-16 h-16" style={{ margin: "0 auto 20px", color: "#64748b" }} />
                <p style={{ fontSize: "1.2rem", color: "#64748b" }}>
                  עדיין אין גלריות. בקרוב תמונות מהערבים שלנו!
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px"
              }}>
                {galleries.map((gallery) => (
                  <motion.div
                    key={gallery.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelectedGallery(gallery)}
                    style={{
                      background: "rgba(15, 23, 42, 0.95)",
                      border: "2px solid rgba(0, 202, 255, 0.3)",
                      borderRadius: "20px",
                      padding: "24px",
                      cursor: "pointer",
                      boxShadow: "0 10px 30px rgba(0, 202, 255, 0.2)",
                      transition: "all 0.3s"
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>📸</div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#00caff", marginBottom: "8px" }}>
                      {gallery.name}
                    </h3>
                    <p style={{ fontSize: "1rem", color: "#94a3b8", marginBottom: "12px" }}>
                      📅 {new Date(gallery.date).toLocaleDateString('he-IL')}
                    </p>
                    {gallery.description && (
                      <p style={{ fontSize: "0.95rem", color: "#cbd5e1", lineHeight: "1.5" }}>
                        {gallery.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setSelectedGallery(null)}
              style={{
                padding: "10px 20px",
                background: "rgba(0, 202, 255, 0.1)",
                color: "#00caff",
                border: "1px solid rgba(0, 202, 255, 0.3)",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "24px"
              }}
            >
              ← חזרה לגלריות
            </button>

            <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fbbf24", marginBottom: "24px" }}>
              {selectedGallery.name} - {images.length} תמונות
            </h2>

            {images.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(15, 23, 42, 0.5)",
                borderRadius: "20px"
              }}>
                <p style={{ fontSize: "1.2rem", color: "#64748b" }}>
                  אין תמונות בגלריה זו
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "20px"
              }}>
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      if (selectionMode) {
                        if (selectedImages.includes(img.id)) {
                          setSelectedImages(selectedImages.filter(id => id !== img.id));
                        } else {
                          setSelectedImages([...selectedImages, img.id]);
                        }
                      } else {
                        setSelectedImage(img);
                      }
                    }}
                    style={{
                      position: "relative",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                      aspectRatio: "1",
                      background: "rgba(15, 23, 42, 0.5)",
                      border: selectionMode && selectedImages.includes(img.id) ? "4px solid #a78bfa" : "none"
                    }}
                  >
                    {selectionMode && (
                      <div style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: selectedImages.includes(img.id) ? "#a78bfa" : "rgba(0,0,0,0.5)",
                        border: "3px solid white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10
                      }}>
                        {selectedImages.includes(img.id) && <span style={{ color: "white", fontSize: "1.2rem" }}>✓</span>}
                      </div>
                    )}
                    <img
                      src={img.image_url}
                      alt="תמונה מהגלריה"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:0.9rem;">⚠️ שגיאה בטעינת תמונה</div>';
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        background: "#1e293b"
                      }}
                    />
                    {!selectionMode && (
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "12px",
                        background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px"
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(img.image_url, img.original_filename, img.id);
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "rgba(0, 202, 255, 0.9)",
                            color: "#001a2e",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <Download className="w-4 h-4" />
                          הורד
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareImage(img.image_url, img.original_filename);
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "rgba(37, 211, 102, 0.9)",
                            color: "#001a2e",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                          שתף
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(248, 113, 113, 0.9)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={selectedImage.image_url}
            alt="תצוגה מקדימה"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "16px",
              boxShadow: "0 0 60px rgba(0, 202, 255, 0.3)"
            }}
          />

          <div style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            gap: "12px"
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedImage.image_url, selectedImage.original_filename, selectedImage.id);
              }}
              style={{
                padding: "14px 28px",
                background: "linear-gradient(135deg, #00caff, #0088ff)",
                color: "#001a2e",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
              }}
            >
              <Download className="w-5 h-5" />
              הורד
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShareImage(selectedImage.image_url, selectedImage.original_filename);
              }}
              style={{
                padding: "14px 28px",
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 0 30px rgba(37, 211, 102, 0.5)"
              }}
            >
              <Share2 className="w-5 h-5" />
              שתף בווטסאפ
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackForm && (
        <div
          onClick={() => setShowFeedbackForm(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(15, 23, 42, 0.98)",
              border: "2px solid rgba(245, 158, 11, 0.5)",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 0 60px rgba(245, 158, 11, 0.3)"
            }}
          >
            <h3 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#8b5cf6", marginBottom: "24px" }}>
              נשמח לשמוע ממך! 💜
            </h3>
            
            <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "6px" }}>
                  השם שלך
                </label>
                <input
                  name="name"
                  required
                  placeholder="לדוגמה: דוד כהן"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #1f2937",
                    background: "rgba(15,23,42,0.9)",
                    color: "#f9fafb",
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "6px" }}>
                  דירוג (1-5 כוכבים)
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1,2,3,4,5].map(num => (
                    <label key={num} style={{ cursor: "pointer" }}>
                      <input type="radio" name="rating" value={num} defaultChecked={num === 5} style={{ display: "none" }} />
                      <Star className="w-8 h-8" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "6px" }}>
                  המשוב שלך
                </label>
                <textarea
                  name="message"
                  required
                  placeholder="מה אהבת? מה אפשר לשפר?"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #1f2937",
                    background: "rgba(15,23,42,0.9)",
                    color: "#f9fafb",
                    fontSize: "1rem",
                    resize: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  שלח משוב
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  style={{
                    padding: "14px 20px",
                    background: "rgba(248, 113, 113, 0.2)",
                    color: "#f87171",
                    border: "2px solid rgba(248, 113, 113, 0.4)",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal - Admin Only */}
      {isAdmin && showUploadModal && (
        <UploadGalleryModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['galleries'] });
            setShowUploadModal(false);
          }}
        />
      )}

      <MenuButton />
    </div>
  );
}

// Upload Modal Component
function UploadGalleryModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [galleryData, setGalleryData] = useState({ name: '', date: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGalleryCreate = async () => {
    if (!galleryData.name || !galleryData.date) {
      alert('נא למלא שם ותאריך');
      return;
    }
    setStep(2);
  };

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('נא לבחור תמונות');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create gallery
      const gallery = await base44.entities.GalleryCategory.create(galleryData);
      
      // Upload images with watermark
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
        
        // העלאת התמונה המקורית
        const upload = await base44.integrations.Core.UploadFile({ file });
        
        // הוספת watermark
        const watermarkResult = await base44.functions.invoke('addWatermark', {
          image_url: upload.file_url
        });
        
        // שמירה בדאטה בייס עם הלוגו
        await base44.entities.GalleryImage.create({
          gallery_id: gallery.id,
          image_url: watermarkResult.data.watermarked_url,
          thumbnail_url: watermarkResult.data.watermarked_url,
          original_filename: file.name
        });
      }
      
      alert('✅ הגלריה הועלתה בהצלחה עם לוגו אפריון!');
      onSuccess();
    } catch (err) {
      alert('שגיאה בהעלאת הגלריה: ' + err.message);
      console.error(err);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(15, 23, 42, 0.98)",
          border: "2px solid rgba(0, 202, 255, 0.5)",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 0 60px rgba(0, 202, 255, 0.3)"
        }}
      >
        <h3 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#00caff", marginBottom: "24px" }}>
          {step === 1 ? '📸 צור גלריה חדשה' : '🖼️ העלה תמונות'}
        </h3>

        {step === 1 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "6px" }}>
                שם הגלריה *
              </label>
              <input
                value={galleryData.name}
                onChange={(e) => setGalleryData({...galleryData, name: e.target.value})}
                placeholder="לדוגמה: ערב קריוקי 15.1.2026"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "#f9fafb",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "6px" }}>
                תאריך *
              </label>
              <input
                type="date"
                value={galleryData.date}
                onChange={(e) => setGalleryData({...galleryData, date: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "#f9fafb",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "6px" }}>
                תיאור (אופציונלי)
              </label>
              <textarea
                value={galleryData.description}
                onChange={(e) => setGalleryData({...galleryData, description: e.target.value})}
                placeholder="תיאור קצר על הערב..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #1f2937",
                  background: "rgba(15,23,42,0.9)",
                  color: "#f9fafb",
                  fontSize: "1rem",
                  resize: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={handleGalleryCreate}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "linear-gradient(135deg, #00caff, #0088ff)",
                  color: "#001a2e",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                המשך →
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "14px 20px",
                  background: "rgba(248, 113, 113, 0.2)",
                  color: "#f87171",
                  border: "2px solid rgba(248, 113, 113, 0.4)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="gallery-files"
              style={{
                display: "block",
                padding: "60px 20px",
                border: "3px dashed rgba(0, 202, 255, 0.5)",
                borderRadius: "16px",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(0, 202, 255, 0.05)",
                marginBottom: "20px"
              }}
            >
              <Upload className="w-12 h-12" style={{ margin: "0 auto 16px", color: "#00caff" }} />
              <div style={{ fontSize: "1.2rem", color: "#00caff", fontWeight: "700", marginBottom: "8px" }}>
                לחץ לבחירת תמונות
              </div>
              <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                ניתן לבחור מספר תמונות בבת אחת
              </div>
              <input
                id="gallery-files"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesSelect}
                style={{ display: "none" }}
              />
            </label>

            {selectedFiles.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "1rem", color: "#cbd5e1", marginBottom: "12px" }}>
                  נבחרו {selectedFiles.length} תמונות
                </div>
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} style={{ fontSize: "0.9rem", color: "#94a3b8", padding: "4px 0" }}>
                      ✓ {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isUploading && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "8px" }}>
                  מעלה תמונות... {progress}%
                </div>
                <div style={{
                  width: "100%",
                  height: "8px",
                  background: "rgba(0, 202, 255, 0.2)",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(135deg, #00caff, #0088ff)",
                    transition: "width 0.3s"
                  }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: isUploading ? "rgba(100, 116, 139, 0.5)" : "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: isUploading ? "not-allowed" : "pointer"
                }}
              >
                {isUploading ? `מעלה... ${progress}%` : '✓ העלה'}
              </button>
              <button
                onClick={() => setStep(1)}
                disabled={isUploading}
                style={{
                  padding: "14px 20px",
                  background: "rgba(148, 163, 184, 0.2)",
                  color: "#94a3b8",
                  border: "2px solid rgba(148, 163, 184, 0.4)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: isUploading ? "not-allowed" : "pointer"
                }}
              >
                ← חזור
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Gallery.isPublic = true;