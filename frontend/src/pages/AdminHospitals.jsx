
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminHospitals.css";

function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("hospitals")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setHospitals(data || []);
    } catch (err) {
      console.error("Hospital fetch error:", err);
      setError(err.message || "Unable to load hospitals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const counts = useMemo(
    () => ({
      total: hospitals.length,
      pending: hospitals.filter(
        (hospital) => hospital.review_status === "pending"
      ).length,
      verified: hospitals.filter(
        (hospital) => hospital.review_status === "verified"
      ).length,
      rejected: hospitals.filter(
        (hospital) => hospital.review_status === "rejected"
      ).length,
    }),
    [hospitals]
  );

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch = [
        hospital.name,
        hospital.hospital_type,
        hospital.phone,
        hospital.email,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(searchTerm)
        );

      const matchesStatus =
        filter === "all" || hospital.review_status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [hospitals, search, filter]);

  const formatStatus = (status) =>
    status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Unknown";

  return (
    <main className="admin-hospitals-page">
      <div className="admin-hospitals-container">

        {/* HEADER */}

        <div className="admin-hospitals-header">
          <div>
            <p className="admin-hospitals-eyebrow">VAXCARE ADMIN</p>
            <h1>Hospital Management</h1>
            <p>
              Manage hospital profiles, review submissions and maintain
              verified healthcare information.
            </p>
          </div>

          <div className="admin-hospitals-header-actions">
            <button
              type="button"
              className="admin-hospitals-refresh"
              onClick={fetchHospitals}
              disabled={loading}
            >
              ↻ Refresh
            </button>

            <Link
              to="/admin/hospitals/import"
              className="admin-hospitals-import-btn"
            >
              ↓ Import Hospitals
            </Link>

            <Link
              to="/admin/hospitals/new"
              className="admin-hospitals-add-btn"
            >
              + Add Hospital
            </Link>
          </div>
        </div>

        {/* STATISTICS */}

        <section className="admin-hospital-stats">
          <div className="admin-hospital-stat">
            <span>Total Hospitals</span>
            <strong>{counts.total}</strong>
          </div>

          <div className="admin-hospital-stat pending">
            <span>Pending Review</span>
            <strong>{counts.pending}</strong>
          </div>

          <div className="admin-hospital-stat verified">
            <span>Verified</span>
            <strong>{counts.verified}</strong>
          </div>

          <div className="admin-hospital-stat rejected">
            <span>Rejected</span>
            <strong>{counts.rejected}</strong>
          </div>
        </section>

        {/* HOSPITAL RECORDS */}

        <section className="admin-hospitals-content">
          <div className="admin-hospitals-toolbar">
            <div>
              <h2>Hospital Records</h2>
              <p>Review and manage hospital catalogue entries.</p>
            </div>

            <input
              type="search"
              className="admin-hospitals-search"
              placeholder="Search hospitals..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* FILTERS */}

          <div className="admin-hospitals-filters">
            {["all", "pending", "verified", "rejected"].map((status) => (
              <button
                type="button"
                key={status}
                className={filter === status ? "active" : ""}
                onClick={() => setFilter(status)}
              >
                {status === "all" ? "All Hospitals" : formatStatus(status)}
              </button>
            ))}
          </div>

          {error && (
            <div className="admin-hospitals-error">
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="admin-hospitals-message">
              Loading hospitals...
            </div>
          ) : filteredHospitals.length === 0 ? (

            /* EMPTY STATE */

            <div className="admin-hospitals-empty">
              <div className="admin-hospitals-empty-icon">🏥</div>
              <h3>No hospitals found</h3>
              <p>
                {search || filter !== "all"
                  ? "Try changing your search or filter."
                  : "Hospital records will appear here when they are added."}
              </p>

              {!search && filter === "all" && (
                <div className="admin-hospitals-empty-actions">
                  <Link
                    to="/admin/hospitals/import"
                    className="admin-hospitals-import-btn"
                  >
                    Import Hospitals
                  </Link>

                  <Link
                    to="/admin/hospitals/new"
                    className="admin-hospitals-add-btn"
                  >
                    Add Hospital
                  </Link>
                </div>
              )}
            </div>

          ) : (

            /* HOSPITAL TABLE */

            <div className="admin-hospitals-table-wrapper">
              <table className="admin-hospitals-table">
                <thead>
                  <tr>
                    <th>Hospital</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Added On</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHospitals.map((hospital) => (
                    <tr key={hospital.id}>
                      <td>
                        <div className="admin-hospital-name-cell">
                          {hospital.logo_url ? (
                            <img
                              src={hospital.logo_url}
                              alt=""
                              className="admin-hospital-logo"
                            />
                          ) : (
                            <div className="admin-hospital-logo-placeholder">
                              🏥
                            </div>
                          )}

                          <div>
                            <strong>{hospital.name}</strong>
                            <small>{hospital.slug}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {hospital.hospital_type || "Not specified"}
                      </td>

                      <td>
                        <div className="admin-hospital-contact">
                          <span>{hospital.phone || "No phone"}</span>
                          <small>{hospital.email || "No email"}</small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-hospital-status status-${hospital.review_status}`}
                        >
                          {formatStatus(hospital.review_status)}
                        </span>
                      </td>

                      <td>
                        {hospital.created_at
                          ? new Date(hospital.created_at).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </td>

                      <td>
                        <Link
                          to={`/admin/hospitals/${hospital.id}`}
                          className="admin-hospital-review-btn"
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

          {!loading && (
            <div className="admin-hospitals-results">
              Showing {filteredHospitals.length} of {hospitals.length} hospitals
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminHospitals;
