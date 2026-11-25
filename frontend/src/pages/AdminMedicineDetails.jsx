
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminMedicineDetails.css";

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatList(value) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => {
      if (typeof item === "string") {
        return <li key={`${item}-${index}`}>{item}</li>;
      }

      return (
        <li key={index}>
          {item?.name || item?.ingredient || JSON.stringify(item)}
        </li>
      );
    });
  }

  return <li>{String(value)}</li>;
}

function DetailSection({ title, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  return (
    <section className="admin-medicine-detail-section">
      <h3>{title}</h3>

      {Array.isArray(value) ? (
        <ul>{formatList(value)}</ul>
      ) : (
        <p>{String(value)}</p>
      )}
    </section>
  );
}

function AdminMedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // FETCH MEDICINE
  const fetchMedicine = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("medicines")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Medicine fetch error:", fetchError);

      setError(
        fetchError.code === "PGRST116"
          ? "Medicine record was not found."
          : fetchError.message || "Unable to load this medicine."
      );

      setMedicine(null);
    } else {
      setMedicine(data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchMedicine();
  }, [fetchMedicine]);

  // VERIFY OR REJECT A PENDING MEDICINE
  const handleReviewAction = async (nextStatus) => {
    if (!medicine || actionLoading) return;

    if (medicine.review_status !== "pending") {
      alert("Only pending medicine records can be reviewed.");
      return;
    }

    if (!["verified", "rejected"].includes(nextStatus)) {
      return;
    }

    if (nextStatus === "verified") {
      const confirmed = window.confirm(
        `Verify "${medicine.name}"?\n\nPlease confirm that you have reviewed the medicine information and checked its medical references. Only approve information that is accurate and supported by trustworthy sources.`
      );

      if (!confirmed) return;
    }

    if (nextStatus === "rejected") {
      const confirmed = window.confirm(
        `Reject "${medicine.name}"? This record will not appear in the public medicine directory.`
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
      .from("medicines")
      .update(updateValues)
      .eq("id", medicine.id)
      .eq("review_status", "pending")
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Medicine review error:", updateError);

      alert(
        updateError.message || "Unable to update medicine review status."
      );
    } else if (!data) {
      alert(
        "This medicine record has already been reviewed or changed. Refreshing the latest record."
      );

      await fetchMedicine();
    } else {
      setMedicine(data);

      alert(
        nextStatus === "verified"
          ? "Medicine record verified successfully."
          : "Medicine record rejected successfully."
      );
    }

    setActionLoading(false);
  };

  // DELETE MEDICINE
  const handleDelete = async () => {
    if (!medicine || actionLoading) return;

    const confirmed = window.confirm(
      `Permanently delete "${medicine.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading(true);

    const { error: deleteError } = await supabase
      .from("medicines")
      .delete()
      .eq("id", medicine.id);

    if (deleteError) {
      console.error("Medicine delete error:", deleteError);

      alert(deleteError.message || "Unable to delete this medicine.");

      setActionLoading(false);
      return;
    }

    alert("Medicine record deleted successfully.");

    navigate("/admin/medicines", { replace: true });
  };

  // LOADING STATE
  if (loading) {
    return (
      <main className="admin-medicine-details-page">
        <div className="admin-medicine-details-message">
          Loading medicine information...
        </div>
      </main>
    );
  }

  // ERROR STATE
  if (error || !medicine) {
    return (
      <main className="admin-medicine-details-page">
        <div className="admin-medicine-details-error">
          <h2>Unable to open medicine</h2>
          <p>{error || "Medicine record not found."}</p>

          <button type="button" onClick={fetchMedicine}>
            Try again
          </button>

          <Link to="/admin/medicines">
            Back to Medicines
          </Link>
        </div>
      </main>
    );
  }

  // MEDICINE STATUS
  const reviewStatus = medicine.review_status || "pending";

  const formattedStatus =
    reviewStatus.charAt(0).toUpperCase() + reviewStatus.slice(1);

  // SOURCE URL VALIDATION
  const sourceUrlIsValid = (() => {
    try {
      const parsed = new URL(medicine.source_url?.trim() || "");

      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  })();

  const dataOrigin =
    medicine.data_origin === "imported"
      ? "Imported"
      : medicine.data_origin === "manual"
        ? "Manual"
        : "Not specified";

  return (
    <main className="admin-medicine-details-page">
      <div className="admin-medicine-details-container">

        {/* BACK LINK */}
        <Link
          to="/admin/medicines"
          className="admin-medicine-back-link"
        >
          ← Back to Medicines
        </Link>

        {/* PENDING REVIEW WARNING */}
        {reviewStatus === "pending" && (
          <div className="admin-medicine-pending-warning">
            <strong>Pending clinical review</strong>

            <p>
              Review the medicine information and its medical references
              before verifying this record. You can edit the information
              whenever necessary.
            </p>
          </div>
        )}

        {/* HEADER */}
        <header className="admin-medicine-details-header">
          <div>
            <span className="admin-medicine-eyebrow">
              MEDICINE MANAGEMENT
            </span>

            <h1>{medicine.name}</h1>

            {medicine.generic_name && (
              <p className="admin-medicine-generic">
                Generic name: {medicine.generic_name}
              </p>
            )}

            <span
              className={`admin-medicine-status ${reviewStatus}`}
            >
              {formattedStatus}
            </span>
          </div>

          <div className="admin-medicine-detail-actions">
            <Link
              to={`/admin/medicines/${medicine.id}/edit`}
              className="admin-medicine-edit-button"
            >
              Edit Medicine
            </Link>

            {reviewStatus === "pending" && (
              <>
                <button
                  type="button"
                  className="admin-medicine-publish-button"
                  onClick={() => handleReviewAction("verified")}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Please wait..." : "Verify"}
                </button>

                <button
                  type="button"
                  className="admin-medicine-edit-button"
                  onClick={() => handleReviewAction("rejected")}
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </>
            )}

            <button
              type="button"
              className="admin-medicine-delete-button"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "Please wait..." : "Delete"}
            </button>
          </div>
        </header>

        {/* MEDICINE DETAILS */}
        <div className="admin-medicine-detail-grid">

          {/* BASIC INFORMATION */}
          <section className="admin-medicine-detail-card">
            <h2>Basic Information</h2>

            <div className="admin-medicine-detail-fields">
              <div>
                <span>Medicine name</span>
                <strong>{medicine.name || "Not provided"}</strong>
              </div>

              <div>
                <span>Generic name</span>
                <strong>{medicine.generic_name || "Not provided"}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{medicine.category || "Not provided"}</strong>
              </div>

              <div>
                <span>Prescription information</span>
                <strong>
                  {medicine.prescription_required === null
                    ? "Not provided"
                    : medicine.prescription_required
                      ? "Marked as prescription required"
                      : "Not marked as prescription required"}
                </strong>
              </div>

              <div>
                <span>Data origin</span>
                <strong>{dataOrigin}</strong>
              </div>
            </div>

            <DetailSection
              title="Brand names"
              value={medicine.brand_names}
            />

            <DetailSection
              title="Active ingredients"
              value={medicine.active_ingredients}
            />

            <DetailSection
              title="Available forms"
              value={medicine.available_forms}
            />
          </section>

          {/* MEDICAL INFORMATION */}
          <section className="admin-medicine-detail-card">
            <h2>Medical Information</h2>

            <DetailSection
              title="Uses"
              value={medicine.uses}
            />

            <DetailSection
              title="Precautions"
              value={medicine.precautions}
            />

            <DetailSection
              title="Contraindications"
              value={medicine.contraindications}
            />

            <DetailSection
              title="Possible side effects"
              value={medicine.side_effects}
            />

            <DetailSection
              title="Storage information"
              value={medicine.storage_information}
            />

            <DetailSection
              title="Additional information"
              value={medicine.additional_information}
            />
          </section>

          {/* SOURCE AND REVIEW INFORMATION */}
          <section className="admin-medicine-detail-card admin-medicine-source-card">
            <h2>Medical Source and Review</h2>

            <div className="admin-medicine-detail-fields">
              <div>
                <span>Review status</span>
                <strong>{formattedStatus}</strong>
              </div>

              <div>
                <span>Data origin</span>
                <strong>{dataOrigin}</strong>
              </div>

              <div>
                <span>Source name</span>
                <strong>{medicine.source_name || "Not provided"}</strong>
              </div>

              <div>
                <span>Source record ID</span>
                <strong>
                  {medicine.source_record_id || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Last reviewed</span>
                <strong>
                  {formatDate(medicine.last_reviewed_at)}
                </strong>
              </div>

              <div>
                <span>Last synchronized</span>
                <strong>
                  {formatDate(medicine.last_synced_at?.slice(0, 10))}
                </strong>
              </div>

              <div>
                <span>Source URL</span>

                {sourceUrlIsValid ? (
                  <a
                    href={medicine.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open cited source ↗
                  </a>
                ) : (
                  <strong>Valid source URL not provided</strong>
                )}
              </div>

              <div>
                <span>Created</span>
                <strong>
                  {formatDate(medicine.created_at?.slice(0, 10))}
                </strong>
              </div>

              <div>
                <span>Last updated</span>
                <strong>
                  {formatDate(medicine.updated_at?.slice(0, 10))}
                </strong>
              </div>
            </div>

            <p className="admin-medicine-review-note">
              Verify a medicine only after reviewing its clinical
              information and checking trustworthy medical references.
              Missing information can be added using Edit Medicine.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AdminMedicineDetails;
