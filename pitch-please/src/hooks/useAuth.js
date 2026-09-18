import { useState, useEffect } from "react";
import { API_BASE } from "../config";

function useAuth() {
  const [canEdit, setCanEdit] = useState(false);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/auth/status`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setCanEdit(Boolean(data && data.authorized));
        setUsername(data && data.authorized ? data.username : null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCanEdit(false);
        setUsername(null);
        setLoading(false);
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
      console.warn("Logout request failed; clearing local session state.");
    }
    setUsername(null);
    setCanEdit(false);
  };

  return { canEdit, username, loading, login, logout };
}

export default useAuth;
