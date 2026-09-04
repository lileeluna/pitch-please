import { useState, useEffect, useRef } from "react";
import UploadCell from "./UploadCell";
import MediaItem from "./MediaItem";

const API_BASE = "";

function MediaGrid({ type }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const fetchKey = useRef(0);

  useEffect(() => {
    const key = ++fetchKey.current;

    fetch(`${API_BASE}/api/media?type=${type}&page=${page}&limit=12`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (key === fetchKey.current) {
          setItems(data.items);
          setTotalPages(data.totalPages);
          setLoading(false);
        }
      })
      .catch(() => {
        if (key === fetchKey.current) {
          console.error("Failed to load media. Is the backend running?");
          setItems([]);
          setLoading(false);
        }
      });
  }, [type, page]);

  const handleUpload = (newItem) => {
    setPage(1);
    setItems((prev) => [newItem, ...prev]);
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="media-grid-section">
      <div className="media-grid">
        <UploadCell type={type} onUpload={handleUpload} />

        {loading ? (
          <div className="grid-loading">Loading...</div>
        ) : items.length === 0 ? (
          <div className="grid-empty">
            No {type === "photo" ? "photos" : "videos"} yet
          </div>
        ) : (
          items.map((item) => (
            <MediaItem
              key={item.id}
              item={item}
              type={type}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={page <= 1}>
            &laquo; Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button onClick={handleNext} disabled={page >= totalPages}>
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default MediaGrid;
