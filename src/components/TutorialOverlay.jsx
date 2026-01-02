import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function TutorialOverlay({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if tutorial was already shown
    try {
      const tutorialShown = localStorage.getItem('apiryon_tutorial_shown');
      if (!tutorialShown) {
        setTimeout(() => setIsVisible(true), 1000);
      } else {
        onComplete();
      }
    } catch (e) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, [onComplete]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('apiryon_tutorial_shown', 'true');
    } catch (e) {
      // Silent fail
    }
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const tutorials = [
    {
      title: "ברוכים הבאים! 🎉",
      description: "בואו נראה איך להשתמש במערכת בשלושה שלבים פשוטים",
      highlight: null,
      position: "center"
    },
    {
      title: "סרגל הניווט 📱",
      description: "לחצו על הכפתור הזה בפינה הימנית התחתונה כדי לפתוח את התפריט",
      highlight: "menu-button",
      position: "bottom-right",
      arrow: "bottom-right"
    },
    {
      title: "מלאו את הפרטים ✍️",
      description: "הזינו את השם, שם השיר ושם האמן, ולחצו על 'שלח לתור!' כדי להצטרף",
      highlight: "form-section",
      position: "center",
      arrow: "center"
    }
  ];

  const currentTutorial = tutorials[step - 1];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(4px)",
              zIndex: 9998
            }}
            onClick={step === 1 ? handleNext : null}
          />

          {/* Spotlight Effect */}
          {currentTutorial.highlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                zIndex: 9999,
                pointerEvents: "none",
                ...(currentTutorial.highlight === "menu-button" && {
                  bottom: "10px",
                  right: "10px",
                  width: "76px",
                  height: "76px",
                  borderRadius: "50%",
                  boxShadow: "0 0 0 2000px rgba(0, 0, 0, 0.85), 0 0 40px 10px rgba(0, 202, 255, 0.6)",
                  border: "3px solid #00caff"
                }),
                ...(currentTutorial.highlight === "form-section" && {
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "calc(100% - 40px)",
                  maxWidth: "500px",
                  height: "auto",
                  minHeight: "400px",
                  borderRadius: "20px",
                  boxShadow: "0 0 0 2000px rgba(0, 0, 0, 0.85), 0 0 40px 10px rgba(0, 202, 255, 0.6)",
                  border: "3px solid #00caff"
                })
              }}
            />
          )}

          {/* Tutorial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ delay: 0.2 }}
            style={{
              position: "fixed",
              zIndex: 10000,
              ...(currentTutorial.position === "center" && {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
              }),
              ...(currentTutorial.position === "bottom-right" && {
                bottom: "120px",
                right: "20px"
              }),
              background: "rgba(15, 23, 42, 0.98)",
              borderRadius: "20px",
              padding: "30px",
              maxWidth: "380px",
              width: "calc(100% - 40px)",
              border: "2px solid rgba(0, 202, 255, 0.5)",
              boxShadow: "0 0 60px rgba(0, 202, 255, 0.4)"
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleSkip}
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                background: "rgba(248, 113, 113, 0.2)",
                border: "1px solid rgba(248, 113, 113, 0.4)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#f87171"
              }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                color: "#00caff",
                marginBottom: "16px",
                textShadow: "0 0 20px rgba(0, 202, 255, 0.5)"
              }}>
                {currentTutorial.title}
              </h2>

              <p style={{
                fontSize: "1rem",
                color: "#e2e8f0",
                lineHeight: "1.6",
                marginBottom: "24px"
              }}>
                {currentTutorial.description}
              </p>

              {/* Animated Arrow for Menu Button */}
              {currentTutorial.arrow === "bottom-right" && (
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    fontSize: "3rem",
                    marginBottom: "20px"
                  }}
                >
                  ↓
                </motion.div>
              )}

              {/* Progress Dots */}
              <div style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                marginBottom: "20px"
              }}>
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    style={{
                      width: dot === step ? "24px" : "8px",
                      height: "8px",
                      borderRadius: "4px",
                      background: dot === step ? "#00caff" : "rgba(100, 116, 139, 0.5)",
                      transition: "all 0.3s"
                    }}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center"
              }}>
                <button
                  onClick={handleSkip}
                  style={{
                    padding: "12px 24px",
                    background: "rgba(100, 116, 139, 0.2)",
                    border: "1px solid rgba(100, 116, 139, 0.4)",
                    borderRadius: "12px",
                    color: "#94a3b8",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  דלג
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #00caff, #0088ff)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#001a2e",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 0 20px rgba(0, 202, 255, 0.4)"
                  }}
                >
                  {step === 3 ? "סיימתי!" : "הבא"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}