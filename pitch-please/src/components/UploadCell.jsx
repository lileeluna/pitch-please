import { useState, useRef } from "react";

const API_BASE = "";

function UploadCell({ type, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Upload failed");
        setUploading(false);
        return;
      }

      const data = await res.json();
      onUpload(data);
    } catch {
      alert("Upload failed. Is the backend running?");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`upload-cell ${dragging ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={type === "photo" ? "image/*" : "video/*"}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {uploading ? (
        <div className="upload-spinner"></div>
      ) : (
        <div className="upload-icon">
          <span>+</span>
          <small>{type === "photo" ? "Upload Photo" : "Upload Video"}</small>
        </div>
      )}
    </div>
  );
}

export default UploadCell;
