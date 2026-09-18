import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "current", label: "Current" },
  { value: "past", label: "Past" },
];

function RepertoireEditor({
  mode,
  initial,
  status = "current",
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onSave,
  onDelete,
  onClose,
}) {
  const [title, setTitle] = useState(initial.title || "");
  const [originalArtist, setOriginalArtist] = useState(
    initial.original_artist || "",
  );
  const [arranger, setArranger] = useState(initial.arranger || "");
  const [soloists, setSoloists] = useState(initial.soloists || "");
  const [recordingUrl, setRecordingUrl] = useState(
    initial.recording_url || "",
  );
  const [itemStatus, setItemStatus] = useState(initial.status || status);
  const [busy, setBusy] = useState(false);

  const isNew = mode === "create";

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    setBusy(true);
    try {
      await onSave({
        title: title.trim(),
        original_artist: originalArtist.trim(),
        arranger: arranger.trim(),
        soloists: soloists.trim(),
        recording_url: recordingUrl.trim(),
        status: itemStatus,
      });
      onClose();
    } catch (err) {
      alert(err.message || "Save failed. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${title.trim() || "this song"}?`)) return;
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
    <div className="repertoire-overlay" onClick={onClose}>
      <div
        className="repertoire-editor"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="repertoire-editor-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="repertoire-editor-title">
          {isNew ? "Add Song" : "Edit Song"}
        </h2>

        <label className="repertoire-field">
          <span>Song Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My Heart With You"
          />
        </label>

        <label className="repertoire-field">
          <span>Original Singer (opb.)</span>
          <input
            type="text"
            value={originalArtist}
            onChange={(e) => setOriginalArtist(e.target.value)}
            placeholder="e.g. The Rescues"
          />
        </label>

        <label className="repertoire-field">
          <span>Arranger</span>
          <input
            type="text"
            value={arranger}
            onChange={(e) => setArranger(e.target.value)}
            placeholder="e.g. Jane Doe"
          />
        </label>

        <label className="repertoire-field">
          <span>Soloist(s)</span>
          <input
            type="text"
            value={soloists}
            onChange={(e) => setSoloists(e.target.value)}
            placeholder="e.g. Jane Doe, John Smith"
          />
        </label>

        <label className="repertoire-field">
          <span>Recording Link</span>
          <input
            type="text"
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            placeholder="e.g. https://open.spotify.com/..."
          />
        </label>

        <label className="repertoire-field">
          <span>Repertoire Section</span>
          <select
            value={itemStatus}
            onChange={(e) => setItemStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="repertoire-actions">
          <button
            type="button"
            className="repertoire-btn repertoire-save"
            onClick={handleSave}
            disabled={busy}
          >
            {busy ? "Saving..." : isNew ? "Add Song" : "Save Changes"}
          </button>

          {!isNew && (
            <>
              <button
                type="button"
                className="repertoire-btn"
                onClick={onMoveUp}
                disabled={busy || !canMoveUp}
              >
                &uarr; Move Up
              </button>
              <button
                type="button"
                className="repertoire-btn"
                onClick={onMoveDown}
                disabled={busy || !canMoveDown}
              >
                &darr; Move Down
              </button>
              <button
                type="button"
                className="repertoire-btn repertoire-delete"
                onClick={handleDelete}
                disabled={busy}
              >
                Delete Song
              </button>
            </>
          )}

          <button
            type="button"
            className="repertoire-btn"
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

export default RepertoireEditor;
