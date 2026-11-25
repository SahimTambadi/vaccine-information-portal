
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminMedicines.css";

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
        source_record_id,
        data_origin,
        review_status,
        last_reviewed_at,
        last_synced_at,
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
      pending: medicines.filter(item => item.review_status === "pending").length,
      verified: medicines.filter(item => item.review_status === "verified").length,
      rejected: medicines.filter(item => item.review_status === "rejected").length,
      manual: medicines.filter(item => item.data_origin === "manual").length,
      imported: medicines.filter(item => item.data_origin === "imported").length,
    }),
    [medicines]
  );

  const filteredMedicines = useMemo(() => {
    const query = search.trim().toLowerCase();

    return medicines.filter(medicine => {
      const matchesSearch = [
        medicine.name,
        medicine.generic_name,
        medicine.category,
        medicine.source_name,
        medicine.source_record_id,
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query));

      const matchesFilter =
        filter === "all" ||
        medicine.review_status === filter ||
        medicine.data_origin === filter;

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

  function formatStatus(status) {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  return (
    <main className="admin-medicines-page">
      <section className="admin-medicines-hero">
        <div>
          <span className="admin-medicines-eyebrow">
            VAXCARE ADMINISTRATION
          </span>
          <h1>Medicine Management</h1>
          <p>
            Manage medicine records, review their medical references
            and control which records are available to the public.
          </p>
        </div>

        <div className="admin-medicines-hero-icon" aria-hidden="true">
          💊
        </div>
      </section>

      <section className="admin-medicines-content">
        {/* ACTIONS */}
        <div className="admin-medicines-heading-actions">
          <Link
            to="/admin/medicines/new"
            className="admin-medicine-add-button"
          >
            + Add Medicine
          </Link>

          <Link
            to="/admin/medicines/import"
            className="admin-medicine-add-button"
          >
            Import Medicines
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
            <span>Pending Review</span>
            <strong>{loading ? "—" : counts.pending}</strong>
          </article>
          <article className="admin-medicine-stat">
            <span>Verified</span>
            <strong>{loading ? "—" : counts.verified}</strong>
          </article>
          <article className="admin-medicine-stat">
            <span>Rejected</span>
            <strong>{loading ? "—" : counts.rejected}</strong>
          </article>
          <article className="admin-medicine-stat">
            <span>Manual Records</span>
            <strong>{loading ? "—" : counts.manual}</strong>
          </article>
          <article className="admin-medicine-stat">
            <span>Imported Records</span>
            <strong>{loading ? "—" : counts.imported}</strong>
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
              onChange={event => setSearch(event.target.value)}
              aria-label="Search medicine records"
            />
          </div>

          <div className="admin-medicine-filters">
            {[
              { value: "all", label: "All Records" },
              { value: "pending", label: "Pending" },
              { value: "verified", label: "Verified" },
              { value: "rejected", label: "Rejected" },
              { value: "manual", label: "Manual" },
              { value: "imported", label: "Imported" },
            ].map(item => (
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

        {error && (
          <div className="admin-medicine-error" role="alert">
            <strong>Unable to load records</strong>
            <p>{error}</p>
            <button type="button" onClick={fetchMedicines}>
              Try Again
            </button>
          </div>
        )}

        {loading && (
          <div className="admin-medicine-state">
            <div className="admin-medicine-loader" />
            <p>Loading medicine records...</p>
          </div>
        )}

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
                    : "Try changing your search or review filter."}
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
                      <th>Data Origin</th>
                      <th>Last Reviewed</th>
                      <th>Review Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMedicines.map(medicine => (
                      <tr key={medicine.id}>
                        <td>
                          <strong>{medicine.name}</strong>
                          <span className="admin-medicine-generic">
                            {medicine.generic_name ||
                              "Generic name not provided"}
                          </span>
                        </td>
                        <td>{medicine.category || "Not categorized"}</td>
                        <td>{medicine.source_name || "Source not provided"}</td>
                        <td>
                          <span className="admin-medicine-origin">
                            {medicine.data_origin === "imported"
                              ? "Imported"
                              : "Manual"}
                          </span>
                        </td>
                        <td>{formatDate(medicine.last_reviewed_at)}</td>
                        <td>
                          <span
                            className={`admin-medicine-status ${medicine.review_status || "pending"}`}
                          >
                            {formatStatus(medicine.review_status)}
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

        <div className="admin-medicine-note">
          <span>ⓘ</span>
          <p>
            <strong>Medical review responsibility:</strong> Medicine
            records should only be verified after checking their
            accuracy against trustworthy medical references.
            Pending and rejected records must not be presented as
            verified public information.
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
