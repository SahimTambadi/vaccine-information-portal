
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchMedicines() {
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("medicines")
          .select(`
            id,
            name,
            generic_name,
            brand_names,
            category,
            active_ingredients,
            uses,
            available_forms,
            prescription_required
          `)
          .eq("is_published", true)
          .order("name", { ascending: true });

        if (error) throw error;

        if (active) {
          setMedicines(data || []);
        }
      } catch (err) {
        console.error("Error fetching medicines:", err);

        if (active) {
          setError(
            "We couldn't load the medicine directory. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchMedicines();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const categories = useMemo(() => {
    const available = medicines
      .map((medicine) => medicine.category)
      .filter(Boolean);

    return ["All", ...new Set(available)].sort((a, b) => {
      if (a === "All") return -1;
      return a.localeCompare(b);
    });
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const ingredients = Array.isArray(medicine.active_ingredients)
        ? medicine.active_ingredients
            .map((item) =>
              typeof item === "string"
                ? item
                : item?.name || ""
            )
            .join(" ")
        : "";

      const searchableContent = [
        medicine.name,
        medicine.generic_name,
        medicine.category,
        medicine.uses,
        ...(medicine.brand_names || []),
        ...(medicine.available_forms || []),
        ingredients,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableContent.includes(searchText);

      const matchesCategory =
        category === "All" || medicine.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [medicines, search, category]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
  }

  return (
    <main className="app medicine-directory">

      {/* HERO SECTION */}

      <section className="medicine-hero">
        <div className="medicine-hero-content">
          <span className="medicine-eyebrow">
            VAXCARE HEALTHCARE DIRECTORY
          </span>

          <h1>
            Medicines & <span>Tablets</span>
          </h1>

          <p>
            Explore educational information about medicines, their
            ingredients, common uses, available forms and important
            safety considerations.
          </p>

          <div className="medicine-hero-stat">
            <div className="medicine-stat-icon">💊</div>

            <div>
              <strong>{medicines.length}</strong>
              <span>Published medicine records</span>
            </div>
          </div>
        </div>

        <div className="medicine-hero-visual" aria-hidden="true">
          <div className="medicine-hero-circle">💊</div>
        </div>
      </section>

      {/* DIRECTORY */}

      <section className="medicine-content">

        <div className="medicine-heading">
          <span className="medicine-section-label">
            MEDICINE INFORMATION
          </span>

          <h2>Explore the medicine directory</h2>

          <p>
            Search for a medicine or browse available categories.
          </p>
        </div>

        {/* SEARCH */}

        <div className="medicine-search-panel">

          <div className="medicine-search-box">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search medicine, generic name or ingredient..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search medicines"
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

          {/* CATEGORY FILTER */}

          <div className="medicine-filter-area">
            <span className="medicine-filter-label">
              Browse by category
            </span>

            <div
              className="medicine-filters"
              role="group"
              aria-label="Filter medicines by category"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    category === item
                      ? "medicine-filter active"
                      : "medicine-filter"
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

        {/* RESULTS */}

        <div className="medicine-results-heading">
          <div>
            <h2>Available Medicines</h2>

            <p>
              {loading
                ? "Retrieving medicine information..."
                : `Showing ${filteredMedicines.length} of ${medicines.length} medicines`}
            </p>
          </div>

          {(search || category !== "All") && (
            <button
              type="button"
              className="medicine-reset-button"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          )}
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="medicine-state">
            <div className="medicine-loader" />
            <h3>Loading medicine information</h3>
            <p>Please wait while we retrieve the directory.</p>
          </div>

        ) : error ? (

          /* ERROR */

          <div className="medicine-state medicine-error">
            <h3>Unable to load medicines</h3>
            <p>{error}</p>

            <button
              type="button"
              className="medicine-retry-button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try Again
            </button>
          </div>

        ) : filteredMedicines.length > 0 ? (

          /* MEDICINE CARDS */

          <div className="medicine-grid">

            {filteredMedicines.map((medicine) => (
              <article
                className="medicine-card"
                key={medicine.id}
              >

                <div className="medicine-card-top">
                  <div className="medicine-card-icon">
                    💊
                  </div>

                  <span className="medicine-card-category">
                    {medicine.category || "Uncategorised"}
                  </span>
                </div>

                <div className="medicine-card-content">

                  <h3>{medicine.name}</h3>

                  {medicine.generic_name && (
                    <p className="medicine-generic-name">
                      Generic name: {medicine.generic_name}
                    </p>
                  )}

                  <p className="medicine-purpose">
                    {medicine.uses ||
                      "Detailed use information is not currently available."}
                  </p>

                  {Array.isArray(medicine.available_forms) &&
                    medicine.available_forms.length > 0 && (
                      <div className="medicine-forms">
                        {medicine.available_forms.map((form) => (
                          <span key={form}>{form}</span>
                        ))}
                      </div>
                    )}

                </div>

                <div className="medicine-card-footer">

                  <span
                    className={
                      medicine.prescription_required
                        ? "medicine-prescription required"
                        : "medicine-prescription"
                    }
                  >
                    {medicine.prescription_required
                      ? "Prescription required"
                      : "Prescription not marked as required"}
                  </span>

                  <Link
                    to={`/medicines/${medicine.id}`}
                    className="medicine-details-button"
                    aria-label={`View details about ${medicine.name}`}
                  >
                    View Details <span>→</span>
                  </Link>

                </div>

              </article>
            ))}

          </div>

        ) : (

          /* EMPTY STATE */

          <div className="medicine-state">
            <div className="medicine-empty-icon">⌕</div>

            <h3>No medicines found</h3>

            <p>
              No published medicines match your search or selected
              category.
            </p>

            <button
              type="button"
              className="medicine-retry-button"
              onClick={resetFilters}
            >
              Show All Medicines
            </button>
          </div>

        )}

      </section>

      {/* HEALTH INFORMATION NOTICE */}

      <section className="medicine-disclaimer">
        <span>ⓘ</span>

        <p>
          <strong>Important health information:</strong> This directory
          is intended for educational purposes only. Medicine suitability,
          dosage and treatment depend on individual circumstances.
          Do not start, stop or change medication without appropriate
          advice from a qualified healthcare professional.
        </p>
      </section>

    </main>
  );
}

export default Medicines;
