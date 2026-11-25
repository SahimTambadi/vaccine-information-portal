
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminDoctors.css";

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DOCTOR RECORDS
  // ==========================================

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("doctors")
      .select(`
        id,
        full_name,
        slug,
        qualifications,
        registration_number,
        registration_council,
        experience_years,
        phone,
        email,
        consultation_fee,
        consultation_mode,
        review_status,
        last_reviewed_at,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin doctor fetch error:", error);

      setError(
        "Unable to load doctor records. Check your administrator permissions and database policies."
      );

      setDoctors([]);
    } else {
      setDoctors(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // ==========================================
  // DOCTOR STATISTICS
  // ==========================================

  const counts = useMemo(
    () => ({
      all: doctors.length,
      pending: doctors.filter(
        item => item.review_status === "pending"
      ).length,
      verified: doctors.filter(
        item => item.review_status === "verified"
      ).length,
      rejected: doctors.filter(
        item => item.review_status === "rejected"
      ).length,
    }),
    [doctors]
  );

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return doctors.filter(doctor => {
      const searchableValues = [
        doctor.full_name,
        doctor.slug,
        doctor.qualifications,
        doctor.registration_number,
        doctor.registration_council,
        doctor.phone,
        doctor.email,
      ];

      const matchesSearch = searchableValues
        .filter(Boolean)
        .some(value =>
          String(value).toLowerCase().includes(query)
        );

      const matchesFilter =
        filter === "all" ||
        doctor.review_status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [doctors, search, filter]);

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
  // FORMAT STATUS
  // ==========================================

  function formatStatus(status) {
    if (!status) return "Pending";

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="admin-doctors-page">

      {/* HERO */}

      <section className="admin-doctors-hero">
        <div>
          <span className="admin-doctors-eyebrow">
            VAXCARE ADMINISTRATION
          </span>

          <h1>Doctor Management</h1>

          <p>
            Manage doctor profiles, review professional
            credentials and control which doctor records
            are available to the public.
          </p>
        </div>

        <div
          className="admin-doctors-hero-icon"
          aria-hidden="true"
        >
          🩺
        </div>
      </section>

      <section className="admin-doctors-content">

        {/* ACTIONS */}

        <div className="admin-doctors-heading-actions">

          {/* MANUAL ADD */}

          <Link
            to="/admin/doctors/new"
            className="admin-doctor-add-button"
          >
            + Add Doctor
          </Link>

          {/* IMPORT DOCTORS */}

          <Link
            to="/admin/doctors/import"
            className="admin-doctor-import-link"
          >
            ↓ Import Doctors
          </Link>

          {/* REFRESH */}

          <button
            type="button"
            className="admin-doctors-refresh"
            onClick={fetchDoctors}
            disabled={loading}
          >
            ↻ Refresh
          </button>

        </div>

        {/* STATISTICS */}

        <div className="admin-doctor-stats">

          <article className="admin-doctor-stat">
            <span>Total Doctors</span>
            <strong>{loading ? "—" : counts.all}</strong>
          </article>

          <article className="admin-doctor-stat">
            <span>Pending Review</span>
            <strong>{loading ? "—" : counts.pending}</strong>
          </article>

          <article className="admin-doctor-stat">
            <span>Verified</span>
            <strong>{loading ? "—" : counts.verified}</strong>
          </article>

          <article className="admin-doctor-stat">
            <span>Rejected</span>
            <strong>{loading ? "—" : counts.rejected}</strong>
          </article>

        </div>

        {/* SEARCH AND FILTER */}

        <section className="admin-doctor-toolbar">

          <div className="admin-doctor-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search doctor name, qualification, registration or contact..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label="Search doctor records"
            />
          </div>

          <div className="admin-doctor-filters">

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
                    ? "admin-doctor-filter active"
                    : "admin-doctor-filter"
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
          <div className="admin-doctor-error" role="alert">
            <strong>Unable to load records</strong>

            <p>{error}</p>

            <button
              type="button"
              onClick={fetchDoctors}
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="admin-doctor-state">
            <div className="admin-doctor-loader" />
            <p>Loading doctor records...</p>
          </div>
        )}

        {/* DOCTOR TABLE */}

        {!loading && !error && (
          <section className="admin-doctor-table-section">

            <div className="admin-doctor-table-heading">
              <h3>Doctor Database</h3>

              <span>
                {filteredDoctors.length} record(s)
              </span>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="admin-doctor-empty">

                <div>🩺</div>

                <h3>No doctor records found</h3>

                <p>
                  {doctors.length === 0
                    ? "Your database currently has no doctor records. Add a doctor manually or import a doctor from the catalogue."
                    : "Try changing your search or review filter."}
                </p>

                {doctors.length === 0 && (
                  <div className="admin-doctors-empty-actions">

                    <Link
                      to="/admin/doctors/new"
                      className="admin-doctor-add-button"
                    >
                      + Add First Doctor
                    </Link>

                    <Link
                      to="/admin/doctors/import"
                      className="admin-doctor-import-link"
                    >
                      ↓ Import Doctors
                    </Link>

                  </div>
                )}

              </div>
            ) : (
              <div className="admin-doctor-table-wrapper">

                <table className="admin-doctor-table">

                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Qualification</th>
                      <th>Registration Number</th>
                      <th>Experience</th>
                      <th>Last Reviewed</th>
                      <th>Review Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDoctors.map(doctor => (
                      <tr key={doctor.id}>

                        <td>
                          <strong>{doctor.full_name}</strong>

                          <span className="admin-doctor-contact">
                            {doctor.phone || doctor.email ||
                              "Contact not provided"}
                          </span>
                        </td>

                        <td>
                          {doctor.qualifications ||
                            "Not provided"}
                        </td>

                        <td>
                          <span className="admin-doctor-registration">
                            {doctor.registration_number ||
                              "Not provided"}
                          </span>
                        </td>

                        <td>
                          {doctor.experience_years !== null &&
                          doctor.experience_years !== undefined
                            ? `${doctor.experience_years} years`
                            : "Not provided"}
                        </td>

                        <td>
                          {formatDate(doctor.last_reviewed_at)}
                        </td>

                        <td>
                          <span
                            className={`admin-doctor-status ${
                              doctor.review_status || "pending"
                            }`}
                          >
                            {formatStatus(doctor.review_status)}
                          </span>
                        </td>

                        <td>
                          <Link
                            to={`/admin/doctors/${doctor.id}`}
                            className="admin-doctor-view-link"
                            aria-label={`View details for ${doctor.full_name}`}
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

        <div className="admin-doctor-note">
          <span>ⓘ</span>

          <p>
            <strong>Professional verification responsibility:</strong>{" "}
            Doctor registration details and professional credentials
            must be checked against appropriate medical councils
            and reliable sources before verification. Only verified
            profiles should appear in the public doctor directory.
          </p>
        </div>

        {/* BACK TO DASHBOARD */}

        <div className="admin-doctors-back">
          <Link to="/admin">
            ← Back to Admin Dashboard
          </Link>
        </div>

      </section>
    </main>
  );
}

export default AdminDoctors;
