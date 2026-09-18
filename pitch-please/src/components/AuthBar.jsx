function AuthBar({ canEdit, username, onLogout }) {
  if (!canEdit) return null;

  return (
    <div className="member-auth-bar">
      <span>Logged in as {username}</span>
      <button type="button" className="auth-btn" onClick={onLogout}>
        Log Out
      </button>
    </div>
  );
}

export default AuthBar;
