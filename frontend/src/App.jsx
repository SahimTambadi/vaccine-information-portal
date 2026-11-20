
import { useState } from "react";
import "./App.css";

const vaccines = [
  {
    name: "BCG Vaccine",
    category: "Childhood",
    purpose: "Helps protect against severe forms of tuberculosis.",
    age: "Newborns",
    icon: "🛡️",
  },
  {
    name: "Hepatitis B",
    category: "Childhood",
    purpose: "Helps prevent hepatitis B virus infection.",
    age: "All age groups",
    icon: "💉",
  },
  {
    name: "Influenza Vaccine",
    category: "Adult",
    purpose: "Helps protect against seasonal influenza.",
    age: "According to eligibility",
    icon: "🩺",
  },
  {
    name: "HPV Vaccine",
    category: "Adolescent",
    purpose: "Helps prevent infections from certain HPV types.",
    age: "Adolescents",
    icon: "🧬",
  },
];

function App() {
  const [search, setSearch] = useState("");

  const filteredVaccines = vaccines.filter((vaccine) =>
    vaccine.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <nav className="navbar">
        <a href="#" className="logo">
          <span>✚</span> VaxCare
        </a>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#vaccines">Vaccines</a>
          <a href="#about">About</a>
        </div>

        <button className="nav-button">
          Admin Login
        </button>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">YOUR HEALTH, OUR PRIORITY</p>

          <h1>
            Making Vaccine
            <br />
            Information <span>Accessible.</span>
          </h1>

          <p className="hero-description">
            Explore vaccine information, understand
            vaccination schedules and discover vaccination
            centres in your area.
          </p>

          <a href="#vaccines" className="hero-button">
            Explore Vaccines →
          </a>
        </div>

        <div className="hero-visual">
          <div className="medical-circle">💉</div>
          <div className="floating-card">
            <span>✓</span> Stay informed. Stay protected.
          </div>
        </div>
      </section>

      <section className="search-section" id="vaccines">
        <div>
          <p className="eyebrow">VACCINE DIRECTORY</p>
          <h2>Explore Vaccines</h2>
          <p>Find information about different vaccines.</p>
        </div>

        <input
          type="text"
          placeholder="Search vaccines..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      <section className="vaccine-grid">
        {filteredVaccines.length > 0 ? (
          filteredVaccines.map((vaccine) => (
            <div className="vaccine-card" key={vaccine.name}>
              <div className="vaccine-icon">{vaccine.icon}</div>

              <span className="category">
                {vaccine.category}
              </span>

              <h3>{vaccine.name}</h3>

              <p>{vaccine.purpose}</p>

              <div className="vaccine-age">
                Age group: {vaccine.age}
              </div>

              <button className="details-button">
                View Details →
              </button>
            </div>
          ))
        ) : (
          <p>No matching vaccines found.</p>
        )}
      </section>

      <section className="about-section" id="about">
        <h2>Reliable Information. Better Awareness.</h2>
        <p>
          Our portal helps people access general vaccine
          information and discover vaccination services.
        </p>
      </section>

      <footer>
        <p>© 2026 VaxCare | Vaccine Information Portal</p>
        <p>
          Educational information only. Consult a qualified
          healthcare professional for medical advice.
        </p>
      </footer>
    </div>
  );
}

export default App;
