import { useState, useRef } from "react";
import { MEMBER_FACTS } from "../data/memberFacts";

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
  const [yearJoined, setYearJoined] = useState(initial.year_joined || "");
  const [facts, setFacts] = useState(initial.facts || {});
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(initial.photo_url || null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const isNew = mode === "create";

  const handleFactChange = (key, value) => {
    setFacts((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const chosen = e.target.files && e.target.files[0];
    if (!chosen) return;
    setFile(chosen);
    setFileName(chosen.name);
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
          year_joined: yearJoined.trim(),
          facts: Object.fromEntries(
            Object.entries(facts).map(([key, value]) => [
              key,
              typeof value === "string" ? value.trim() : "",
            ]),
          ),
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

        <div className="editor-field">
          <span>Photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="editor-file-input"
          />
          <button
            type="button"
            className="editor-file-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="add-icon">+</span>
            {isNew ? "Choose Photo" : "Replace Photo"}
          </button>
          <small className="editor-file-name">
            {fileName || "No file chosen"}
          </small>
          {!isNew && (
            <em className="editor-hint">
              Pick a new image to replace the current photo.
            </em>
          )}
        </div>

        <label className="editor-field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="FirstName LastName"
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
          <span>Board Position(s)</span>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Member"
          />
        </label>

        <label className="editor-field">
          <span>Year Joined</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={yearJoined}
            onChange={(e) =>
              setYearJoined(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="e.g. 2022"
          />
        </label>

        <fieldset className="editor-facts">
          <legend>Fun Facts &amp; Favorites</legend>
          <p className="editor-hint">
            These fields are defined in <code>src/data/memberFacts.js</code>.
          </p>
          {MEMBER_FACTS.map((fact) => (
            <label className="editor-field" key={fact.key}>
              <span>{fact.label}</span>
              <input
                type="text"
                value={facts[fact.key] || ""}
                onChange={(e) => handleFactChange(fact.key, e.target.value)}
                placeholder={fact.placeholder || ""}
              />
            </label>
          ))}
        </fieldset>

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

