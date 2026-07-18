import image from "../assets/homepage.jpg";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">
      <img src={image} className="home-image" />
      <div className="home-text-overlay">
        <h2 className="subtitle">Introducing</h2>
        <h1 className="title">Pitch, Please!</h1>
        <h2 className="subtitle">2026 - 2027</h2>
      </div>
      <section className="upcoming">
        <h1 className="upcoming-title">UPCOMING PERFORMANCES</h1>
      </section>
    </div>
  );
}

export default Home;
