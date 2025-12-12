import React, { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ rating = 0, onRate, readonly = false, size = "medium" }) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-7 h-7",
    large: "w-10 h-10"
  };

  const currentRating = hoveredStar || rating;

  return (
    <div 
      style={{ 
        display: "flex", 
        gap: "4px", 
        alignItems: "center"
      }}
      onMouseLeave={() => !readonly && setHoveredStar(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHoveredStar(star)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: readonly ? "default" : "pointer",
            transition: "transform 0.2s",
            transform: hoveredStar === star && !readonly ? "scale(1.2)" : "scale(1)"
          }}
        >
          <Star
            className={sizeClasses[size]}
            style={{
              fill: star <= currentRating ? "#fbbf24" : "transparent",
              stroke: star <= currentRating ? "#fbbf24" : "#64748b",
              filter: star <= currentRating ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))" : "none",
              transition: "all 0.2s"
            }}
          />
        </button>
      ))}
      {rating > 0 && (
        <span style={{
          marginRight: "8px",
          fontSize: size === "large" ? "1.2rem" : size === "medium" ? "1rem" : "0.85rem",
          fontWeight: "700",
          color: "#fbbf24",
          textShadow: "0 0 10px rgba(251, 191, 36, 0.4)"
        }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}