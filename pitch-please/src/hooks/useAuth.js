import { useState, useEffect } from "react";

const API_BASE = "";

function useAuth() {
  const [canEdit, setCanEdit] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/auth/status`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setCanEdit(Boolean(data && data.authorized));
        setUsername(data && data.authorized ? data.username : null);
      })
      .catch(() => {
        if (cancelled) return;
        setCanEdit(false);
        setUsername(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (loggedInUsername) => {
    setUsername(loggedInUsername);
    setCanEdit(true);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: "POST" });
    } catch {
    }
    setUsername(null);
    setCanEdit(false);
  };

  return { canEdit, username, login, logout };
}

export default useAuth;
