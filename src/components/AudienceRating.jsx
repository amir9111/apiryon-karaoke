import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import StarRating from "./StarRating";
import { Sparkles } from "lucide-react";

export default function AudienceRating({ currentSong, onRatingSubmitted }) {
  const [hasRated, setHasRated] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    // Check if user has already rated this song
    const userId = localStorage.getItem('apiryon_user_id') || generateUserId();
    localStorage.setItem('apiryon_user_id', userId);

    if (currentSong?.ratings) {
      const existingRating = currentSong.ratings.find(r => r.user_id === userId);
      if (existingRating) {
        setHasRated(true);
        setMyRating(existingRating.stars);
      }
    }
  }, [currentSong?.id]);

  const generateUserId = () => {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const handleRate = async (stars) => {
    if (isSubmitting || !currentSong) return;

    setIsSubmitting(true);
    const userId = localStorage.getItem('apiryon_user_id');

    try {
      const existingRatings = currentSong.ratings || [];
      const filteredRatings = existingRatings.filter(r => r.user_id !== userId);
      const newRatings = [...filteredRatings, { user_id: userId, stars }];
      
      const totalStars = newRatings.reduce((sum, r) => sum + r.stars, 0);
      const averageRating = totalStars / newRatings.length;

      await base44.entities.KaraokeRequest.update(currentSong.id, {
        ratings: newRatings,
        average_rating: averageRating
      });

      setMyRating(stars);
      setHasRated(true);
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentSong) return null;

  return (
    <div style={{
      background: "rgba(15, 23, 42, 0.96)",
      borderRadius: "20px",
      padding: "20px",
      border: "2px solid rgba(251, 191, 36, 0.3)",
      boxShadow: "0 0 40px rgba(251, 191, 36, 0.2)",
      textAlign: "center"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginBottom: "12px"
      }}>
        <Sparkles className="w-6 h-6" style={{ color: "#fbbf24" }} />
        <h3 style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#fbbf24",
          textShadow: "0 0 15px rgba(251, 191, 36, 0.5)",
          margin: 0
        }}>
          {hasRated ? "תודה על הדירוג! ⭐" : "דרגו את הזמר/ת!"}
        </h3>
        <Sparkles className="w-6 h-6" style={{ color: "#fbbf24" }} />
      </div>

      <p style={{
        fontSize: "0.95rem",
        color: "#cbd5e1",
        marginBottom: "16px"
      }}>
        {hasRated 
          ? `דירגת ${myRating} כוכבים` 
          : "לחצו על הכוכבים לדירוג"}
      </p>

      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "16px"
      }}>
        <StarRating
          rating={myRating}
          onRate={handleRate}
          readonly={hasRated || isSubmitting}
          size="large"
        />
      </div>

      {hasRated && (
        <div style={{
          padding: "12px",
          background: "rgba(251, 191, 36, 0.1)",
          borderRadius: "12px",
          border: "1px solid rgba(251, 191, 36, 0.3)"
        }}>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "4px" }}>
            הדירוג הממוצע
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#fbbf24" }}>
            {currentSong.average_rating?.toFixed(1) || "0.0"} ⭐
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
            מתוך {currentSong.ratings?.length || 0} דירוגים
          </div>
        </div>
      )}

      {isSubmitting && (
        <div style={{
          marginTop: "12px",
          fontSize: "0.85rem",
          color: "#00caff"
        }}>
          שולח דירוג...
        </div>
      )}
    </div>
  );
}