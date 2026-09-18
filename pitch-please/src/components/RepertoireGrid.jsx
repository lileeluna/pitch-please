import { useState, useEffect } from "react";
import RepertoireCard from "./RepertoireCard";
import RepertoireEditor from "./RepertoireEditor";

const API_BASE = "";

const ITEMS_URL = "/api/repertoire";

async function parseError(res, fallback) {
  try {
    const body = await res.json();
    return (body && body.error) || fallback;
  } catch {
    return fallback;
  }
}

function RepertoireGrid({ status, title, canEdit }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}${ITEMS_URL}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setItems(data[status] || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        console.error("Failed to load repertoire. Is the backend running?");
        setLoadFailed(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const saveItem = async (fields) => {
    if (editing.mode === "create") {
      const res = await fetch(`${API_BASE}${ITEMS_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Create failed."));
      }
      const saved = await res.json();
      if (saved.status === status) {
        setItems((prev) => [...prev, saved]);
      }
    } else {
      const id = editing.item.id;
      const res = await fetch(`${API_BASE}${ITEMS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Update failed."));
      }
      const saved = await res.json();
      setItems((prev) =>
        saved.status === status
          ? prev.map((item) => (item.id === id ? saved : item))
          : prev.filter((item) => item.id !== id),
      );
    }
  };

  const deleteItem = async (id) => {
    const res = await fetch(`${API_BASE}${ITEMS_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(await parseError(res, "Delete failed."));
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveItem = async (id, direction) => {
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;

    const reordered = [...items];
    const [moving] = reordered.splice(index, 1);
    reordered.splice(target, 0, moving);

    const previous = items;
    setItems(reordered);

    try {
      const res = await fetch(`${API_BASE}${ITEMS_URL}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ids: reordered.map((item) => item.id) }),
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
      item: {
        title: "",
        original_artist: "",
        arranger: "",
        soloists: "",
        recording_url: "",
        status,
      },
    });
  const openEdit = (item) => setEditing({ mode: "edit", item });
  const closeEditor = () => setEditing(null);

  let editingIndex = -1;
  if (editing && editing.mode === "edit") {
    editingIndex = items.findIndex((item) => item.id === editing.item.id);
  }

  return (
    <>
      {title ? <h2 className="repertoire-section-title">{title}</h2> : null}

      <section className="repertoire-list">
        {loading ? (
          <div className="repertoire-note">Loading...</div>
        ) : loadFailed ? (
          <div className="repertoire-note">
            Failed to load repertoire. Is the backend running?
          </div>
        ) : (
          <>
            {items.map((item) => (
              <RepertoireCard
                key={item.id}
                item={item}
                canEdit={canEdit}
                onEdit={openEdit}
              />
            ))}

            {canEdit && (
              <button
                type="button"
                className="repertoire-add-btn"
                onClick={openCreate}
                title="Add Song"
              >
                <span className="repertoire-add-icon">+</span>
                <small>Add Song</small>
              </button>
            )}

            {!canEdit && items.length === 0 && (
              <div className="repertoire-note">
                No {status} repertoire yet
              </div>
            )}
          </>
        )}
      </section>

      {editing && (
        <RepertoireEditor
          key={editing.item.id || `new-${status}`}
          mode={editing.mode}
          initial={editing.item}
          status={status}
          canMoveUp={editingIndex > 0}
          canMoveDown={
            editingIndex >= 0 && editingIndex < items.length - 1
          }
          onMoveUp={() => moveItem(editing.item.id, -1)}
          onMoveDown={() => moveItem(editing.item.id, 1)}
          onSave={saveItem}
          onDelete={() => deleteItem(editing.item.id)}
          onClose={closeEditor}
        />
      )}
    </>
  );
}

export default RepertoireGrid;
