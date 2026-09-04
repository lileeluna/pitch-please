function AuthBar({ canEdit, username, onLoginClick, onLogout }) {
  return (
    <div className="member-auth-bar">
      {canEdit ? (
        <>
          <span>Logged in as {username}</span>
          <button type="button" className="auth-btn" onClick={onLogout}>
            Log Out
          </button>
        </>
      ) : (
        <button type="button" className="auth-btn" onClick={onLoginClick}>
          Admin Log In
        </button>
      )}
    </div>
  );
}

export default AuthBar;
