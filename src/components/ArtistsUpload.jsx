import React from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X } from "lucide-react";

export default function ArtistsUpload({ artists = [], onChange }) {
  const [uploading, setUploading] = React.useState(false);

  const handleAddArtist = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newArtist = { name: "", image: file_url };
      onChange([...artists, newArtist]);
    } catch (error) {
      alert("שגיאה בהעלאת התמונה");
    } finally {
      setUploading(false);
    }
  };

  const handleNameChange = (index, name) => {
    const updated = [...artists];
    updated[index].name = name;
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = artists.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      {artists.map((artist, i) => (
        <div key={i} style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          background: "rgba(15, 23, 42, 0.5)",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid rgba(100, 116, 139, 0.3)"
        }}>
          <img 
            src={artist.image} 
            alt="זמר"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "2px solid rgba(0, 202, 255, 0.3)"
            }}
          />
          <input
            type="text"
            value={artist.name}
            onChange={(e) => handleNameChange(i, e.target.value)}
            placeholder="שם הזמר"
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              background: "rgba(2, 6, 23, 0.7)",
              color: "#fff",
              fontSize: "0.95rem",
              outline: "none"
            }}
          />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              background: "rgba(239, 68, 68, 0.2)",
              color: "#ef4444",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>
      ))}

      <label style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "16px",
        borderRadius: "12px",
        border: "2px dashed rgba(0, 202, 255, 0.4)",
        background: "rgba(0, 202, 255, 0.05)",
        color: "#00caff",
        fontSize: "0.95rem",
        fontWeight: "600",
        cursor: uploading ? "not-allowed" : "pointer",
        transition: "all 0.2s"
      }}>
        <Upload size={20} />
        <span>{uploading ? "מעלה..." : "הוסף זמר"}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleAddArtist}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {artists.length === 0 && (
        <div style={{
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.85rem",
          padding: "10px"
        }}>
          העלה תמונות של הזמרים שמופיעים באירוע
        </div>
      )}
    </div>
  );
}