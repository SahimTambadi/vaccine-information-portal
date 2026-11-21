
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function AdminVaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVaccines();
  }, []);

  async function fetchVaccines() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("vaccines")
      .select("id, name, full_name, category, purpose, age, icon")
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setVaccines(data || []);
    setLoading(false);
  }

  const filteredVaccines = vaccines.filter((vaccine) => {
    const searchText = search.toLowerCase().trim();

    return [
      vaccine.name,
      vaccine.full_name,
      vaccine.category,
      vaccine.purpose,
      vaccine.age,
      String(vaccine.id),
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(searchText)
      );
  });

  return (
    <main className="app admin-vaccine-page">

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">VAXCARE ADMINISTRATION</p>

          <h1>
            Vaccine <span>Management.</span>
          </h1>

          <p className="hero-description">
            Select a vaccine to view its information and manage its details.
          </p>

          <Link to="/admin" className="hero-button">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="hero-visual">
          <div className="medical-circle">💉</div>
        </div>
      </section>

      <section className="search-section">
        <div>
          <p className="eyebrow">VACCINE DIRECTORY</p>
          <h2>All Vaccines</h2>
          <p>Total records: {vaccines.length}</p>
        </div>

        <input
          type="text"
          placeholder="Search vaccines..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      {error && <p className="auth-error">{error}</p>}

      <section className="vaccine-grid">

        {loading ? (
          <p>Loading vaccines...</p>
        ) : filteredVaccines.length > 0 ? (
          filteredVaccines.map((vaccine) => (
            <Link
              to={`/admin/vaccines/${vaccine.id}`}
              className="admin-vaccine-card-link"
              key={vaccine.id}
            >
              <article className="vaccine-card admin-clickable-card">

                <div className="vaccine-icon">
                  {vaccine.icon || "💉"}
                </div>

                <span className="category">
                  {vaccine.category || "General"}
                </span>

                <h3>{vaccine.name}</h3>

                {vaccine.full_name && (
                  <p>{vaccine.full_name}</p>
                )}

                <p>{vaccine.purpose}</p>

                <div className="vaccine-age">
                  Age group: {vaccine.age}
                </div>

                <div className="admin-vaccine-id">
                  Vaccine ID: {vaccine.id}
                </div>

                <div className="admin-card-view">
                  View Details <span>→</span>
                </div>

              </article>
            </Link>
          ))
        ) : (
          <p>No matching vaccines found.</p>
        )}

      </section>
    </main>
  );
}

export default AdminVaccines;
