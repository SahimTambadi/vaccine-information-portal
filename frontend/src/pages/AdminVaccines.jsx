
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminVaccine.css";

function AdminVaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [search, setSearch] = useState("");
  const [originFilter, setOriginFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchVaccines = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("vaccines")
      .select(`
        id,
        name,
        full_name,
        category,
        purpose,
        age,
        icon,
        data_origin,
        review_status,
        source_name,
        source_url,
        source_record_id,
        last_synced_at,
        last_reviewed_at
      `)
      .order("id", { ascending: false });

    if (fetchError) {
      setError(`Unable to load vaccine records: ${fetchError.message}`);
      setLoading(false);
      return;
    }

    setVaccines(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVaccines();
  }, [fetchVaccines]);

  const stats = useMemo(() => ({
    total: vaccines.length,
    imported: vaccines.filter(
      (v) => v.data_origin === "imported"
    ).length,
    manual: vaccines.filter(
      (v) => v.data_origin !== "imported"
    ).length,
    pending: vaccines.filter(
      (v) => (v.review_status || "pending") === "pending"
    ).length,
    verified: vaccines.filter(
      (v) => v.review_status === "verified"
    ).length,
    rejected: vaccines.filter(
      (v) => v.review_status === "rejected"
    ).length,
  }), [vaccines]);

  const filteredVaccines = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return vaccines.filter((vaccine) => {
      const searchableValues = [
        vaccine.name,
        vaccine.full_name,
        vaccine.category,
        vaccine.purpose,
        vaccine.age,
        vaccine.source_name,
        vaccine.data_origin,
        String(vaccine.id),
      ];

      const matchesSearch =
        !searchText ||
        searchableValues.some((value) =>
          String(value || "").toLowerCase().includes(searchText)
        );

      const matchesOrigin =
        originFilter === "all" ||
        (originFilter === "imported"
          ? vaccine.data_origin === "imported"
          : vaccine.data_origin !== "imported");

      const currentStatus = vaccine.review_status || "pending";
      const matchesStatus =
        statusFilter === "all" || currentStatus === statusFilter;

      return matchesSearch && matchesOrigin && matchesStatus;
    });
  }, [vaccines, search, originFilter, statusFilter]);

  function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function isValidHttpsUrl(value) {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }

  function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(
      value.length === 10 ? `${value}T00:00:00` : value
    );

    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function handleReviewAction(vaccine, newStatus) {
    setError("");
    setSuccess("");

    const currentStatus = vaccine.review_status || "pending";

    if (currentStatus !== "pending") {
      setError("Only pending vaccine records can be reviewed here.");
      return;
    }

    if (!["verified", "rejected"].includes(newStatus)) {
      setError("Invalid review action.");
      return;
    }

    if (newStatus === "verified") {
      if (!vaccine.source_name?.trim()) {
        setError(
          `A source name is required before verifying ${vaccine.name}.`
        );
        return;
      }

      if (!isValidHttpsUrl(vaccine.source_url || "")) {
        setError(
          `A valid HTTPS source URL is required before verifying ${vaccine.name}.`
        );
        return;
      }
    }

    const actionText =
      newStatus === "verified" ? "verify and publish" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} "${vaccine.name}"?`
      )
    ) {
      return;
    }

    setActionLoadingId(vaccine.id);

    try {
      const reviewedDate = getLocalDate();

      const { data, error: updateError } = await supabase
        .from("vaccines")
        .update({
          review_status: newStatus,
          last_reviewed_at: reviewedDate,
        })
        .eq("id", vaccine.id)
        .eq("review_status", currentStatus)
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!data) {
        throw new Error(
          "The record was not updated. It may have changed already, or your admin permissions may not allow this action."
        );
      }

      setVaccines((current) =>
        current.map((item) =>
          item.id === vaccine.id
            ? {
                ...item,
                review_status: newStatus,
                last_reviewed_at: reviewedDate,
              }
            : item
        )
      );

      setSuccess(
        `${vaccine.name} has been ${
          newStatus === "verified"
            ? "verified and published."
            : "rejected."
        }`
      );
    } catch (err) {
      setError(err.message || "Unable to update the vaccine record.");
    } finally {
      setActionLoadingId(null);
    }
  }

  function getStatusLabel(status) {
    if (status === "verified") return "Verified";
    if (status === "rejected") return "Rejected";
    return "Pending review";
  }

  function getStatusClass(status) {
    if (status === "verified") return "vax-status-verified";
    if (status === "rejected") return "vax-status-rejected";
    return "vax-status-pending";
  }

  function clearFilters() {
    setSearch("");
    setOriginFilter("all");
    setStatusFilter("all");
  }

  function showPendingRecords() {
    setSearch("");
    setOriginFilter("all");
    setStatusFilter("pending");
  }

  return (
    <main className="app vax-admin-page">

      {/* 1. PAGE HEADER */}
      <header className="vax-admin-header">
        <div className="vax-header-copy">
          <div className="vax-admin-breadcrumb">
            <Link to="/admin">Administration</Link>
            <span>/</span>
            <span>Vaccine Management</span>
          </div>

          <p className="vax-section-label">VAXCARE ADMINISTRATION</p>

          <h1>
            Vaccine <span>Management</span>
          </h1>

          <p className="vax-admin-description">
            Manage vaccine records, review imported information
            and control which verified information appears in
            the public vaccine directory.
          </p>
        </div>

        <Link to="/admin" className="vax-secondary-button">
          <span aria-hidden="true">←</span>
          Admin Dashboard
        </Link>
      </header>

      {/* 2. MANAGEMENT TOOLBAR */}
      <section className="vax-management-toolbar">
        <div>
          <p className="vax-section-label">WORKSPACE</p>
          <h2>Management Tools</h2>
          <p>Manage your vaccine information and data sources.</p>
        </div>

        <div className="vax-action-buttons">
          <Link
            to="/admin/vaccines/new"
            className="vax-primary-button"
          >
            <span aria-hidden="true">＋</span>
            Add Vaccine
          </Link>

          <Link
            to="/admin/vaccines/import"
            className="vax-outline-button"
          >
            <span aria-hidden="true">⇧</span>
            Import Vaccines
          </Link>

          <button
            type="button"
            className="vax-outline-button"
            onClick={fetchVaccines}
            disabled={loading}
          >
            <span aria-hidden="true">↻</span>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {/* 3. OVERVIEW STATISTICS */}
      <section className="vax-overview-section">
        <div className="vax-section-heading">
          <div>
            <p className="vax-section-label">AT A GLANCE</p>
            <h2>Vaccine Overview</h2>
          </div>
          <span className="vax-overview-caption">
            Live directory summary
          </span>
        </div>

        <div className="vax-admin-statistics">
          <article className="vax-stat-card">
            <span>Total Records</span>
            <strong>{stats.total}</strong>
            <small>All vaccine records</small>
          </article>

          <article className="vax-stat-card">
            <span>Imported</span>
            <strong>{stats.imported}</strong>
            <small>External source records</small>
          </article>

          <article className="vax-stat-card">
            <span>Manually Added</span>
            <strong>{stats.manual}</strong>
            <small>Admin-created records</small>
          </article>

          <article className="vax-stat-card vax-stat-warning">
            <span>Pending Review</span>
            <strong>{stats.pending}</strong>
            <small>Awaiting review</small>
          </article>

          <article className="vax-stat-card vax-stat-success">
            <span>Verified</span>
            <strong>{stats.verified}</strong>
            <small>Approved records</small>
          </article>

          <article className="vax-stat-card vax-stat-danger">
            <span>Rejected</span>
            <strong>{stats.rejected}</strong>
            <small>Not publicly available</small>
          </article>
        </div>
      </section>

      {/* 4. REVIEW SUMMARY */}
      <section className="vax-review-summary">
        <div className="vax-review-summary-icon" aria-hidden="true">
          ✓
        </div>

        <div className="vax-review-summary-copy">
          <p className="vax-section-label">CONTENT QUALITY CONTROL</p>
          <h2>Vaccine Review Queue</h2>
          <p>
            Review pending records before making them available
            in the public directory.
          </p>
        </div>

        <div className="vax-review-summary-count">
          <strong>{stats.pending}</strong>
          <span>Awaiting review</span>
        </div>

        <button
          type="button"
          className="vax-outline-button"
          onClick={showPendingRecords}
        >
          View Pending Records →
        </button>
      </section>

      {/* 5. NOTIFICATIONS */}
      {error && (
        <div className="vax-admin-alert vax-alert-error" role="alert">
          <div>
            <strong>Action unsuccessful</strong>
            <p>{error}</p>
          </div>
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="vax-admin-alert vax-alert-success" role="status">
          <div>
            <strong>Update successful</strong>
            <p>{success}</p>
          </div>
          <button type="button" onClick={() => setSuccess("")}>
            Dismiss
          </button>
        </div>
      )}

      {/* 6. VACCINE DIRECTORY */}
      <section className="vax-directory-section">
        <div className="vax-directory-heading">
          <div>
            <p className="vax-section-label">VACCINE DATABASE</p>
            <h2>Vaccine Directory</h2>
            <p>
              Search, filter and manage all available vaccine records.
            </p>
          </div>

          <div className="vax-result-count">
            <strong>{filteredVaccines.length}</strong>
            <span> of {vaccines.length} records</span>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="vax-admin-filters">
          <label className="vax-search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Search vaccine records"
              placeholder="Search by name, category, source or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            aria-label="Filter by origin"
            value={originFilter}
            onChange={(event) => setOriginFilter(event.target.value)}
          >
            <option value="all">All Origins</option>
            <option value="imported">Imported</option>
            <option value="manual">Manually Added</option>
          </select>

          <select
            aria-label="Filter by review status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* DIRECTORY CONTENT */}
        {loading ? (
          <div className="vax-admin-empty">
            <div className="vax-loading-indicator" />
            <h3>Loading vaccine records</h3>
            <p>Please wait while the directory is updated.</p>
          </div>
        ) : filteredVaccines.length === 0 ? (
          <div className="vax-admin-empty">
            <div className="vax-empty-icon">⌕</div>
            <h3>No vaccine records found</h3>
            <p>
              No records match your current search or filters.
            </p>
            <button
              type="button"
              className="vax-outline-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="vax-record-list">
            {filteredVaccines.map((vaccine) => {
              const currentStatus =
                vaccine.review_status || "pending";

              const isPending = currentStatus === "pending";
              const isActionLoading =
                actionLoadingId === vaccine.id;

              return (
                <article
                  className="vax-record-card"
                  key={vaccine.id}
                >
                  <div className="vax-record-main">
                    <div className="vax-record-icon">
                      {vaccine.icon || "💉"}
                    </div>

                    <div className="vax-record-information">
                      <div className="vax-record-title-row">
                        <h3>{vaccine.name}</h3>

                        <span
                          className={`vax-review-badge ${getStatusClass(currentStatus)}`}
                        >
                          {getStatusLabel(currentStatus)}
                        </span>
                      </div>

                      {vaccine.full_name && (
                        <p className="vax-record-full-name">
                          {vaccine.full_name}
                        </p>
                      )}

                      <div className="vax-record-meta">
                        <span>
                          {vaccine.category || "Uncategorized"}
                        </span>
                        <span>
                          {vaccine.data_origin === "imported"
                            ? "Imported"
                            : "Manually Added"}
                        </span>
                        <span>Record ID: {vaccine.id}</span>
                      </div>

                      {vaccine.purpose && (
                        <p className="vax-record-purpose">
                          {vaccine.purpose}
                        </p>
                      )}

                      {vaccine.age && (
                        <p className="vax-record-age">
                          <strong>Age / Schedule:</strong> {vaccine.age}
                        </p>
                      )}

                      <div className="vax-record-source">
                        <span>
                          Source: {vaccine.source_name || "Not recorded"}
                        </span>

                        {vaccine.source_url &&
                          isValidHttpsUrl(vaccine.source_url) && (
                            <a
                              href={vaccine.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open source ↗
                            </a>
                          )}
                      </div>

                      <div className="vax-record-dates">
                        {vaccine.last_synced_at && (
                          <span>
                            Imported: {formatDate(vaccine.last_synced_at)}
                          </span>
                        )}

                        {vaccine.last_reviewed_at && (
                          <span>
                            Reviewed: {formatDate(vaccine.last_reviewed_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="vax-record-actions">
                    <Link
                      to={`/admin/vaccines/${vaccine.id}`}
                      className="vax-view-button"
                    >
                      View Details →
                    </Link>

                    {isPending && (
                      <div className="vax-review-buttons">
                        <button
                          type="button"
                          className="vax-verify-button"
                          disabled={isActionLoading}
                          onClick={() =>
                            handleReviewAction(vaccine, "verified")
                          }
                        >
                          {isActionLoading
                            ? "Updating..."
                            : "✓ Verify & Publish"}
                        </button>

                        <button
                          type="button"
                          className="vax-reject-button"
                          disabled={isActionLoading}
                          onClick={() =>
                            handleReviewAction(vaccine, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminVaccines;
