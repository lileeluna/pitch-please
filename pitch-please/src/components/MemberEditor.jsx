import { useState, useRef } from "react";

function MemberEditor({
  mode,
  initial,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onSave,
  onDelete,
  onClose,
}) {
  const [name, setName] = useState(initial.name || "");
  const [part, setPart] = useState(initial.part || "");
  const [position, setPosition] = useState(initial.position || "Member");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial.photo_url || null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const isNew = mode === "create";

  const handleFileChange = (e) => {
    const chosen = e.target.files && e.target.files[0];
    if (!chosen) return;
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Name is required.");
      return;
    }
    setBusy(true);
    try {
      await onSave(
        {
          name: name.trim(),
          part: part.trim(),
          position: position.trim() || "Member",
        },
        file || null,
      );
      onClose();
    } catch (err) {
      alert(err.message || "Save failed. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${name.trim() || "this member"}?`)) return;
    setBusy(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      alert(err.message || "Delete failed. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="member-overlay" onClick={onClose}>
      <div
        className="member-editor"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="member-editor-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="member-editor-title">
          {isNew ? "Add Member" : "Edit Member"}
        </h2>

        <div className="editor-photo">
          {preview ? (
            <img src={preview} alt="Member photo preview" />
          ) : (
            <div className="editor-photo-placeholder">No photo</div>
          )}
        </div>

        <label className="editor-field">
          <span>Photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {!isNew && (
            <em className="editor-hint">
              Pick a new image to replace the current photo.
            </em>
          )}
        </label>

        <label className="editor-field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First Last"
            required
          />
        </label>

        <label className="editor-field">
          <span>Vocal Part</span>
          <input
            type="text"
            value={part}
            onChange={(e) => setPart(e.target.value)}
            placeholder="e.g. Soprano"
          />
        </label>

        <label className="editor-field">
          <span>Board Position</span>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Member"
          />
        </label>

        <div className="editor-actions">
          <button
            type="button"
            className="editor-btn editor-save"
            onClick={handleSave}
            disabled={busy}
          >
            {busy ? "Saving..." : isNew ? "Add Member" : "Save Changes"}
          </button>

          {!isNew && (
            <>
              <button
                type="button"
                className="editor-btn"
                onClick={onMoveUp}
                disabled={busy || !canMoveUp}
              >
                &uarr; Move Up
              </button>
              <button
                type="button"
                className="editor-btn"
                onClick={onMoveDown}
                disabled={busy || !canMoveDown}
              >
                &darr; Move Down
              </button>
              <button
                type="button"
                className="editor-btn editor-delete"
                onClick={handleDelete}
                disabled={busy}
              >
                Delete Member
              </button>
            </>
          )}

          <button
            type="button"
            className="editor-btn"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberEditor;

