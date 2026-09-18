import image from "../assets/homepage.jpg";
import audition from "../assets/auditions.jpeg"
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
        <h1 className="upcoming-title">AUDITION INFORMATION</h1> {/* Normally UPCOMING PERFORMANCES */}
        <div className="info-section">
          <img src={audition} className="audition" />
          <div className="info-text">
            <div>
              Auditions for the 2026 - 2027 season will be held at the start of
              fall quarter! The first round of Fall 2026 auditions will be
              September 27th to 29th from 6:00-10:00 PM, locations TBA.
              Callbacks will follow on October 2nd from 5:30-8:00 PM.
            </div>
            <div>
              Our audition process consists of three things: scales, a solo,
              and tonal memory. The solo should be about a minute long (a verse
              and a chorus) and can be any song you'd like. If you're interested
              in vocal percussion, we'd love to hear that too!
            </div>
            <div>So you wanna be a Pitch? Come join us―it'll be fun!</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
