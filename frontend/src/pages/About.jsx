import { Link } from "react-router-dom";

function About() {
  return (
    <main className="app">
      <section className="about-section">
        <p className="eyebrow">ABOUT VAXCARE</p>

        <h1>Reliable Information. Better Awareness.</h1>

        <p>
          VaxCare is a vaccine information portal designed
          to make general vaccine information easier to
          explore and understand.
        </p>

        <p>
          Our goal is to help users discover vaccine
          information and learn about vaccination services.
        </p>

        <Link to="/vaccines" className="hero-button">
          Explore Vaccines →
        </Link>
      </section>
    </main>
  );
}

export default About;