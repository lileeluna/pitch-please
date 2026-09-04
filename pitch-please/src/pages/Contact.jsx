import image from "../assets/contact.jpg";
import "../styles/Contact.css";

function Contact() {
  return (
    <>
      <div className="contact-container">
        <img src={image} className="contact-image" />
        <div className="contact-image-overlay"></div>
        <div className="contact-text-overlay">
          <h1 className="contact-title">CONTACT US</h1>
        </div>
        <section className="contact-content">
          <form
            className="contact-left"
            action="https://formspree.io/f/xljelaag"
            method="POST"
          >
            <div className="header-row">
              <div className="header-label">Name</div>
              <div className="header-label">Email</div>
            </div>
            <div className="input-row">
              <input type="text" name="name" className="half-row" />
              <input type="email" name="email" className="half-row" />
            </div>
            <div className="header-row">
              <div className="header-label">Subject</div>
            </div>
            <div className="input-row">
              <input type="text" name="subject" className="full-row" />
            </div>
            <div className="header-row">
              <div className="header-label">Message</div>
            </div>
            <div className="input-row">
              <textarea
                name="message"
                className="full-row message-box"
              ></textarea>
            </div>
            <div className="submit-row">
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </div>
          </form>
          <div className="contact-right">
            <p>
              Have any questions for us? Please feel free to reach out on our
              Instagram or at{" "}
              <a
                href="mailto:pitchpleaseucla@gmail.com"
                style={{ textDecoration: "underline" }}
                className="email"
              >
                pitchpleaseucla@gmail.com
              </a>
              . If you have an event you'd be interested in having us perform
              for, let us know!
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default Contact;
