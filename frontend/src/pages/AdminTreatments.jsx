
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
  Download,
} from "lucide-react";
import "./AdminTreatments.css";

function AdminTreatments() {
  const [treatments, setTreatments] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTreatments = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("disease_treatments")
      .select(`
        id,
        disease_id,
        treatment_name,
        treatment_type,
        review_status,
        is_published,
        created_at,
        diseases (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Treatments fetch error:", error);
      setError(error.message);
      setTreatments([]);
    } else {
      setTreatments(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const stats = useMemo(() => ({
    total: treatments.length,
    pending: treatments.filter(
      (item) => item.review_status === "pending"
    ).length,
    verified: treatments.filter(
      (item) => item.review_status === "verified"
    ).length,
    rejected: treatments.filter(
      (item) => item.review_status === "rejected"
    ).length,
  }), [treatments]);

  const filteredTreatments = useMemo(() => {
    return treatments.filter((item) => {
      const matchesSearch =
        item.treatment_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.diseases?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" || item.review_status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [treatments, search, filter]);

  const formatDate = (value) => {
    if (!value) return "Not available";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-treatments-page">
      <div className="admin-treatments-container">

        <div className="admin-treatments-header">
          <div>
            <span className="admin-treatments-eyebrow">
              CONTENT MANAGEMENT
            </span>
            <h1>Treatments Management</h1>
            <p>
              Manage treatment information, medical evidence and review
              submissions before publication.
            </p>
          </div>

          <div className="admin-treatments-header-actions">

            <button
              className="admin-treatment-refresh-btn"
              onClick={fetchTreatments}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <Link
              to="/admin/treatments/import"
              className="admin-treatment-import-btn"
            >
              <Download size={18} />
              Import Treatments
            </Link>

            <Link
              to="/admin/treatments/new"
              className="admin-treatment-add-btn"
            >
              <Plus size={18} />
              Add Treatment
            </Link>

          </div>
        </div>

        <div className="admin-treatment-stats">

          <div className="admin-treatment-stat-card">
            <div className="admin-treatment-stat-icon total">
              <ClipboardList size={22} />
            </div>
            <div>
              <span>Total Treatments</span>
              <h2>{stats.total}</h2>
            </div>
          </div>

          <div className="admin-treatment-stat-card">
            <div className="admin-treatment-stat-icon pending">
              <Clock size={22} />
            </div>
            <div>
              <span>Pending Review</span>
              <h2>{stats.pending}</h2>
            </div>
          </div>

          <div className="admin-treatment-stat-card">
            <div className="admin-treatment-stat-icon verified">
              <CheckCircle size={22} />
            </div>
            <div>
              <span>Verified</span>
              <h2>{stats.verified}</h2>
            </div>
          </div>

          <div className="admin-treatment-stat-card">
            <div className="admin-treatment-stat-icon rejected">
              <XCircle size={22} />
            </div>
            <div>
              <span>Rejected</span>
              <h2>{stats.rejected}</h2>
            </div>
          </div>

        </div>

        <div className="admin-treatment-content">

          <div className="admin-treatment-toolbar">

            <div className="admin-treatment-search">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search by treatment or disease..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Treatments</option>
              <option value="pending">Pending Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

          </div>

          {error && (
            <div className="admin-treatment-error">
              <strong>Unable to load treatments.</strong>
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="admin-treatment-message">
              Loading treatments...
            </div>
          ) : filteredTreatments.length === 0 ? (
            <div className="admin-treatment-empty">
              <ClipboardList size={42} />
              <h3>No treatments found</h3>
              <p>
                Add a treatment manually or import one from the treatment catalogue.
              </p>

              <div className="admin-treatment-empty-actions">
                <Link to="/admin/treatments/import">
                  <Download size={17} />
                  Import Treatments
                </Link>

                <Link to="/admin/treatments/new">
                  <Plus size={17} />
                  Add Treatment
                </Link>
              </div>
            </div>
          ) : (
            <div className="admin-treatment-table-wrapper">
              <table className="admin-treatment-table">
                <thead>
                  <tr>
                    <th>Treatment</th>
                    <th>Related Disease</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Publication</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTreatments.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.treatment_name}</strong>
                      </td>

                      <td>
                        {item.diseases?.name || "Disease unavailable"}
                      </td>

                      <td>
                        {item.treatment_type?.replaceAll("_", " ") || "Not specified"}
                      </td>

                      <td>
                        <span
                          className={`admin-treatment-status ${item.review_status}`}
                        >
                          {item.review_status}
                        </span>
                      </td>

                      <td>
                        <span className={
                          item.is_published
                            ? "admin-treatment-published"
                            : "admin-treatment-unpublished"
                        }>
                          {item.is_published ? "Published" : "Unpublished"}
                        </span>
                      </td>

                      <td>{formatDate(item.created_at)}</td>

                      <td>
                        <Link
                          to={`/admin/treatments/${item.id}`}
                          className="admin-treatment-view-btn"
                          title="View treatment"
                        >
                          <Eye size={17} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminTreatments;
