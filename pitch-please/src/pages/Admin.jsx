import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/Admin.css";

const API_BASE = "";

function Admin() {
  const { canEdit, username, loading, login, logout } = useAuth();
  const [formUsername, setFormUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formUsername.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data && data.error) || "Login failed.");
        return;
      }
      login(data.username);
      setPassword("");
      navigate("/members");
    } catch {
      setError("Login failed. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setPassword("");
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h1 className="admin-title">Admin</h1>
          <p className="admin-subtitle">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (canEdit) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h1 className="admin-title">Admin</h1>
          <p className="admin-subtitle">Signed in as {username}.</p>

          <div className="admin-links">
            <Link className="admin-link" to="/members">
              Edit members &amp; alumni
            </Link>
            <Link className="admin-link" to="/gallery">
              Edit gallery
            </Link>
          </div>

          <div className="admin-actions">
            <button type="button" className="admin-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-title">Admin Log In</h1>

        <form onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Username</span>
            <input
              type="text"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </label>

          <label className="admin-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <div className="admin-error">{error}</div>}

          <div className="admin-actions">
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={busy}
            >
              {busy ? "Logging in..." : "Log In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admin;
