
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Vaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const categories = ["All", "Childhood", "Adult", "Adolescent"];

  useEffect(() => {
    let active = true;

    async function fetchVaccines() {
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("vaccines")
          .select("*")
          .eq("review_status", "verified")
          .order("id", { ascending: true });

        if (error) throw error;

        const formattedVaccines = (data || []).map((vaccine) => ({
          ...(vaccine.details || {}),
          id: vaccine.id,
          name: vaccine.name,
          fullName: vaccine.full_name,
          category: vaccine.category,
          purpose: vaccine.purpose,
          age: vaccine.age,
          icon: vaccine.icon,
        }));

        if (active) {
          setVaccines(formattedVaccines);
        }
      } catch (err) {
        console.error("Error fetching vaccines:", err);

        if (active) {
          setError(
            "We couldn't load the vaccine directory. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchVaccines();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const searchText = search.trim().toLowerCase();

  const filteredVaccines = vaccines.filter((vaccine) => {
    const searchableContent = [
      vaccine.name,
      vaccine.fullName,
      vaccine.category,
      vaccine.purpose,
      vaccine.age,
      ...(Array.isArray(vaccine.protection?.diseases)
        ? vaccine.protection.diseases
        : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableContent.includes(searchText);

    const matchesCategory =
      category === "All" || vaccine.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="app vaccine-directory">

      <section className="directory-hero">
        <div className="directory-hero-content">
          <span className="directory-eyebrow">
            VAXCARE HEALTHCARE DIRECTORY
          </span>

          <h1>Explore Vaccines</h1>

          <p>
            Discover useful information about vaccines, their purposes,
            recommended age groups and the diseases they help prevent.
          </p>

          <div className="directory-stat">
            <span className="directory-stat-icon">💉</span>
            <div>
              <strong>{vaccines.length}</strong>
              <span>Verified vaccines in our directory</span>
            </div>
          </div>
        </div>

        <div className="directory-hero-visual" aria-hidden="true">
          <div className="directory-hero-circle">
            💉
          </div>
        </div>
      </section>

      <section className="directory-content">

        <div className="directory-heading">
          <div>
            <span className="directory-section-label">
              VACCINE INFORMATION
            </span>
            <h2>Find the right information</h2>
            <p>
              Search by vaccine name, purpose, disease or age group.
            </p>
          </div>
        </div>

        <div className="directory-search-panel">
          <div className="directory-search-box">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search vaccines, diseases or age groups..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search the vaccine directory"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          <div className="directory-filter-area">
            <span className="directory-filter-label">
              Filter by category
            </span>

            <div
              className="directory-filters"
              role="group"
              aria-label="Filter vaccines by category"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    category === item
                      ? "directory-filter active"
                      : "directory-filter"
                  }
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="directory-results-heading">
          <div>
            <h2>Available Vaccines</h2>
            <p>
              {loading
                ? "Retrieving vaccine information..."
                : `Showing ${filteredVaccines.length} of ${vaccines.length} verified vaccines`}
            </p>
          </div>

          {(search || category !== "All") && (
            <button
              type="button"
              className="directory-reset-button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Reset filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="directory-state">
            <div className="directory-loader" />
            <h3>Loading vaccine information</h3>
            <p>Please wait while we retrieve the directory.</p>
          </div>
        ) : error ? (
          <div className="directory-state directory-error">
            <div className="directory-state-icon">!</div>
            <h3>Unable to load vaccines</h3>
            <p>{error}</p>

            <button
              type="button"
              className="directory-retry-button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try Again
            </button>
          </div>
        ) : filteredVaccines.length > 0 ? (
          <div className="directory-grid">
            {filteredVaccines.map((vaccine) => (
              <article className="directory-card" key={vaccine.id}>

                <div className="directory-card-top">
                  <div className="directory-card-icon">
                    {vaccine.icon || "💉"}
                  </div>

                  <span className="directory-card-category">
                    {vaccine.category || "General"}
                  </span>
                </div>

                <div className="directory-card-content">
                  <h3>{vaccine.name}</h3>

                  {vaccine.fullName && (
                    <p className="directory-full-name">
                      {vaccine.fullName}
                    </p>
                  )}

                  <p className="directory-purpose">
                    {vaccine.purpose ||
                      "Purpose information is not available."}
                  </p>
                </div>

                <div className="directory-card-footer">
                  <div className="directory-age">
                    <span>Recommended age group</span>
                    <strong>
                      {vaccine.age || "Not specified"}
                    </strong>
                  </div>

                  <Link
                    to={`/vaccines/${vaccine.id}`}
                    className="directory-details-button"
                    aria-label={`View details about ${vaccine.name}`}
                  >
                    View Details <span>→</span>
                  </Link>
                </div>

              </article>
            ))}
          </div>
        ) : (
          <div className="directory-state">
            <div className="directory-state-icon">⌕</div>
            <h3>No vaccines found</h3>
            <p>
              We couldn't find any vaccines matching your search or
              selected category. Try changing your search or filters.
            </p>

            <button
              type="button"
              className="directory-retry-button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Show All Vaccines
            </button>
          </div>
        )}

      </section>

      <section className="directory-disclaimer">
        <span>ⓘ</span>
        <p>
          <strong>Health information notice:</strong> This directory
          provides educational information. Vaccination schedules and
          recommendations can vary. Consult a qualified healthcare
          professional for advice about your individual needs.
        </p>
      </section>

    </main>
  );
}

export default Vaccines;
