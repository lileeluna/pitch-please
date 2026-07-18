import "../styles/Footer.css";
import insta from "../assets/instagram.svg";
import tt from "../assets/tiktok.svg";
import yt from "../assets/youtube.svg";
import spot from "../assets/spotify.svg";

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="soc-med-icons">
          <a
            href="https://www.instagram.com/pitchpleaseatucla/"
            target="_blank"
            rel="noopener noreferrer"
            className="soc-med-link"
          >
            <img src={insta} className="soc-med-icon"></img>
          </a>
          <a
            href="https://www.instagram.com/pitchpleaseatucla/"
            target="_blank"
            rel="noopener noreferrer"
            className="soc-med-link"
          >
            <img src={tt} className="soc-med-icon"></img>
          </a>
          <a
            href="https://www.instagram.com/pitchpleaseatucla/"
            target="_blank"
            rel="noopener noreferrer"
            className="soc-med-link"
          >
            <img src={yt} className="soc-med-icon"></img>
          </a>
          <a
            href="https://www.instagram.com/pitchpleaseatucla/"
            target="_blank"
            rel="noopener noreferrer"
            className="soc-med-link"
          >
            <img src={spot} className="soc-med-icon"></img>
          </a>
        </div>
        <div className="footer-location">
          Based in UCLA, Los Angeles, CA, USA
        </div>
      </footer>
    </>
  );
}

export default Footer;
