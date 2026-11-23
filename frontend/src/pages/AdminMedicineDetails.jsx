
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

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

  const handlePublication = async () => {
    if (!medicine || actionLoading) return;

    const nextStatus = !medicine.is_published;

    if (nextStatus) {
      if (!medicine.name?.trim()) {
        alert("A medicine name is required before publishing.");
        return;
      }

      if (!medicine.source_name?.trim()) {
        alert("Add a verified source name before publishing.");
        return;
      }

      if (!medicine.source_url?.trim()) {
        alert("Add a source URL before publishing.");
        return;
      }

      let parsedUrl;

      try {
        parsedUrl = new URL(medicine.source_url.trim());
      } catch {
        alert("Enter a valid source URL.");
        return;
      }

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        alert("The source URL must use HTTP or HTTPS.");
        return;
      }

      if (!medicine.last_reviewed_at) {
        alert("Add the date the medical information was last reviewed.");
        return;
      }

      const confirmed = window.confirm(
        "Publish this medicine record? Make sure its medical information has been checked against the cited source."
      );

      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        "Unpublish this medicine? It will no longer appear in the public medicines directory."
      );

      if (!confirmed) return;
    }

    setActionLoading(true);

    const { data, error: updateError } = await supabase
      .from("medicines")
      .update({
        is_published: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", medicine.id)
      .select()
      .single();

    if (updateError) {
      console.error("Publication update error:", updateError);
      alert(updateError.message || "Unable to update publication status.");
    } else {
      setMedicine(data);
    }

    setActionLoading(false);
  };

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

  if (loading) {
    return (
      <main className="admin-medicine-details-page">
        <div className="admin-medicine-details-message">
          Loading medicine information...
        </div>
      </main>
    );
  }

  if (error || !medicine) {
    return (
      <main className="admin-medicine-details-page">
        <div className="admin-medicine-details-error">
          <h2>Unable to open medicine</h2>
          <p>{error || "Medicine record not found."}</p>

          <button type="button" onClick={fetchMedicine}>
            Try again
          </button>

          <Link to="/admin/medicines">Back to Medicines</Link>
        </div>
      </main>
    );
  }

  const sourceUrlIsValid = (() => {
    try {
      const parsed = new URL(medicine.source_url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  })();

  return (
    <main className="admin-medicine-details-page">
      <div className="admin-medicine-details-container">
        <Link to="/admin/medicines" className="admin-medicine-back-link">
          ← Back to Medicines
        </Link>

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
              className={`admin-medicine-status ${
                medicine.is_published ? "published" : "unpublished"
              }`}
            >
              {medicine.is_published ? "Published" : "Unpublished"}
            </span>
          </div>

          <div className="admin-medicine-detail-actions">
            <Link
              to={`/admin/medicines/${medicine.id}/edit`}
              className="admin-medicine-edit-button"
            >
              Edit Medicine
            </Link>

            <button
              type="button"
              className="admin-medicine-publish-button"
              onClick={handlePublication}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Please wait..."
                : medicine.is_published
                  ? "Unpublish"
                  : "Publish"}
            </button>

            <button
              type="button"
              className="admin-medicine-delete-button"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              Delete
            </button>
          </div>
        </header>

        <div className="admin-medicine-detail-grid">
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
                  {medicine.prescription_required
                    ? "Marked as prescription required"
                    : "Not marked as prescription required"}
                </strong>
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

          <section className="admin-medicine-detail-card">
            <h2>Medical Information</h2>

            <DetailSection title="Uses" value={medicine.uses} />
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

          <section className="admin-medicine-detail-card admin-medicine-source-card">
            <h2>Medical Source and Review</h2>

            <div className="admin-medicine-detail-fields">
              <div>
                <span>Source name</span>
                <strong>{medicine.source_name || "Not provided"}</strong>
              </div>

              <div>
                <span>Last reviewed</span>
                <strong>{formatDate(medicine.last_reviewed_at)}</strong>
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
                <strong>{formatDate(medicine.created_at?.slice(0, 10))}</strong>
              </div>

              <div>
                <span>Last updated</span>
                <strong>{formatDate(medicine.updated_at?.slice(0, 10))}</strong>
              </div>
            </div>

            <p className="admin-medicine-review-note">
              Publication should only happen after the medicine information
              has been checked against a reliable medical source. A source URL
              being present does not itself verify the accuracy of the content.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AdminMedicineDetails;
