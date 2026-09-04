import { useState } from "react";

const API_BASE = "";

function LoginModal({ onClose, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data && data.error) || "Login failed.");
        return;
      }
      onLogin(data.username);
    } catch {
      setError("Login failed. Is the backend running?");
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

        <h2 className="member-editor-title">Admin Log In</h2>

        <form onSubmit={handleSubmit}>
          <label className="editor-field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </label>

          <label className="editor-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <div className="editor-actions">
            <button
              type="submit"
              className="editor-btn editor-save"
              disabled={busy}
            >
              {busy ? "Logging in..." : "Log In"}
            </button>
            <button
              type="button"
              className="editor-btn"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
