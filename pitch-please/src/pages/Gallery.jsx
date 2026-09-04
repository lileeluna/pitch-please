import "../styles/Gallery.css";
import MediaGrid from "../components/MediaGrid";

function Gallery() {
  return (
    <>
      <div className="gallery-container">
        <div className="gallery-overlay"></div>
      </div>
      <div className="gallery-title">Gallery</div>
      <section className="photos">
        <div className="section-header">Photos</div>
        <MediaGrid type="photo" />
      </section>
      <section className="videos">
        <div className="section-header">Videos</div>
        <MediaGrid type="video" />
      </section>
    </>
  );
}

export default Gallery;
