
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminDiseaseDetails.css";

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(
    value.length === 10 ? `${value}T00:00:00` : value
  );

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

// ==========================================
// GET TODAY'S DATE
// ==========================================

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ==========================================
// REUSABLE INFORMATION SECTION
// ==========================================

function DetailSection({ title, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  return (
    <section className="admin-disease-detail-section">
      <h3>{title}</h3>
      <p>{Array.isArray(value) ? value.join(", ") : String(value)}</p>
    </section>
  );
}

// ==========================================
// ADMIN DISEASE DETAILS
// ==========================================

function AdminDiseaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ==========================================
  // FETCH DISEASE AND RELATED INFORMATION
  // ==========================================

  const fetchDisease = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("diseases")
      .select(`
        *,
        disease_sources (
          id,
          source_name,
          source_type,
          source_title,
          source_url,
          source_published_on,
          source_checked_on,
          evidence_note
        ),
        disease_symptoms (
          id,
          notes,
          symptoms (
            id,
            name,
            description
          )
        ),
        disease_specializations (
          id,
          notes,
          specializations (
            id,
            name,
            description
          )
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Disease fetch error:", fetchError);

      setError(
        fetchError.code === "PGRST116"
          ? "Disease record was not found."
          : fetchError.message || "Unable to load this disease."
      );

      setDisease(null);
    } else {
      setDisease(data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDisease();
  }, [fetchDisease]);

  // ==========================================
  // VERIFY OR REJECT DISEASE
  // ==========================================

  const handleReviewAction = async (nextStatus) => {
    if (!disease || actionLoading) return;

    if (disease.review_status !== "pending") {
      alert("Only pending disease records can be reviewed.");
      return;
    }

    if (!["verified", "rejected"].includes(nextStatus)) {
      return;
    }

    if (nextStatus === "verified") {
      const confirmed = window.confirm(
        `Verify "${disease.name}"?\n\nPlease confirm that you have reviewed the medical information and checked its supporting references. Only approve accurate, evidence-based information.`
      );

      if (!confirmed) return;
    }

    if (nextStatus === "rejected") {
      const confirmed = window.confirm(
        `Reject "${disease.name}"?\n\nThis record will not appear in the public disease directory.`
      );

      if (!confirmed) return;
    }

    setActionLoading(true);

    const updateValues = {
      review_status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    if (nextStatus === "verified") {
      updateValues.last_reviewed_at = getTodayDate();
    }

    const { data, error: updateError } = await supabase
      .from("diseases")
      .update(updateValues)
      .eq("id", disease.id)
      .eq("review_status", "pending")
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Disease review error:", updateError);

      alert(
        updateError.message ||
        "Unable to update disease review status."
      );
    } else if (!data) {
      alert(
        "This disease has already been reviewed or changed. Refreshing the latest record."
      );

      await fetchDisease();
    } else {
      setDisease((previous) => ({
        ...previous,
        ...data,
      }));

      alert(
        nextStatus === "verified"
          ? "Disease verified successfully."
          : "Disease rejected successfully."
      );
    }

    setActionLoading(false);
  };

  // ==========================================
  // DELETE DISEASE
  // ==========================================

  const handleDelete = async () => {
    if (!disease || actionLoading) return;

    const confirmed = window.confirm(
      `Permanently delete "${disease.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading(true);

    const { error: deleteError } = await supabase
      .from("diseases")
      .delete()
      .eq("id", disease.id);

    if (deleteError) {
      console.error("Disease delete error:", deleteError);

      alert(
        deleteError.message || "Unable to delete this disease."
      );

      setActionLoading(false);
      return;
    }

    alert("Disease record deleted successfully.");

    navigate("/admin/diseases", { replace: true });
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <main className="admin-disease-details-page">
        <div className="admin-disease-details-message">
          Loading disease information...
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error || !disease) {
    return (
      <main className="admin-disease-details-page">
        <div className="admin-disease-details-error">
          <h2>Unable to open disease</h2>

          <p>{error || "Disease record not found."}</p>

          <button type="button" onClick={fetchDisease}>
            Try Again
          </button>

          <Link to="/admin/diseases">
            Back to Diseases
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // STATUS AND SOURCE INFORMATION
  // ==========================================

  const reviewStatus = disease.review_status || "pending";

  const formattedStatus =
    reviewStatus.charAt(0).toUpperCase() +
    reviewStatus.slice(1);

  const sources = disease.disease_sources || [];

  const symptoms = disease.disease_symptoms || [];

  const specializations = disease.disease_specializations || [];

  const primarySourceIsValid = (() => {
    try {
      const parsed = new URL(disease.source_url?.trim() || "");

      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  })();

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="admin-disease-details-page">
      <div className="admin-disease-details-container">

        {/* BACK LINK */}

        <Link
          to="/admin/diseases"
          className="admin-disease-back-link"
        >
          ← Back to Diseases
        </Link>

        {/* PENDING WARNING */}

        {reviewStatus === "pending" && (
          <div className="admin-disease-pending-warning">
            <strong>Pending medical review</strong>

            <p>
              Review the disease information and supporting
              references before verifying this record.
            </p>
          </div>
        )}

        {/* HEADER */}

        <header className="admin-disease-details-header">
          <div>
            <span className="admin-disease-eyebrow">
              DISEASE MANAGEMENT
            </span>

            <h1>{disease.name}</h1>

            <p className="admin-disease-slug">
              {disease.slug}
            </p>

            <span
              className={`admin-disease-status ${reviewStatus}`}
            >
              {formattedStatus}
            </span>
          </div>

          <div className="admin-disease-detail-actions">

            {reviewStatus === "pending" && (
              <>
                <button
                  type="button"
                  className="admin-disease-verify-button"
                  onClick={() => handleReviewAction("verified")}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Please wait..." : "Verify Disease"}
                </button>

                <button
                  type="button"
                  className="admin-disease-reject-button"
                  onClick={() => handleReviewAction("rejected")}
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </>
            )}

            <button
              type="button"
              className="admin-disease-delete-button"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "Please wait..." : "Delete"}
            </button>

          </div>
        </header>

        {/* DISEASE INFORMATION */}

        <div className="admin-disease-detail-grid">

          {/* BASIC INFORMATION */}

          <section className="admin-disease-detail-card">
            <h2>Basic Information</h2>

            <div className="admin-disease-detail-fields">
              <div>
                <span>Disease name</span>
                <strong>{disease.name || "Not provided"}</strong>
              </div>

              <div>
                <span>Slug</span>
                <strong>{disease.slug || "Not provided"}</strong>
              </div>

              <div>
                <span>Review status</span>
                <strong>{formattedStatus}</strong>
              </div>

              <div>
                <span>Last reviewed</span>
                <strong>{formatDate(disease.last_reviewed_at)}</strong>
              </div>
            </div>

            <DetailSection
              title="Description"
              value={disease.description}
            />

            <DetailSection
              title="Overview"
              value={disease.overview}
            />
          </section>

          {/* MEDICAL INFORMATION */}

          <section className="admin-disease-detail-card">
            <h2>Medical Information</h2>

            <DetailSection
              title="Causes"
              value={disease.causes}
            />

            <DetailSection
              title="Risk Factors"
              value={disease.risk_factors}
            />

            <DetailSection
              title="Symptoms"
              value={symptoms
                .map(item => item.symptoms?.name)
                .filter(Boolean)}
            />

            <DetailSection
              title="Complications"
              value={disease.complications}
            />

            <DetailSection
              title="Prevention"
              value={disease.prevention}
            />

            <DetailSection
              title="Diagnosis"
              value={disease.diagnosis}
            />

            <DetailSection
              title="When to Seek Medical Help"
              value={disease.when_to_seek_help}
            />
          </section>

          {/* RELATED SPECIALIZATIONS */}

          <section className="admin-disease-detail-card">
            <h2>Related Medical Specializations</h2>

            {specializations.length > 0 ? (
              <ul className="admin-disease-related-list">
                {specializations.map((item) => (
                  <li key={item.id}>
                    <strong>
                      {item.specializations?.name || "Unnamed specialization"}
                    </strong>

                    {item.notes && <p>{item.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-disease-not-available">
                No specializations linked yet.
              </p>
            )}
          </section>

          {/* SOURCE AND REVIEW INFORMATION */}

          <section className="admin-disease-detail-card admin-disease-source-card">
            <h2>Medical Sources and References</h2>

            <div className="admin-disease-detail-fields">
              <div>
                <span>Primary source</span>
                <strong>{disease.source_name || "Not provided"}</strong>
              </div>

              <div>
                <span>Primary source URL</span>

                {primarySourceIsValid ? (
                  <a
                    href={disease.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open primary source ↗
                  </a>
                ) : (
                  <strong>Valid source URL not provided</strong>
                )}
              </div>

              <div>
                <span>Created</span>
                <strong>
                  {formatDate(disease.created_at)}
                </strong>
              </div>

              <div>
                <span>Last updated</span>
                <strong>
                  {formatDate(disease.updated_at)}
                </strong>
              </div>
            </div>

            <h3>Additional References ({sources.length})</h3>

            {sources.length > 0 ? (
              <div className="admin-disease-source-list">
                {sources.map((source) => (
                  <article key={source.id}>
                    <strong>{source.source_title || source.source_name}</strong>

                    <span>
                      {source.source_type} · {source.source_name}
                    </span>

                    <p>
                      Published: {formatDate(source.source_published_on)}
                    </p>

                    <p>
                      Checked: {formatDate(source.source_checked_on)}
                    </p>

                    {source.evidence_note && (
                      <p>{source.evidence_note}</p>
                    )}

                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open reference ↗
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-disease-not-available">
                No additional references have been added.
              </p>
            )}

            <p className="admin-disease-review-note">
              Verify disease information only after checking
              reliable medical references and reviewing its
              accuracy and relevance to the intended users.
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}

export default AdminDiseaseDetails;
