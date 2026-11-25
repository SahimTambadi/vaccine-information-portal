
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Pill,
  FileText,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./AdminTreatmentDetails.css";

function AdminTreatmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [treatment, setTreatment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchTreatment = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: treatmentError } = await supabase
      .from("disease_treatments")
      .select(`
        *,
        diseases (
          id,
          name,
          slug,
          review_status
        )
      `)
      .eq("id", id)
      .single();

    if (treatmentError) {
      setError(treatmentError.message);
      setTreatment(null);
      setMedicines([]);
      setLoading(false);
      return;
    }

    setTreatment(data);

    const { data: medicineLinks, error: medicineError } =
      await supabase
        .from("treatment_medicines")
        .select(`
          id,
          usage_notes,
          medicines (
            id,
            name,
            generic_name,
            category,
            review_status
          )
        `)
        .eq("treatment_id", id);

    if (medicineError) {
      setError(medicineError.message);
    } else {
      setMedicines(medicineLinks || []);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchTreatment();
  }, [fetchTreatment]);

  const updateTreatment = async (updates, successMessage) => {
    if (!treatment || actionLoading) return;

    setActionLoading(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("disease_treatments")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", treatment.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(successMessage);
      await fetchTreatment();
    }

    setActionLoading(false);
  };

  const handleVerify = () => {
    if (!window.confirm("Verify this treatment after reviewing its evidence?")) {
      return;
    }

    updateTreatment(
      {
        review_status: "verified",
        last_reviewed_at: new Date().toISOString().slice(0, 10),
        is_published: false,
      },
      "Treatment verified. It is still unpublished."
    );
  };

  const handleReject = () => {
    if (!window.confirm("Reject this treatment record?")) return;

    updateTreatment(
      {
        review_status: "rejected",
        is_published: false,
      },
      "Treatment rejected successfully."
    );
  };

  const handlePublish = () => {
    if (treatment?.review_status !== "verified") {
      setError("Only verified treatments can be published.");
      return;
    }

    if (!window.confirm("Publish this verified treatment publicly?")) return;

    updateTreatment(
      { is_published: true },
      "Treatment published successfully."
    );
  };

  const handleUnpublish = () => {
    if (!window.confirm("Unpublish this treatment?")) return;

    updateTreatment(
      { is_published: false },
      "Treatment unpublished successfully."
    );
  };

  const handleDelete = async () => {
    if (!window.confirm(
      "Permanently delete this treatment and its medicine associations?"
    )) {
      return;
    }

    setActionLoading(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("disease_treatments")
      .delete()
      .eq("id", treatment.id);

    if (deleteError) {
      setError(deleteError.message);
      setActionLoading(false);
      return;
    }

    navigate("/admin/treatments");
  };

  const formatDate = (value) => {
    if (!value) return "Not provided";

    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatType = (value) => {
    if (!value) return "Not specified";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="admin-treatment-details-page">
        <div className="admin-treatment-details-loading">
          Loading treatment details...
        </div>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="admin-treatment-details-page">
        <div className="admin-treatment-details-error">
          <h2>Treatment not found</h2>
          <p>{error || "This treatment could not be found."}</p>
          <Link to="/admin/treatments">Back to Treatments</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-treatment-details-page">
      <div className="admin-treatment-details-container">

        <Link
          to="/admin/treatments"
          className="admin-treatment-details-back"
        >
          <ArrowLeft size={18} />
          Back to Treatments
        </Link>

        <div className="admin-treatment-details-header">
          <div>
            <span className="admin-treatment-details-eyebrow">
              TREATMENT REVIEW
            </span>
            <h1>{treatment.treatment_name}</h1>
            <p>
              Review medical evidence and manage publication status.
            </p>
          </div>

          <span className={`admin-treatment-details-status ${treatment.review_status}`}>
            {treatment.review_status}
          </span>
        </div>

        {error && (
          <div className="admin-treatment-details-alert error">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-treatment-details-alert success">
            {message}
          </div>
        )}

        <div className="admin-treatment-details-layout">

          <main className="admin-treatment-details-main">

            <section className="admin-treatment-details-card">
              <h2>Basic Information</h2>

              <div className="admin-treatment-details-info-grid">
                <div>
                  <span>Treatment Name</span>
                  <strong>{treatment.treatment_name}</strong>
                </div>

                <div>
                  <span>Treatment Category</span>
                  <strong>{formatType(treatment.treatment_type)}</strong>
                </div>

                <div>
                  <span>Related Disease</span>
                  <strong>
                    {treatment.diseases?.name || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Publication</span>
                  <strong>
                    {treatment.is_published ? "Published" : "Unpublished"}
                  </strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>{formatDate(treatment.created_at)}</strong>
                </div>

                <div>
                  <span>Last Reviewed</span>
                  <strong>{formatDate(treatment.last_reviewed_at)}</strong>
                </div>
              </div>
            </section>

            <section className="admin-treatment-details-card">
              <h2>Treatment Description</h2>
              <p>{treatment.description || "No description provided."}</p>

              <h3>Potential Benefits</h3>
              <p>{treatment.benefits || "Not provided."}</p>

              <h3>Precautions and Considerations</h3>
              <p>{treatment.precautions || "Not provided."}</p>
            </section>

            <section className="admin-treatment-details-card">
              <div className="admin-treatment-details-section-heading">
                <Pill size={21} />
                <h2>Associated Medicines</h2>
              </div>

              {medicines.length === 0 ? (
                <p>No medicines associated with this treatment.</p>
              ) : (
                <div className="admin-treatment-details-medicines">
                  {medicines.map((item) => (
                    <div key={item.id} className="admin-treatment-medicine">
                      <div>
                        <strong>
                          {item.medicines?.name || "Medicine unavailable"}
                        </strong>
                        <span>
                          {item.medicines?.generic_name || "Generic name not provided"}
                        </span>
                        <span>
                          Status: {item.medicines?.review_status || "Unknown"}
                        </span>
                        {item.usage_notes && (
                          <p>{item.usage_notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-treatment-details-card">
              <div className="admin-treatment-details-section-heading">
                <FileText size={21} />
                <h2>Medical Evidence</h2>
              </div>

              <div className="admin-treatment-details-source">
                <span>Source Organization</span>
                <strong>{treatment.source_name}</strong>
              </div>

              <div className="admin-treatment-details-source">
                <span>Reference Title</span>
                <strong>{treatment.source_title || "Not provided"}</strong>
              </div>

              <div className="admin-treatment-details-source">
                <span>Source URL</span>
                <a
                  href={treatment.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open medical reference
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="admin-treatment-details-source">
                <span>Publication Date</span>
                <strong>{formatDate(treatment.source_published_on)}</strong>
              </div>

              <div className="admin-treatment-details-source">
                <span>Last Source Check</span>
                <strong>{formatDate(treatment.source_checked_on)}</strong>
              </div>

              <h3>Evidence Notes</h3>
              <p>{treatment.evidence_note || "No evidence notes provided."}</p>
            </section>

          </main>

          <aside className="admin-treatment-details-sidebar">

            <section className="admin-treatment-details-card">
              <div className="admin-treatment-details-section-heading">
                <ShieldCheck size={21} />
                <h2>Review Actions</h2>
              </div>

              <p className="admin-treatment-details-sidebar-description">
                Review the source and clinical content before making
                a publication decision.
              </p>

              {treatment.review_status === "pending" && (
                <>
                  <button
                    className="admin-treatment-action verify"
                    onClick={handleVerify}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={17} />
                    Verify Treatment
                  </button>

                  <button
                    className="admin-treatment-action reject"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    <XCircle size={17} />
                    Reject Treatment
                  </button>
                </>
              )}

              {treatment.review_status === "verified" && (
                <>
                  {!treatment.is_published ? (
                    <button
                      className="admin-treatment-action publish"
                      onClick={handlePublish}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={17} />
                      Publish Treatment
                    </button>
                  ) : (
                    <button
                      className="admin-treatment-action unpublish"
                      onClick={handleUnpublish}
                      disabled={actionLoading}
                    >
                      Unpublish Treatment
                    </button>
                  )}

                  <button
                    className="admin-treatment-action reject"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    <XCircle size={17} />
                    Reject Treatment
                  </button>
                </>
              )}

              {treatment.review_status === "rejected" && (
                <p className="admin-treatment-details-rejected-note">
                  This treatment has been rejected and is not publicly
                  available. Review its content before changing its status.
                </p>
              )}

              <button
                className="admin-treatment-action refresh"
                onClick={fetchTreatment}
                disabled={actionLoading}
              >
                <RefreshCw size={16} />
                Refresh Details
              </button>

              <button
                className="admin-treatment-action delete"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                <Trash2 size={16} />
                Delete Treatment
              </button>

              {actionLoading && (
                <p className="admin-treatment-details-processing">
                  Processing...
                </p>
              )}
            </section>

          </aside>

        </div>
      </div>
    </div>
  );
}

export default AdminTreatmentDetails;
