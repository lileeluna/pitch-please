import image from "../assets/about.jpg";
import "../styles/About.css";
import "../styles/Repertoire.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AuthBar from "../components/AuthBar";
import RepertoireGrid from "../components/RepertoireGrid";

function About() {
  const [tab, setTab] = useState("about");
  const { canEdit, username, logout } = useAuth();
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
            <div className="tab-text">
              <div>Pitch, Please! was founded in the winter of 2017 and is a co-ed, competitive a cappella group at UCLA. Our music varies widely from indie ballads to upbeat experimental-pop hits, most of which is arranged by our very own members. In 2018, we released our first single, "My Heart With You" (opb. The Rescues). Our passion for a cappella has driven us to strive for bigger and better things--in 2019, we competed in ICCA, released a music video, and recorded our debut album, Made To Fly, whose songs were nominated for three Contemporary A Cappella Recording Awards and featured on the Voices Only 2020 compilation album! Our latest singles include "Bad Dream" and "Earth," the latter just being released in 2023.</div>
              <div>We've continued to compete in the ICCA, placing 2nd in the 2020 West Quarterfinal and more recently 4th in the 2023 West Quarterfinal. Our sets have received multiple awards, including Outstanding Arrangement, Outstanding Choreography, and Outstanding Vocal Percussion. We love sharing our music and love for what we do with others, and we hope to continue performing, competing, and releasing music in the future. Catch us jamming live or rehearsing outdoors on the UCLA campus!</div>
</div>
          )}
          {tab === "auditions" && (
            <div className="tab-text">
              <div>ATTENTION: Auditions will be held at the start of every fall quarter! If you are interested in becoming a part of our Pitch Family, the first round of Fall 2026 auditions will be September 27th to 29th from 6:00-10:00 PM, locations TBA. Sign up for an audition slot here (sign-up link TBA), but walk-ins are always welcome. Callbacks will follow on October 2nd from 5:30-8:00 PM.</div>
              <div>So you wanna be a Pitch? Come join us―it'll be fun!</div>
              <div>In short, our audition process consists of three things: scales, a solo, and tonal memory. The solo song should be about a minute long (or a verse and a chorus) and can be any song you'd like, and if you're interested in vocal percussion, we'd love to hear that too! If we think you'll be a good match for our group, we'll reach out to you about callbacks. Don't be nervous; we just want to hear you sing!</div>
              <div className="qna">
                <div style={{textDecoration: 'underline', paddingBottom: '1rem', fontSize: '1.5rem', color: '#fff', fontFamily: 'Aoboshi One'}}>FREQUENTLY ASKED QUESTIONS</div>
                <p>What if I have no experience?</p>
                <div>No experience is necessary! Of course it's helpful to have some, but we'll consider everyone who auditions for us, regardless of previous experience.</div>
                <p>What if I can't make callbacks?</p>
                <div>Unfortunately, you must be present at callbacks to be considered for the group. If it's not working out this quarter, keep an eye out for future auditions!</div>
                <p>How many people are you taking?</p>
                <div>It really depends each year, based on what we need/are looking for. There's no set number or cutoff.</div>
                <p>What's the time commitment like?</p>
                <div>We normally rehearse as a full group twice a week for 2 hours, and we have smaller sectional rehearsals once a week for an hour. As we get closer to competition season it'll be a little more hectic.</div>
                <p>I've been invited to callbacks! Will having a conflict with another group's callbacks affect my chances of being accepted into either group? Would I need to pick one or the other?</p>
                <div>Of course not! There's so many groups here on campus that overlaps are almost always guaranteed. In fact, most of the a cappella groups with callback overlap usually coordinate with each other for a good time someone would need to leave one group's callbacks to attend another. When you receive your invitations just make sure to let us know about your conflict and we'll be able to tell you how it can work out. No need to worry!</div>
                <p style={{fontFamily: 'Aoboshi One'}}>
                  If you have any other questions, feel free to{" "}
                  <Link to="/contact-us" className="contact-us-link">
                    contact us
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
          {tab === "repertoire" && (
            <>
              <AuthBar
                canEdit={canEdit}
                username={username}
                onLogout={logout}
              />
              <RepertoireGrid
                status="current"
                title="Current Repertoire"
                canEdit={canEdit}
              />
              <RepertoireGrid
                status="past"
                title="Past Repertoire"
                canEdit={canEdit}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default About;
