
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Vaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch vaccines from Supabase
  useEffect(() => {
    const fetchVaccines = async () => {
      const { data, error } = await supabase
        .from("vaccines")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching vaccines:", error);
        setError("Unable to load vaccines. Please try again later.");
      } else {
        const formattedVaccines = data.map((vaccine) => ({
          ...vaccine.details,
          id: vaccine.id,
          name: vaccine.name,
          fullName: vaccine.full_name,
          category: vaccine.category,
          purpose: vaccine.purpose,
          age: vaccine.age,
          icon: vaccine.icon,
        }));

        setVaccines(formattedVaccines);
      }

      setLoading(false);
    };

    fetchVaccines();
  }, []);

  const filteredVaccines = vaccines.filter((vaccine) => {
    const matchesSearch = vaccine.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || vaccine.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="app">
      <section className="search-section">
        <div>
          <p className="eyebrow">VACCINE DIRECTORY</p>
          <h1>Explore Vaccines</h1>
          <p>Find general information about different vaccines.</p>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search vaccines..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button onClick={() => setSearch("")}>
              Clear
            </button>
          )}
        </div>
      </section>

      <section className="category-filters">
        {["All", "Childhood", "Adult", "Adolescent"].map((item) => (
          <button
            key={item}
            className={category === item ? "active-filter" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </section>

      {loading ? (
        <p>Loading vaccines...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <p className="results-count">
            Showing {filteredVaccines.length} of {vaccines.length} vaccines
          </p>

          <section className="vaccine-grid">
            {filteredVaccines.length > 0 ? (
              filteredVaccines.map((vaccine) => (
                <div className="vaccine-card" key={vaccine.id}>
                  <div className="vaccine-icon">{vaccine.icon}</div>

                  <span className="category">{vaccine.category}</span>

                  <h3>{vaccine.name}</h3>

                  <p>{vaccine.purpose}</p>

                  <div className="vaccine-age">
                    Age group: {vaccine.age}
                  </div>

                  <Link
                    to={`/vaccines/${vaccine.id}`}
                    className="details-button"
                  >
                    View Details →
                  </Link>
                </div>
              ))
            ) : (
              <p>No matching vaccines found.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Vaccines;
