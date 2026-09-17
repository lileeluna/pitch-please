import { useState, useEffect } from "react";
import MemberCard from "./MemberCard";
import MemberEditor from "./MemberEditor";
import MemberPopup from "./MemberPopup";

const API_BASE = "";

const ITEMS_URL = "/api/members";

async function parseError(res, fallback) {
  try {
    const body = await res.json();
    return (body && body.error) || fallback;
  } catch {
    return fallback;
  }
}

function MemberGrid({
  listUrl,
  factsConfig,
  entityLabel,
  pluralLabel,
  title,
  isAlumni = false,
  canEdit,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}${listUrl}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setItems(data.members || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        console.error(`Failed to load ${pluralLabel}. Is the backend running?`);
        setLoadFailed(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listUrl, pluralLabel]);

  const uploadPhoto = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "member");
    const res = await fetch(`${API_BASE}${ITEMS_URL}/${id}/photo`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error(await parseError(res, "Photo upload failed."));
    }
    return res.json();
  };

  const saveItem = async (fields, file) => {
    const payload = { ...fields, is_alumni: isAlumni ? 1 : 0 };

    if (editing.mode === "create") {
      const res = await fetch(`${API_BASE}${ITEMS_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Create failed."));
      }
      let saved = await res.json();
      if (file) saved = await uploadPhoto(saved.id, file);
      setItems((prev) => [...prev, saved]);
    } else {
      const id = editing.member.id;
      const res = await fetch(`${API_BASE}${ITEMS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Update failed."));
      }
      let saved = await res.json();
      if (file) saved = await uploadPhoto(id, file);
      setItems((prev) => prev.map((m) => (m.id === id ? saved : m)));
    }
  };

  const deleteItem = async (id) => {
    const res = await fetch(`${API_BASE}${ITEMS_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(await parseError(res, "Delete failed."));
    }
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  const moveItem = async (id, direction) => {
    const index = items.findIndex((m) => m.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;

    const reordered = items.slice();
    const [moving] = reordered.splice(index, 1);
    reordered.splice(target, 0, moving);
    const previous = items;
    setItems(reordered);

    try {
      const res = await fetch(`${API_BASE}${ITEMS_URL}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((m) => m.id) }),
      });
      if (!res.ok) throw new Error("Reorder failed.");
    } catch (err) {
      setItems(previous);
      alert(err.message || "Reorder failed. Is the backend running?");
    }
  };

  const openCreate = () =>
    setEditing({
      mode: "create",
      member: {
        name: "",
        part: "",
        position: entityLabel,
        year_joined: "",
        year_graduated: "",
        facts: {},
        photo_url: null,
      },
    });
  const openEdit = (member) => setEditing({ mode: "edit", member });
  const closeEditor = () => setEditing(null);

  const viewingItem = items.find((m) => m.id === viewingId) || null;
  const openView = (member) => setViewingId(member.id);
  const closeView = () => setViewingId(null);

  let editingIndex = -1;
  if (editing && editing.mode === "edit") {
    editingIndex = items.findIndex((m) => m.id === editing.member.id);
  }

  return (
    <>
      {title ? <h2 className="members-section-title">{title}</h2> : null}

      <section className="members-grid">
        {loading ? (
          <div className="member-grid-note">Loading...</div>
        ) : loadFailed ? (
          <div className="member-grid-note">
            Failed to load {pluralLabel}. Is the backend running?
          </div>
        ) : (
          <>
            {items.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                canEdit={canEdit}
                onEdit={openEdit}
                onView={openView}
              />
            ))}

            {canEdit && (
              <button
                type="button"
                className="member-add-cell"
                onClick={openCreate}
                title={`Add ${entityLabel}`}
              >
                <span className="add-icon">+</span>
                <small style={{ color: "#ccc" }}>Add {entityLabel}</small>
              </button>
            )}

            {!canEdit && items.length === 0 && (
              <div className="member-grid-note">No {pluralLabel} yet</div>
            )}
          </>
        )}
      </section>

      {editing && (
        <MemberEditor
          key={editing.member.id || `new-${pluralLabel}`}
          mode={editing.mode}
          initial={editing.member}
          factsConfig={factsConfig}
          showYearGraduated={isAlumni}
          entityLabel={entityLabel}
          canMoveUp={editingIndex > 0}
          canMoveDown={editingIndex >= 0 && editingIndex < items.length - 1}
          onMoveUp={() => moveItem(editing.member.id, -1)}
          onMoveDown={() => moveItem(editing.member.id, 1)}
          onSave={saveItem}
          onDelete={() => deleteItem(editing.member.id)}
          onClose={closeEditor}
        />
      )}

      {viewingItem && (
        <MemberPopup
          key={viewingItem.id}
          member={viewingItem}
          factsConfig={factsConfig}
          onClose={closeView}
        />
      )}
    </>
  );
}

export default MemberGrid;
