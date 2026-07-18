import image from "../assets/about.jpg";
import "../styles/About.css";
import { useState } from "react";

function About() {
  const [tab, setTab] = useState("about");
  return (
    <>
      <div className="about-container">
        <img src={image} className="about-image" />
        <div className="about-text-overlay">
          <h1 className="title">About</h1>
          <h1 className="about-title">us</h1>
        </div>
        <section className="tab-row">
          <div
            className={`row-btn ${tab === "about" ? "active" : ""}`}
            onClick={() => setTab("about")}
          >
            ABOUT US
          </div>
          <div
            className={`row-btn ${tab === "auditions" ? "active" : ""}`}
            onClick={() => setTab("auditions")}
          >
            AUDITIONS
          </div>
          <div
            className={`row-btn ${tab === "repertoire" ? "active" : ""}`}
            onClick={() => setTab("repertoire")}
          >
            REPERTOIRE
          </div>
        </section>
        <section className="tab-content">
          {tab === "about" && (
            <div className="tab-text">This is the about tab.</div>
          )}
          {tab === "auditions" && (
            <div className="tab-text">This is the auditions tab.</div>
          )}
          {tab === "repertoire" && (
            <div className="tab-text">This is the repertoire tab.</div>
          )}
        </section>
      </div>
    </>
  );
}

export default About;
