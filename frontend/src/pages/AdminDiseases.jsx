
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminDiseases.css";

function AdminDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DISEASE RECORDS
  // ==========================================

  const fetchDiseases = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("diseases")
      .select(`
        id,
        name,
        slug,
        description,
        source_name,
        source_url,
        review_status,
        last_reviewed_at,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin disease fetch error:", error);

      setError(
        "Unable to load disease records. Check your administrator permissions and database policies."
      );

      setDiseases([]);
    } else {
      setDiseases(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDiseases();
  }, [fetchDiseases]);

  // ==========================================
  // DISEASE STATISTICS
  // ==========================================

  const counts = useMemo(
    () => ({
      all: diseases.length,
      pending: diseases.filter(
        item => item.review_status === "pending"
      ).length,
      verified: diseases.filter(
        item => item.review_status === "verified"
      ).length,
      rejected: diseases.filter(
        item => item.review_status === "rejected"
      ).length,
    }),
    [diseases]
  );

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredDiseases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return diseases.filter(disease => {
      const searchableValues = [
        disease.name,
        disease.slug,
        disease.description,
        disease.source_name,
      ];

      const matchesSearch = searchableValues
        .filter(Boolean)
        .some(value =>
          String(value).toLowerCase().includes(query)
        );

      const matchesFilter =
        filter === "all" ||
        disease.review_status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [diseases, search, filter]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(date) {
    if (!date) return "Not reviewed";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return "Invalid date";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ==========================================
  // FORMAT REVIEW STATUS
  // ==========================================

  function formatStatus(status) {
    if (!status) return "Pending";

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="admin-diseases-page">

      {/* HERO */}

      <section className="admin-diseases-hero">
        <div>
          <span className="admin-diseases-eyebrow">
            VAXCARE ADMINISTRATION
          </span>

          <h1>Disease Management</h1>

          <p>
            Manage disease information, review medical references
            and control which disease records are available to
            the public.
          </p>
        </div>

        <div
          className="admin-diseases-hero-icon"
          aria-hidden="true"
        >
          🦠
        </div>
      </section>

      <section className="admin-diseases-content">

  {/* ACTIONS */}

  <div className="admin-diseases-heading-actions">

    {/* ADD DISEASE - FIRST */}

    <Link
      to="/admin/diseases/new"
      className="admin-disease-add-button"
    >
      + Add Disease
    </Link>

    {/* IMPORT DISEASES - SECOND */}

    <Link
      to="/admin/diseases/import"
      className="admin-disease-import-button"
    >
      ↓ Import Diseases
    </Link>

    {/* REFRESH - THIRD */}

    <button
      type="button"
      className="admin-diseases-refresh"
      onClick={fetchDiseases}
      disabled={loading}
    >
      ↻ Refresh
    </button>

  </div>
        {/* STATISTICS */}

        <div className="admin-disease-stats">

          <article className="admin-disease-stat">
            <span>Total Records</span>
            <strong>{loading ? "—" : counts.all}</strong>
          </article>

          <article className="admin-disease-stat">
            <span>Pending Review</span>
            <strong>{loading ? "—" : counts.pending}</strong>
          </article>

          <article className="admin-disease-stat">
            <span>Verified</span>
            <strong>{loading ? "—" : counts.verified}</strong>
          </article>

          <article className="admin-disease-stat">
            <span>Rejected</span>
            <strong>{loading ? "—" : counts.rejected}</strong>
          </article>

        </div>

        {/* SEARCH AND FILTER */}

        <section className="admin-disease-toolbar">

          <div className="admin-disease-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search disease name, description, slug or source..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label="Search disease records"
            />
          </div>

          <div className="admin-disease-filters">

            {[
              { value: "all", label: "All Records" },
              { value: "pending", label: "Pending" },
              { value: "verified", label: "Verified" },
              { value: "rejected", label: "Rejected" },
            ].map(item => (
              <button
                type="button"
                key={item.value}
                className={
                  filter === item.value
                    ? "admin-disease-filter active"
                    : "admin-disease-filter"
                }
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="admin-disease-error" role="alert">
            <strong>Unable to load records</strong>

            <p>{error}</p>

            <button
              type="button"
              onClick={fetchDiseases}
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="admin-disease-state">
            <div className="admin-disease-loader" />
            <p>Loading disease records...</p>
          </div>
        )}

        {/* DISEASE TABLE */}

        {!loading && !error && (
          <section className="admin-disease-table-section">

            <div className="admin-disease-table-heading">
              <h3>Disease Database</h3>

              <span>
                {filteredDiseases.length} record(s)
              </span>
            </div>

            {filteredDiseases.length === 0 ? (
              <div className="admin-disease-empty">

                <div>🦠</div>

                <h3>No disease records found</h3>

                <p>
                  {diseases.length === 0
                    ? "Your database currently has no disease records. Import a disease or add a disease manually to get started."
                    : "Try changing your search or review filter."}
                </p>

                {diseases.length === 0 && (
                  <div className="admin-disease-empty-actions">

                    <Link
                      to="/admin/diseases/import"
                      className="admin-disease-import-button"
                    >
                      ↓ Import Diseases
                    </Link>

                    <Link
                      to="/admin/diseases/new"
                      className="admin-disease-add-button"
                    >
                      + Add First Disease
                    </Link>

                  </div>
                )}

              </div>
            ) : (
              <div className="admin-disease-table-wrapper">

                <table className="admin-disease-table">

                  <thead>
                    <tr>
                      <th>Disease</th>
                      <th>Slug</th>
                      <th>Reference Source</th>
                      <th>Last Reviewed</th>
                      <th>Review Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDiseases.map(disease => (
                      <tr key={disease.id}>

                        <td>
                          <strong>{disease.name}</strong>

                          <span className="admin-disease-description">
                            {disease.description ||
                              "Description not provided"}
                          </span>
                        </td>

                        <td>
                          <span className="admin-disease-slug">
                            {disease.slug}
                          </span>
                        </td>

                        <td>
                          {disease.source_name ||
                            "Source not provided"}
                        </td>

                        <td>
                          {formatDate(disease.last_reviewed_at)}
                        </td>

                        <td>
                          <span
                            className={`admin-disease-status ${
                              disease.review_status || "pending"
                            }`}
                          >
                            {formatStatus(disease.review_status)}
                          </span>
                        </td>

                        <td>
                          <Link
                            to={`/admin/diseases/${disease.id}`}
                            className="admin-disease-view-link"
                            aria-label={`View details for ${disease.name}`}
                          >
                            View Details →
                          </Link>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            )}

          </section>
        )}

        {/* ADMIN RESPONSIBILITY NOTE */}

        <div className="admin-disease-note">
          <span>ⓘ</span>

          <p>
            <strong>Medical review responsibility:</strong>{" "}
            Disease information must be checked against trustworthy
            medical references before verification. Only verified
            records should be accessible through the public disease
            directory.
          </p>
        </div>

        {/* BACK TO DASHBOARD */}

        <div className="admin-diseases-back">
          <Link to="/admin">
            ← Back to Admin Dashboard
          </Link>
        </div>

      </section>
    </main>
  );
}

export default AdminDiseases;
