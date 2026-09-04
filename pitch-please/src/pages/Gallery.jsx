import { useState } from "react";
import "../styles/Gallery.css";
import MediaGrid from "../components/MediaGrid";
import AuthBar from "../components/AuthBar";
import LoginModal from "../components/LoginModal";
import useAuth from "../hooks/useAuth";

function Gallery() {
  const { canEdit, username, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <div className="gallery-container">
        <div className="gallery-overlay"></div>
      </div>
      <div className="gallery-title">Gallery</div>
      <AuthBar
        canEdit={canEdit}
        username={username}
        onLoginClick={() => setShowLogin(true)}
        onLogout={logout}
      />
      <section className="photos">
        <div className="section-header">Photos</div>
        <MediaGrid type="photo" canEdit={canEdit} />
      </section>
      <section className="videos">
        <div className="section-header">Videos</div>
        <MediaGrid type="video" canEdit={canEdit} />
      </section>

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

export default Gallery;

