import { useState } from "react";

const API_BASE = "";

function MediaItem({ item, type, canEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/media/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDelete(item.id);
      } else {
        const data = await res.json().catch(() => null);
        alert((data && data.error) || "Delete failed.");
      }
    } catch {
      alert("Delete failed.");
    }
  };

  return (
    <>
      <div className="media-item" onClick={() => setExpanded(true)}>
        {type === "photo" ? (
          <img
            src={`${API_BASE}${item.url}`}
            alt={item.original_name}
            loading="lazy"
          />
        ) : (
          <video src={`${API_BASE}${item.url}`} muted />
        )}
        {canEdit && (
          <button
            className="delete-btn"
            onClick={handleDelete}
            title="Delete"
          >
            &times;
          </button>
        )}
      </div>

      {expanded && (
        <div className="media-overlay" onClick={() => setExpanded(false)}>
          <div
            className="media-overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="overlay-close"
              onClick={() => setExpanded(false)}
            >
              &times;
            </button>
            {type === "photo" ? (
              <img
                src={`${API_BASE}${item.url}`}
                alt={item.original_name}
                className="overlay-image"
              />
            ) : (
              <video
                src={`${API_BASE}${item.url}`}
                className="overlay-video"
                controls
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MediaItem;
