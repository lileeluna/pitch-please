import { useState, useEffect } from "react";
import MemberCard from "./MemberCard";
import MemberEditor from "./MemberEditor";
import LoginModal from "./LoginModal";
import AuthBar from "./AuthBar";
import useAuth from "../hooks/useAuth";

const API_BASE = "";

const emptyMember = {
  name: "",
  part: "",
  position: "Member",
  photo_url: null,
};

async function parseError(res, fallback) {
  try {
    const body = await res.json();
    return (body && body.error) || fallback;
  } catch {
    return fallback;
  }
}

function MembersGrid() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const { canEdit, username, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/members`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        console.error("Failed to load members. Is the backend running?");
        setLoadFailed(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadPhoto = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "member");
    const res = await fetch(`${API_BASE}/api/members/${id}/photo`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error(await parseError(res, "Photo upload failed."));
    }
    return res.json();
  };

  const saveMember = async (fields, file) => {
    if (editing.mode === "create") {
      const res = await fetch(`${API_BASE}/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Create failed."));
      }
      let saved = await res.json();
      if (file) saved = await uploadPhoto(saved.id, file);
      setMembers((prev) => [...prev, saved]);
    } else {
      const id = editing.member.id;
      const res = await fetch(`${API_BASE}/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Update failed."));
      }
      let saved = await res.json();
      if (file) saved = await uploadPhoto(id, file);
      setMembers((prev) => prev.map((m) => (m.id === id ? saved : m)));
    }
  };

  const deleteMember = async (id) => {
    const res = await fetch(`${API_BASE}/api/members/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(await parseError(res, "Delete failed."));
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const moveMember = async (id, direction) => {
    const index = members.findIndex((m) => m.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= members.length) return;

    const reordered = members.slice();
    const [moving] = reordered.splice(index, 1);
    reordered.splice(target, 0, moving);
    const previous = members;
    setMembers(reordered);

    try {
      const res = await fetch(`${API_BASE}/api/members/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((m) => m.id) }),
      });
      if (!res.ok) throw new Error("Reorder failed.");
    } catch (err) {
      setMembers(previous);
      alert(err.message || "Reorder failed. Is the backend running?");
    }
  };

  const openCreate = () => setEditing({ mode: "create", member: emptyMember });
  const openEdit = (member) => setEditing({ mode: "edit", member });
  const closeEditor = () => setEditing(null);

  let editingIndex = -1;
  if (editing && editing.mode === "edit") {
    editingIndex = members.findIndex((m) => m.id === editing.member.id);
  }

  return (
    <>
      <AuthBar
        canEdit={canEdit}
        username={username}
        onLoginClick={() => setShowLogin(true)}
        onLogout={logout}
      />

      <section className="members-grid">
        {loading ? (
          <div className="member-grid-note">Loading...</div>
        ) : loadFailed ? (
          <div className="member-grid-note">
            Failed to load members. Is the backend running?
          </div>
        ) : (
          <>
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                canEdit={canEdit}
                onEdit={openEdit}
              />
            ))}

            {canEdit && (
              <button
                type="button"
                className="member-add-cell"
                onClick={openCreate}
                title="Add member"
              >
                <span className="add-icon">+</span>
                <small>Add Member</small>
              </button>
            )}

            {!canEdit && members.length === 0 && (
              <div className="member-grid-note">No members yet</div>
            )}
          </>
        )}
      </section>

      {editing && (
        <MemberEditor
          key={editing.member.id || "new-member"}
          mode={editing.mode}
          initial={editing.member}
          canMoveUp={editingIndex > 0}
          canMoveDown={editingIndex >= 0 && editingIndex < members.length - 1}
          onMoveUp={() => moveMember(editing.member.id, -1)}
          onMoveDown={() => moveMember(editing.member.id, 1)}
          onSave={saveMember}
          onDelete={() => deleteMember(editing.member.id)}
          onClose={closeEditor}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={(name) => {
            login(name);
            setShowLogin(false);
          }}
        />
      )}
    </>
  );
}

export default MembersGrid;

