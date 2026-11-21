
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function AdminVaccineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
const [deleting, setDeleting] = useState(false);
const [deleteError, setDeleteError] = useState("");

  const [vaccine, setVaccine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchVaccine() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("vaccines")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setVaccine(data);
      setLoading(false);
    }

    fetchVaccine();
  }, [id]);

  const details = vaccine?.details || {};

  // Supports both ordinary URLs and Markdown-style links.
  function getSourceUrl(url) {
    if (!url) return "";

    const markdownMatch = url.match(/\]\((https?:\/\/[^)]+)\)/);
    return markdownMatch ? markdownMatch[1] : url;
  }

  function DetailList({ items }) {
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="admin-muted">No information provided.</p>;
    }

    return (
      <ul className="admin-detail-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  function DetailSection({ title, children }) {
    return (
      <section className="admin-info-card">
        <h3>{title}</h3>
        {children}
      </section>
    );
  }
async function handleDelete() {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${vaccine.name}? This action cannot be undone.`
  );

  if (!confirmed) return;

  setDeleting(true);
  setDeleteError("");

  const { error } = await supabase
    .from("vaccines")
    .delete()
    .eq("id", id);

  if (error) {
    setDeleteError(error.message);
    setDeleting(false);
    return;
  }

  navigate("/admin/vaccines", {
    replace: true,
    state: {
      message: "Vaccine deleted successfully.",
    },
  });
}
  if (loading) {
    return (
      <main className="app admin-vaccine-page">
        <p>Loading vaccine details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app admin-vaccine-page">
        <p className="auth-error">{error}</p>
        <Link to="/admin/vaccines" className="details-button">
          Back to Vaccines
        </Link>
      </main>
    );
  }

  if (!vaccine) return null;

  return (
    <main className="app admin-vaccine-page">

      {/* HERO */}

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">VAXCARE ADMINISTRATION</p>

          <h1>
            Vaccine <span>Details.</span>
          </h1>

          <p className="hero-description">
            View the complete vaccine information and manage its content.
          </p>

          <Link to="/admin/vaccines" className="hero-button">
            ← Back to Vaccines
          </Link>
        </div>

        <div className="hero-visual">
          <div className="medical-circle">
            {vaccine.icon || "💉"}
          </div>
        </div>
      </section>

      {/* BASIC INFORMATION */}

      <section className="admin-form-section">

        <div className="admin-form-heading">
          <p className="eyebrow">VACCINE INFORMATION</p>
          <h2>{vaccine.name}</h2>
          <p>Vaccine ID: {vaccine.id}</p>
        </div>

        <div className="admin-detail-content">

          <div className="admin-detail-row">
            <strong>Vaccine Name</strong>
            <p>{vaccine.name || "Not provided"}</p>
          </div>

          <div className="admin-detail-row">
            <strong>Full Name</strong>
            <p>{vaccine.full_name || "Not provided"}</p>
          </div>

          <div className="admin-detail-row">
            <strong>Category</strong>
            <p>{vaccine.category || "Not provided"}</p>
          </div>

          <div className="admin-detail-row">
            <strong>Recommended Age</strong>
            <p>{vaccine.age || "Not provided"}</p>
          </div>

          <div className="admin-detail-row full-width">
            <strong>Purpose</strong>
            <p>{vaccine.purpose || "Not provided"}</p>
          </div>

          <div className="admin-detail-row">
            <strong>Icon</strong>
            <p>{vaccine.icon || "💉"}</p>
          </div>

        </div>
      </section>

    {/* EDIT AND DELETE ACTIONS */}

<section className="admin-form-section">

  {deleteError && (
    <p className="auth-error">{deleteError}</p>
  )}

  <div className="admin-detail-actions">

    <Link
      to={`/admin/vaccines/${vaccine.id}/edit`}
      className="admin-action-button admin-edit-button"
    >
      ✏️ Edit Vaccine
    </Link>

    <button
      type="button"
      className="admin-action-button admin-delete-button"
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? "Deleting..." : "🗑️ Delete Vaccine"}
    </button>

  </div>

</section>

      {/* PROTECTION */}

      {details.protection && (
        <DetailSection title="🛡️ Protection Information">

          <h4>Diseases Protected Against</h4>
          <DetailList items={details.protection.diseases} />

          <h4>How It Works</h4>
          <p>{details.protection.howItWorks || "Not provided."}</p>

          <h4>Limitations</h4>
          <p>{details.protection.limitations || "Not provided."} </p>

        </DetailSection>
      )}

      {/* INDIA GUIDANCE */}

      {details.indiaGuidance && (
        <DetailSection title="🇮🇳 India's Vaccination Schedule">

          <div className="admin-info-highlight">
            <strong>Status</strong>
            <p>{details.indiaGuidance.status || "Not provided"}</p>
          </div>

          <h4>National Programme</h4>
          <p>{details.indiaGuidance.program || "Not provided"}</p>

          <h4>Eligibility</h4>
          <p>{details.indiaGuidance.eligibility || "Not provided"}</p>

          <h4>Schedule</h4>

          {Array.isArray(details.indiaGuidance.schedule) &&
            details.indiaGuidance.schedule.map((item, index) => (
              <div className="admin-schedule-item" key={index}>
                <strong>{item.age || "Age not specified"}</strong>
                <p>Dose: {item.dose || "Not specified"}</p>
                <p>{item.note || ""}</p>
              </div>
            ))}

          {details.indiaGuidance.administration && (
            <>
              <h4>Administration</h4>
              <div className="admin-detail-content">
                <div className="admin-detail-row">
                  <strong>Route</strong>
                  <p>
                    {details.indiaGuidance.administration.route || "Not provided"}
                  </p>
                </div>

                <div className="admin-detail-row">
                  <strong>Site</strong>
                  <p>
                    {details.indiaGuidance.administration.site || "Not provided"}
                  </p>
                </div>
              </div>
            </>
          )}

        </DetailSection>
      )}

      {/* WHO GUIDANCE */}

      {details.whoGuidance && (
        <DetailSection title="🌍 WHO Guidance">

          <h4>Recommendation</h4>
          <p>{details.whoGuidance.recommendation || "Not provided"}</p>

          <h4>Target Groups</h4>
          <DetailList items={details.whoGuidance.targetGroups} />

          <h4>Special Considerations</h4>
          <DetailList items={details.whoGuidance.specialConsiderations} />

        </DetailSection>
      )}

      {/* SAFETY */}

      {details.safety && (
        <DetailSection title="⚕️ Safety Information">

          <h4>Common Side Effects</h4>
          <DetailList items={details.safety.commonSideEffects} />

          <h4>Precautions</h4>
          <DetailList items={details.safety.precautions} />

          <h4>When to Seek Medical Attention</h4>
          <div className="admin-info-highlight">
            <p>
              {details.safety.seekMedicalAttention || "Not provided"}
            </p>
          </div>

        </DetailSection>
      )}

      {/* STORAGE */}

      {details.storage && (
        <DetailSection title="❄️ Storage Information">
          <p>
            {details.storage.information || "No storage information provided."}
          </p>
        </DetailSection>
      )}

      {/* FAQS */}

      {Array.isArray(details.faqs) && details.faqs.length > 0 && (
        <DetailSection title="❓ Frequently Asked Questions">

          <div className="admin-faq-list">
            {details.faqs.map((faq, index) => (
              <div className="admin-faq-item" key={index}>
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>

        </DetailSection>
      )}

      {/* SOURCES */}

      {Array.isArray(details.sources) && details.sources.length > 0 && (
        <DetailSection title="📚 Reference Sources">

          <div className="admin-source-list">
            {details.sources.map((source, index) => {
              const url = getSourceUrl(source.url);

              return (
                <div className="admin-source-item" key={index}>
                  <h4>{source.title || "Reference document"}</h4>

                  <p>
                    {source.organization || "Organization not specified"}
                  </p>

                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Official Source →
                    </a>
                  )}
                </div>
              );
            })}
          </div>

        </DetailSection>
      )}

    </main>
  );
}

export default AdminVaccineDetails;
