
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("medicines")
      .select(`
        id,
        name,
        generic_name,
        category,
        source_name,
        source_url,
        last_reviewed_at,
        is_published,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin medicine fetch error:", error);

      setError(
        "Unable to load medicine records. Check your administrator permissions and database policies."
      );

      setMedicines([]);
    } else {
      setMedicines(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const counts = useMemo(
    () => ({
      all: medicines.length,
      published: medicines.filter((item) => item.is_published).length,
      unpublished: medicines.filter((item) => !item.is_published).length,
    }),
    [medicines]
  );

  const filteredMedicines = useMemo(() => {
    const query = search.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const matchesSearch = [
        medicine.name,
        medicine.generic_name,
        medicine.category,
        medicine.source_name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      const matchesFilter =
        filter === "all" ||
        (filter === "published" && medicine.is_published) ||
        (filter === "unpublished" && !medicine.is_published);

      return matchesSearch && matchesFilter;
    });
  }, [medicines, search, filter]);

  function formatDate(date) {
    if (!date) return "Not reviewed";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return "Invalid date";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="admin-medicines-page">
      {/* HEADER */}

      <section className="admin-medicines-hero">
        <div>
          <span className="admin-medicines-eyebrow">
            VAXCARE ADMINISTRATION
          </span>

          <h1>Medicine Management</h1>

          <p>
            Review medicine records, publication status and medical
            reference information.
          </p>
        </div>

        <div className="admin-medicines-hero-icon" aria-hidden="true">
          💊
        </div>
      </section>

      {/* OVERVIEW */}

      <section className="admin-medicines-content">
        <div className="admin-medicines-heading-actions">
  <Link
    to="/admin/medicines/new"
    className="admin-medicine-add-button"
  >
    + Add Medicine
  </Link>

  <button
    type="button"
    className="admin-medicines-refresh"
    onClick={fetchMedicines}
    disabled={loading}
  >
    ↻ Refresh
  </button>
</div>

        {/* STATISTICS */}

        <div className="admin-medicine-stats">
          <article className="admin-medicine-stat">
            <span>Total Records</span>
            <strong>{loading ? "—" : counts.all}</strong>
          </article>

          <article className="admin-medicine-stat">
            <span>Published</span>
            <strong>{loading ? "—" : counts.published}</strong>
          </article>

          <article className="admin-medicine-stat">
            <span>Unpublished</span>
            <strong>{loading ? "—" : counts.unpublished}</strong>
          </article>
        </div>

        {/* SEARCH AND FILTER */}

        <section className="admin-medicine-toolbar">
          <div className="admin-medicine-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search name, generic name, category or source..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search medicine records"
            />
          </div>

          <div className="admin-medicine-filters">
            {[
              { value: "all", label: "All Records" },
              { value: "published", label: "Published" },
              { value: "unpublished", label: "Unpublished" },
            ].map((item) => (
              <button
                type="button"
                key={item.value}
                className={
                  filter === item.value
                    ? "admin-medicine-filter active"
                    : "admin-medicine-filter"
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
          <div className="admin-medicine-error" role="alert">
            <strong>Unable to load records</strong>
            <p>{error}</p>

            <button type="button" onClick={fetchMedicines}>
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="admin-medicine-state">
            <div className="admin-medicine-loader" />
            <p>Loading medicine records...</p>
          </div>
        )}

        {/* MEDICINE TABLE */}

        {!loading && !error && (
          <section className="admin-medicine-table-section">
            <div className="admin-medicine-table-heading">
              <h3>Medicine Database</h3>

              <span>{filteredMedicines.length} record(s)</span>
            </div>

            {filteredMedicines.length === 0 ? (
              <div className="admin-medicine-empty">
                <div>💊</div>

                <h3>No medicine records found</h3>

                <p>
                  {medicines.length === 0
                    ? "Your database currently has no medicine records."
                    : "Try changing your search or publication filter."}
                </p>
              </div>
            ) : (
              <div className="admin-medicine-table-wrapper">
                <table className="admin-medicine-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Category</th>
                      <th>Reference Source</th>
                      <th>Last Reviewed</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMedicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td>
                          <strong>{medicine.name}</strong>

                          <span className="admin-medicine-generic">
                            {medicine.generic_name ||
                              "Generic name not provided"}
                          </span>
                        </td>

                        <td>
                          {medicine.category || "Not categorized"}
                        </td>

                        <td>
                          {medicine.source_name || "Source not provided"}
                        </td>

                        <td>
                          {formatDate(medicine.last_reviewed_at)}
                        </td>

                        <td>
                          <span
                            className={
                              medicine.is_published
                                ? "admin-medicine-status published"
                                : "admin-medicine-status unpublished"
                            }
                          >
                            {medicine.is_published
                              ? "Published"
                              : "Unpublished"}
                          </span>
                        </td>

                        <td>
                          <Link
                            to={`/admin/medicines/${medicine.id}`}
                            className="admin-medicine-view-link"
                            aria-label={`View details for ${medicine.name}`}
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

        {/* INFORMATION NOTE */}

        <div className="admin-medicine-note">
          <span>ⓘ</span>

          <p>
            <strong>Publication responsibility:</strong> Medicine
            information should only be published after checking its
            accuracy against a trustworthy medical reference. Review
            the complete record and its source before publishing.
          </p>
        </div>

        <div className="admin-medicines-back">
          <Link to="/admin">← Back to Admin Dashboard</Link>
        </div>
      </section>
    </main>
  );
}

export default AdminMedicines;
