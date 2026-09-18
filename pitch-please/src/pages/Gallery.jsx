import "../styles/Gallery.css";
import MediaGrid from "../components/MediaGrid";
import AuthBar from "../components/AuthBar";
import useAuth from "../hooks/useAuth";

function Gallery() {
  const { canEdit, username, logout } = useAuth();

  return (
    <>
      <div className="gallery-container">
        <div className="gallery-overlay"></div>
      </div>
      <div className="gallery-title">Gallery</div>
      <AuthBar canEdit={canEdit} username={username} onLogout={logout} />
      <section className="photos">
        {/* <div className="section-header">Photos</div> */}
        <MediaGrid type="photo" canEdit={canEdit} />
      </section>
      {/* <section className="videos">
        <div className="section-header">Videos</div>
        <MediaGrid type="video" canEdit={canEdit} />
      </section> */}
    </>
  );
}

export default Gallery;

