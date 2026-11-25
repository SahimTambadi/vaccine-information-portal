
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  ShieldCheck,
  Stethoscope,
  Pill,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./TreatmentDetails.css";

function formatDate(value) {
  if (!value) return "Not available";

  const date = value.length === 10
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatType(value) {
  if (!value) return "Other";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getSafeUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}

function TreatmentDetails() {
  const { id } = useParams();

  const [treatment, setTreatment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTreatmentDetails();
  }, [id]);

  const fetchTreatmentDetails = async () => {
    if (!id || !/^\d+$/.test(id)) {
      setError("Invalid treatment information.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setTreatment(null);
    setMedicines([]);

    const { data, error: fetchError } = await supabase
      .from("disease_treatments")
      .select(`
        id,
        disease_id,
        treatment_name,
        treatment_type,
        description,
        benefits,
        precautions,
        source_name,
        source_title,
        source_url,
        source_published_on,
        source_checked_on,
        evidence_note,
        last_reviewed_at,
        review_status,
        is_published,
        diseases (
          id,
          name,
          slug,
          review_status
        )
      `)
      .eq("id", id)
      .eq("review_status", "verified")
      .eq("is_published", true)
      .maybeSingle();

    if (fetchError) {
      setError("Unable to load treatment information. Please try again.");
      setLoading(false);
      return;
    }

    if (
      !data ||
      data.diseases?.review_status !== "verified"
    ) {
      setError("This treatment is not currently available.");
      setLoading(false);
      return;
    }

    setTreatment(data);

    const { data: medicineLinks, error: medicineError } = await supabase
      .from("treatment_medicines")
      .select(`
        id,
        usage_notes,
        medicines (
          id,
          name,
          generic_name,
          review_status,
          is_published
        )
      `)
      .eq("treatment_id", id);

    if (!medicineError && medicineLinks) {
      const verifiedMedicines = medicineLinks.filter(
        (item) =>
          item.medicines?.review_status === "verified" &&
          item.medicines?.is_published === true
      );

      setMedicines(verifiedMedicines);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="treatment-details-state">
        <RefreshCw className="treatment-details-spinner" size={30} />
        <p>Loading treatment information...</p>
      </div>
    );
  }

  if (error || !treatment) {
    return (
      <div className="treatment-details-state">
        <div className="treatment-details-state-icon">
          <AlertCircle size={30} />
        </div>

        <h2>Information Unavailable</h2>
        <p>{error || "This treatment could not be found."}</p>

        <Link to="/treatments" className="treatment-back-button">
          <ArrowLeft size={17} />
          Back to Treatments
        </Link>
      </div>
    );
  }

  const sourceUrl = getSafeUrl(treatment.source_url);

  return (
    <div className="treatment-details-page">
      <div className="treatment-details-top">
        <div className="treatment-details-top-inner">
          <Link to="/treatments" className="treatment-details-back">
            <ArrowLeft size={17} />
            Back to Treatments
          </Link>

          <div className="treatment-details-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/treatments">Treatments</Link>
            <span>/</span>
            <span>Details</span>
          </div>
        </div>
      </div>

      <main className="treatment-details-container">
        <section className="treatment-details-hero">
          <div className="treatment-details-icon">
            <Activity size={29} />
          </div>

          <div className="treatment-details-heading">
            <div className="treatment-details-badges">
              <span className="treatment-type-badge">
                {formatType(treatment.treatment_type)}
              </span>

              <span className="treatment-verified-badge">
                <CheckCircle2 size={14} />
                Verified Information
              </span>
            </div>

            <h1>{treatment.treatment_name}</h1>

            <p className="treatment-related-disease">
              <Stethoscope size={17} />
              Related condition:{" "}
              <Link
                to={`/diseases/${treatment.diseases.slug || treatment.diseases.id}`}
              >
                {treatment.diseases.name}
              </Link>
            </p>
          </div>
        </section>

        <div className="treatment-details-layout">
          <div className="treatment-details-main">
            <section className="treatment-info-card">
              <div className="treatment-info-heading">
                <FileText size={20} />
                <h2>About This Treatment</h2>
              </div>

              <p className="treatment-main-description">
                {treatment.description || "No description is available."}
              </p>
            </section>

            {treatment.benefits && (
              <section className="treatment-info-card">
                <div className="treatment-info-heading">
                  <CheckCircle2 size={20} />
                  <h2>Benefits and Purpose</h2>
                </div>

                <p>{treatment.benefits}</p>
              </section>
            )}

            {treatment.precautions && (
              <section className="treatment-info-card treatment-precautions-card">
                <div className="treatment-info-heading">
                  <AlertCircle size={20} />
                  <h2>Precautions</h2>
                </div>

                <p>{treatment.precautions}</p>
              </section>
            )}

            {medicines.length > 0 && (
              <section className="treatment-info-card">
                <div className="treatment-info-heading">
                  <Pill size={20} />
                  <h2>Associated Medicines</h2>
                </div>

                <p className="treatment-medicines-intro">
                  The following medicines are linked to this treatment
                  in the reviewed catalogue. This is not a prescription
                  or a recommendation to use them.
                </p>

                <div className="treatment-medicines-list">
                  {medicines.map((item) => (
                    <div
                      className="treatment-medicine-item"
                      key={item.id}
                    >
                      <div className="treatment-medicine-icon">
                        <Pill size={19} />
                      </div>

                      <div>
                        <strong>{item.medicines.name}</strong>

                        {item.medicines.generic_name && (
                          <span>
                            Generic name: {item.medicines.generic_name}
                          </span>
                        )}

                        {item.usage_notes && (
                          <p>{item.usage_notes}</p>
                        )}

                        <Link
                          to={`/medicines/${item.medicines.id}`}
                          className="treatment-medicine-link"
                        >
                          View medicine information
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="treatment-details-sidebar">
            <section className="treatment-source-card">
              <div className="treatment-sidebar-heading">
                <ShieldCheck size={20} />
                <h2>Review Information</h2>
              </div>

              <div className="treatment-source-row">
                <span>Review status</span>
                <strong className="treatment-status-verified">
                  <CheckCircle2 size={14} />
                  Verified
                </strong>
              </div>

              <div className="treatment-source-row">
                <span>Last reviewed</span>
                <strong>{formatDate(treatment.last_reviewed_at)}</strong>
              </div>

              <div className="treatment-source-row">
                <span>Source checked</span>
                <strong>{formatDate(treatment.source_checked_on)}</strong>
              </div>
            </section>

            <section className="treatment-source-card">
              <div className="treatment-sidebar-heading">
                <FileText size={20} />
                <h2>Medical Reference</h2>
              </div>

              <div className="treatment-reference-content">
                <span>Source organization</span>
                <strong>{treatment.source_name}</strong>

                {treatment.source_title && (
                  <>
                    <span>Reference title</span>
                    <strong>{treatment.source_title}</strong>
                  </>
                )}

                {treatment.source_published_on && (
                  <>
                    <span>Publication date</span>
                    <strong>
                      {formatDate(treatment.source_published_on)}
                    </strong>
                  </>
                )}

                {treatment.evidence_note && (
                  <>
                    <span>Evidence note</span>
                    <p>{treatment.evidence_note}</p>
                  </>
                )}

                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="treatment-source-link"
                  >
                    Open Original Reference
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </section>

            <section className="treatment-reviewed-note">
              <CalendarDays size={20} />

              <div>
                <strong>Reviewed Content</strong>
                <p>
                  This information has been reviewed before publication.
                  Always consult a qualified healthcare professional for
                  individual medical decisions.
                </p>
              </div>
            </section>
          </aside>
        </div>

        <section className="treatment-details-disclaimer">
          <AlertCircle size={21} />

          <div>
            <strong>Important Medical Disclaimer</strong>
            <p>
              This page provides general educational information and
              does not replace professional medical advice, diagnosis
              or treatment. Treatment suitability depends on individual
              clinical circumstances. Do not start, stop or change
              medication without consulting a qualified healthcare
              professional.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default TreatmentDetails;
