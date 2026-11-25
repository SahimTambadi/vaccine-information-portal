
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Medicines.css";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [selectedUnverified, setSelectedUnverified] = useState(null);

  // FETCH SAFE PUBLIC CATALOGUE INFORMATION
  useEffect(() => {
    let active = true;

    async function fetchMedicines() {
      setLoading(true);
      setError("");

      try {
        const { data, error: fetchError } = await supabase
          .from("medicine_public_catalog")
          .select("id, name, generic_name, category, review_status")
          .order("name", { ascending: true });

        if (fetchError) throw fetchError;

        if (active) {
          setMedicines(data || []);
        }
      } catch (err) {
        console.error("Error fetching medicine catalogue:", err);

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

  // SEPARATE VERIFIED AND NOT VERIFIED MEDICINES
  const verifiedMedicines = useMemo(
    () =>
      medicines.filter(
        (medicine) => medicine.review_status === "verified"
      ),
    [medicines]
  );

  const unverifiedMedicines = useMemo(
    () =>
      medicines.filter(
        (medicine) => medicine.review_status !== "verified"
      ),
    [medicines]
  );

  // CATEGORY FILTERS FROM THE PUBLIC CATALOGUE
  const categories = useMemo(() => {
    const available = medicines
      .map((medicine) => medicine.category)
      .filter(Boolean);

    return [
      "All",
      ...[...new Set(available)].sort((a, b) =>
        a.localeCompare(b)
      ),
    ];
  }, [medicines]);

  // SEARCH AND CATEGORY FILTER
  function filterMedicines(list) {
    const searchText = search.trim().toLowerCase();

    return list.filter((medicine) => {
      const searchableContent = [
        medicine.name,
        medicine.generic_name,
        medicine.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableContent.includes(searchText);

      const matchesCategory =
        category === "All" ||
        medicine.category === category;

      return matchesSearch && matchesCategory;
    });
  }

  const filteredVerified = useMemo(
    () => filterMedicines(verifiedMedicines),
    [verifiedMedicines, search, category]
  );

  const filteredUnverified = useMemo(
    () => filterMedicines(unverifiedMedicines),
    [unverifiedMedicines, search, category]
  );

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setSelectedUnverified(null);
  }

  function getVerificationMessage(medicine) {
    if (medicine.review_status === "rejected") {
      return "This medicine has not been approved by the VaxCare administration team. Its medical details are not available for public viewing.";
    }

    return "This medicine is still awaiting verification by the VaxCare administration team. Its medical details will become available only after approval.";
  }

  // REUSABLE MEDICINE CARD
  function MedicineCard({ medicine, verified }) {
    const isSelected = selectedUnverified === medicine.id;

    return (
      <article className="medicine-card" key={medicine.id}>
        <div className="medicine-card-top">
          <div className="medicine-card-icon">
            <span>✚</span>
          </div>

          <span className="medicine-card-category">
            {medicine.category || "Uncategorised"}
          </span>
        </div>

        <div className="medicine-card-content">
          <h3>{medicine.name}</h3>

          {verified ? (
            <div className="medicine-verified-label">
              <span>✓</span>
              Verified
            </div>
          ) : (
            <div className="medicine-unverified-label">
              <span>!</span>
              Not Verified
            </div>
          )}

          {medicine.generic_name && (
            <p className="medicine-generic-name">
              <span>Generic name</span>
              {medicine.generic_name}
            </p>
          )}

          {verified ? (
            <p className="medicine-purpose">
              This medicine has been reviewed and verified.
              Open its details to view the available information.
            </p>
          ) : (
            <p className="medicine-purpose">
              Medical information is not available until this
              medicine has been verified.
            </p>
          )}
        </div>

        <div className="medicine-card-footer">
          {verified ? (
            <span className="medicine-prescription">
              <span className="medicine-status-dot" />
              Admin verified
            </span>
          ) : (
            <span className="medicine-prescription">
              <span className="medicine-status-dot" />
              Review pending or not approved
            </span>
          )}

          {verified ? (
            <Link
              to={`/medicines/${medicine.id}`}
              className="medicine-details-button"
            >
              Show Details
              <span>→</span>
            </Link>
          ) : (
            <button
              type="button"
              className="medicine-details-button"
              onClick={() =>
                setSelectedUnverified(
                  isSelected ? null : medicine.id
                )
              }
            >
              {isSelected ? "Hide Status" : "Check Status"}
              <span>ⓘ</span>
            </button>
          )}
        </div>

        {!verified && isSelected && (
          <div className="medicine-verification-message">
            <strong>
              {medicine.review_status === "rejected"
                ? "Not Approved"
                : "Verification Pending"}
            </strong>
            <p>{getVerificationMessage(medicine)}</p>
          </div>
        )}
      </article>
    );
  }

  return (
    <main className="medicine-directory">

      {/* HERO SECTION */}
      <section className="medicine-hero">
        <div className="medicine-hero-content">
          <div className="medicine-eyebrow">
            <span className="medicine-eyebrow-dot" />
            VAXCARE HEALTHCARE DIRECTORY
          </div>

          <h1>
            Medicine <span>Information</span>
          </h1>

          <p>
            Explore the medicine catalogue. Check which medicines
            have been verified by the VaxCare administration team
            and which are still awaiting review.
          </p>

          <div className="medicine-hero-bottom">
            <div className="medicine-hero-stat">
              <div className="medicine-stat-icon">✚</div>

              <div>
                <strong>{verifiedMedicines.length}</strong>
                <span>Verified medicines</span>
              </div>
            </div>

            <div className="medicine-hero-stat-divider" />

            <div className="medicine-hero-stat">
              <div className="medicine-stat-icon">!</div>

              <div>
                <strong>{unverifiedMedicines.length}</strong>
                <span>Not verified</span>
              </div>
            </div>

            <div className="medicine-hero-stat-divider" />

            <div className="medicine-hero-trust">
              <span className="medicine-trust-icon">✓</span>
              <span>Admin reviewed catalogue</span>
            </div>
          </div>
        </div>

        <div className="medicine-hero-visual" aria-hidden="true">
          <div className="medicine-visual-orbit medicine-orbit-one" />
          <div className="medicine-visual-orbit medicine-orbit-two" />

          <div className="medicine-visual-card">
            <div className="medicine-visual-card-top">
              <span>VAXCARE</span>
              <span className="medicine-visual-plus">+</span>
            </div>

            <div className="medicine-visual-pill">
              <span />
              <span />
            </div>

            <div className="medicine-visual-capsule">
              <span />
              <span />
            </div>

            <div className="medicine-visual-card-bottom">
              <span>MEDICINE DIRECTORY</span>
              <span>01 / HEALTHCARE</span>
            </div>
          </div>

          <div className="medicine-floating-icon medicine-float-one">
            ✚
          </div>

          <div className="medicine-floating-icon medicine-float-two">
            +
          </div>
        </div>
      </section>

      {/* MAIN DIRECTORY */}
      <section className="medicine-content">

        <div className="medicine-heading">
          <div>
            <span className="medicine-section-label">
              EXPLORE HEALTHCARE
            </span>

            <h2>Medicine Directory</h2>

            <p>
              Browse verified and not-yet-verified medicines
              separately.
            </p>
          </div>

          <div className="medicine-heading-badge">
            <span className="medicine-heading-badge-dot" />
            Verification Status
          </div>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="medicine-search-panel">
          <label
            className="medicine-search-label"
            htmlFor="medicine-search"
          >
            Search medicines
          </label>

          <div className="medicine-search-box">
            <span className="medicine-search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              id="medicine-search"
              type="search"
              placeholder="Search by medicine name or generic name..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedUnverified(null);
              }}
              aria-label="Search medicines"
            />

            {search && (
              <button
                type="button"
                className="medicine-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          <div className="medicine-filter-area">
            <div className="medicine-filter-heading">
              <span className="medicine-filter-label">
                Browse by category
              </span>

              <span className="medicine-filter-count">
                {categories.length - 1} categories
              </span>
            </div>

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
                  onClick={() => {
                    setCategory(item);
                    setSelectedUnverified(null);
                  }}
                >
                  {item === "All" && (
                    <span className="medicine-filter-all-icon">
                      ◈
                    </span>
                  )}
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="medicine-state">
            <div className="medicine-loader" />
            <h3>Loading medicine catalogue</h3>
            <p>Please wait while we retrieve the medicines.</p>
          </div>
        ) : error ? (
          <div className="medicine-state medicine-error">
            <div className="medicine-state-icon">!</div>
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
        ) : (
          <>
            {/* VERIFIED MEDICINES SECTION */}
            <div className="medicine-results-heading">
              <div>
                <span className="medicine-section-label">
                  APPROVED MEDICINES
                </span>

                <h2>
                  <span className="medicine-heading-badge-dot" />
                  Verified Medicines
                </h2>

                <p>
                  {filteredVerified.length} of {verifiedMedicines.length}
                  {" "}verified medicines
                </p>
              </div>
            </div>

            {filteredVerified.length > 0 ? (
              <div className="medicine-grid">
                {filteredVerified.map((medicine) => (
                  <MedicineCard
                    key={medicine.id}
                    medicine={medicine}
                    verified={true}
                  />
                ))}
              </div>
            ) : (
              <div className="medicine-state">
                <h3>No verified medicines found</h3>
                <p>
                  There are no verified medicines matching your
                  current search or category.
                </p>
              </div>
            )}

            {/* NOT VERIFIED MEDICINES SECTION */}
            <div className="medicine-results-heading medicine-unverified-heading">
              <div>
                <span className="medicine-section-label">
                  AWAITING OR NOT APPROVED
                </span>

                <h2>Not Verified Medicines</h2>

                <p>
                  {filteredUnverified.length} of {unverifiedMedicines.length}
                  {" "}not verified medicines
                </p>
              </div>
            </div>

            {filteredUnverified.length > 0 ? (
              <div className="medicine-grid">
                {filteredUnverified.map((medicine) => (
                  <MedicineCard
                    key={medicine.id}
                    medicine={medicine}
                    verified={false}
                  />
                ))}
              </div>
            ) : (
              <div className="medicine-state">
                <h3>No not-verified medicines found</h3>
                <p>
                  There are no pending or rejected medicines
                  matching your current search or category.
                </p>
              </div>
            )}

            {(search || category !== "All") && (
              <div className="medicine-reset-area">
                <button
                  type="button"
                  className="medicine-retry-button"
                  onClick={resetFilters}
                >
                  Show All Medicines
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* MEDICAL INFORMATION NOTICE */}
      <section className="medicine-disclaimer">
        <div className="medicine-disclaimer-icon">i</div>

        <p>
          <strong>Important health information</strong>
          <span>
            Only verified medicines can be opened to view their
            available medical information. Not-verified medicines
            are displayed for catalogue status only. Their medical
            details are not available for public viewing.
            Verification is an administrative review and does not
            replace professional medical advice.
          </span>
        </p>
      </section>
    </main>
  );
}

export default Medicines;
