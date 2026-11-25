
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Pill,
  Info,
  ExternalLink,
  CalendarDays,
  FlaskConical,
  AlertTriangle,
  ClipboardList,
  Activity,
  Thermometer,
  BookOpen,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "./MedicineDetails.css";

// ==========================================
// FORMAT DATABASE VALUES
// ==========================================

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : null;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);

    return entries.length
      ? entries.map(([key, item]) => `${key}: ${item}`).join("\n")
      : null;
  }

  return String(value);
}

// ==========================================
// REUSABLE INFORMATION CARD
// ==========================================

function MedicineSection({ title, value, description, icon: Icon }) {
  const formatted = formatValue(value);

  if (!formatted) return null;

  return (
    <article className="medicine-detail-section">
      <div className="medicine-detail-section-heading">
        <div className="medicine-detail-section-icon">
          <Icon size={19} />
        </div>

        <h3>{title}</h3>
      </div>

      {description && (
        <p className="medicine-detail-section-description">
          {description}
        </p>
      )}

      <p className="medicine-detail-information">
        {formatted}
      </p>
    </article>
  );
}

// ==========================================
// SECTION GROUP
// ==========================================

function MedicineGroup({ title, subtitle, icon: Icon, sections }) {
  const availableSections = sections.filter(
    (section) => formatValue(section.value)
  );

  if (availableSections.length === 0) return null;

  return (
    <section className="medicine-detail-group">
      <div className="medicine-detail-group-heading">
        <div className="medicine-detail-group-icon">
          <Icon size={21} />
        </div>

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="medicine-detail-content">
        {availableSections.map((section) => (
          <MedicineSection
            key={section.title}
            title={section.title}
            value={section.value}
            description={section.description}
            icon={section.icon}
          />
        ))}
      </div>
    </section>
  );
}

// ==========================================
// MEDICINE DETAILS PAGE
// ==========================================

function MedicineDetails() {
  const { id } = useParams();

  const [medicine, setMedicine] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH MEDICINE
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    async function fetchMedicine() {
      setLoading(true);
      setError("");
      setMedicine(null);
      setStatus("");

      try {
        // FIRST: CHECK PUBLIC CATALOGUE STATUS
        const {
          data: catalogue,
          error: catalogueError,
        } = await supabase
          .from("medicine_public_catalog")
          .select("id, name, review_status")
          .eq("id", id)
          .maybeSingle();

        if (catalogueError) throw catalogueError;

        if (!catalogue) {
          if (isMounted) {
            setError("This medicine could not be found.");
          }
          return;
        }

        if (!isMounted) return;

        // PENDING OR REJECTED: SHOW STATUS ONLY
        if (catalogue.review_status !== "verified") {
          setStatus(catalogue.review_status);
          setMedicine({
            id: catalogue.id,
            name: catalogue.name,
          });
          return;
        }

        // VERIFIED: FETCH FULL MEDICINE INFORMATION
        const {
          data,
          error: fetchError,
        } = await supabase
          .from("medicines")
          .select("*")
          .eq("id", id)
          .eq("review_status", "verified")
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!isMounted) return;

        if (!data) {
          setError(
            "Verified medicine information is currently unavailable."
          );
          return;
        }

        setMedicine(data);
        setStatus("verified");
      } catch (err) {
        console.error("Medicine fetch error:", err);

        if (isMounted) {
          setError(
            "Unable to load medicine information. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchMedicine();
    } else {
      setError("Invalid medicine.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <main className="app medicine-detail-page">
        <div className="medicine-detail-state">
          <div className="medicine-detail-loader" />
          <h2>Loading medicine information</h2>
          <p>Please wait while we retrieve the available details.</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error || !medicine) {
    return (
      <main className="app medicine-detail-page">
        <div className="medicine-detail-state">
          <div className="medicine-detail-state-icon">
            <Info size={25} />
          </div>

          <h2>Medicine details unavailable</h2>
          <p>{error || "Medicine information could not be found."}</p>

          <Link to="/medicines" className="medicine-detail-primary-link">
            <ArrowLeft size={17} />
            Back to Medicines
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // PENDING OR REJECTED STATE
  // ==========================================

  if (status !== "verified") {
    const rejected = status === "rejected";

    return (
      <main className="app medicine-detail-page">
        <div className="medicine-detail-state">
          <div
            className={`medicine-detail-state-icon ${
              rejected ? "medicine-state-rejected" : ""
            }`}
          >
            <AlertTriangle size={25} />
          </div>

          <span
            className={`medicine-unverified-label ${
              rejected ? "medicine-label-rejected" : ""
            }`}
          >
            {rejected ? "Not Approved" : "Verification Pending"}
          </span>

          <h2>{medicine.name}</h2>

          <p>
            {rejected
              ? "This medicine has not been approved by the VaxCare administration team. Its medical details are not available for public viewing."
              : "This medicine is still awaiting verification by the VaxCare administration team. Its medical details will become available only after approval."}
          </p>

          <Link to="/medicines" className="medicine-detail-primary-link">
            <ArrowLeft size={17} />
            Back to Medicines
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // MEDICINE INFORMATION GROUPS
  // ==========================================

  const medicineGroups = [
    {
      title: "Medicine Overview",
      subtitle:
        "Understand what the medicine is, its documented purpose and its ingredients.",
      icon: BookOpen,
      sections: [
        {
          title: "Uses",
          value: medicine.uses,
          description:
            "The conditions or symptoms this medicine is documented to be used for.",
          icon: Info,
        },
        {
          title: "When to Use",
          value: medicine.when_to_use,
          description:
            "The circumstances in which this medicine may be recommended, according to the verified information.",
          icon: Activity,
        },
        {
          title: "How It Works",
          value: medicine.how_it_works,
          description:
            "An explanation of how the medicine produces its intended effect in the body.",
          icon: FlaskConical,
        },
        {
          title: "Active Ingredients",
          value: medicine.active_ingredients,
          description:
            "The active substances responsible for the medicine's intended action.",
          icon: FlaskConical,
        },
        {
          title: "Brand Names",
          value: medicine.brand_names,
          description:
            "Brand names associated with the medicine, where provided.",
          icon: Pill,
        },
        {
          title: "Available Forms",
          value: medicine.available_forms,
          description:
            "The available forms of the medicine, such as tablets, capsules or liquids, where documented.",
          icon: Pill,
        },
      ],
    },
    {
      title: "Usage Information",
      subtitle:
        "Review documented instructions and important information about using the medicine.",
      icon: ClipboardList,
      sections: [
        {
          title: "Dosage Information",
          value: medicine.dosage_information,
          description:
            "Dosage information recorded for this medicine. The appropriate dose depends on individual medical advice.",
          icon: ClipboardList,
        },
        {
          title: "How to Take",
          value: medicine.how_to_take,
          description:
            "Documented instructions for taking or administering this medicine.",
          icon: Pill,
        },
        {
          title: "Prescription Required",
          value: medicine.prescription_required,
          description:
            "Whether the medicine is marked as requiring a prescription.",
          icon: ShieldCheck,
        },
        {
          title: "Missed Dose",
          value: medicine.missed_dose,
          description:
            "Verified information about a missed dose, where available.",
          icon: Info,
        },
      ],
    },
    {
      title: "Safety Information",
      subtitle:
        "Understand possible risks, precautions and situations that may require medical attention.",
      icon: AlertTriangle,
      sections: [
        {
          title: "Side Effects",
          value: medicine.side_effects,
          description:
            "Unwanted effects that may occur with this medicine. Their likelihood and seriousness can vary.",
          icon: AlertTriangle,
        },
        {
          title: "When to Seek Medical Help",
          value: medicine.when_to_seek_medical_help,
          description:
            "Documented warning signs or situations for which medical attention is recommended.",
          icon: Activity,
        },
        {
          title: "Precautions",
          value: medicine.precautions,
          description:
            "Safety measures and considerations to review before using the medicine.",
          icon: ShieldCheck,
        },
        {
          title: "Contraindications",
          value: medicine.contraindications,
          description:
            "Conditions or circumstances in which the medicine should not be used, according to its information.",
          icon: AlertTriangle,
        },
        {
          title: "Medicine Interactions",
          value: medicine.drug_interactions,
          description:
            "Documented interactions with other medicines or substances.",
          icon: FlaskConical,
        },
        {
          title: "Overdose Information",
          value: medicine.overdose_information,
          description:
            "Verified information about taking more than the recommended amount and what action is advised.",
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: "Storage and Special Considerations",
      subtitle:
        "Review storage requirements and additional considerations when this information is available.",
      icon: Thermometer,
      sections: [
        {
          title: "Storage Information",
          value: medicine.storage_information,
          description:
            "How the medicine should be stored according to its documented storage instructions.",
          icon: Thermometer,
        },
        {
          title: "Pregnancy and Breastfeeding",
          value: medicine.pregnancy_breastfeeding,
          description:
            "Available safety information relating to pregnancy and breastfeeding.",
          icon: Info,
        },
        {
          title: "Additional Information",
          value: medicine.additional_information,
          description:
            "Other relevant information included in the verified medicine record.",
          icon: BookOpen,
        },
      ],
    },
  ];

  // ==========================================
  // VERIFIED MEDICINE DETAILS
  // ==========================================

  return (
    <main className="app medicine-detail-page">
      <div className="medicine-detail-container">

        {/* BACK NAVIGATION */}

        <Link to="/medicines" className="medicine-detail-back-link">
          <ArrowLeft size={17} />
          Back to Medicines
        </Link>

        {/* MEDICINE HERO */}

        <header className="medicine-detail-hero">
          <div className="medicine-detail-hero-content">
            <span className="medicine-verified-label">
              <ShieldCheck size={16} />
              Verified Medicine
            </span>

            <span className="medicine-detail-eyebrow">
              VAXCARE MEDICINE INFORMATION
            </span>

            <h1>{medicine.name}</h1>

            {medicine.generic_name && (
              <p className="medicine-detail-generic">
                Generic name: {medicine.generic_name}
              </p>
            )}

            {medicine.category && (
              <span className="medicine-detail-category">
                {medicine.category}
              </span>
            )}
          </div>

          <div className="medicine-detail-hero-visual">
            <div className="medicine-detail-visual-orbit" />

            <div className="medicine-detail-visual-card">
              <span className="medicine-detail-visual-plus">+</span>

              <div className="medicine-detail-visual-capsule">
                <span />
                <span />
              </div>

              <Pill className="medicine-detail-visual-icon" size={39} />

              <span className="medicine-detail-visual-caption">
                MEDICINE PROFILE
              </span>
            </div>
          </div>
        </header>

        {/* INTRODUCTION */}

        <div className="medicine-detail-notice">
          <div className="medicine-detail-notice-icon">
            <Info size={19} />
          </div>

          <div>
            <strong>Understanding your medicine</strong>
            <p>
              Explore the available information about this medicine,
              including its uses, usage information, possible side
              effects and safety considerations. Information is
              displayed only when it is available in the medicine record.
            </p>
          </div>
        </div>

        {/* MEDICINE INFORMATION GROUPS */}

        <div className="medicine-detail-main">
          {medicineGroups.map((group) => (
            <MedicineGroup
              key={group.title}
              title={group.title}
              subtitle={group.subtitle}
              icon={group.icon}
              sections={group.sections}
            />
          ))}
        </div>

        {/* VERIFICATION AND SOURCE INFORMATION */}

        <section className="medicine-detail-trust-section">
          <div className="medicine-detail-trust-heading">
            <ShieldCheck size={22} />
            <div>
              <h2>Verification and Sources</h2>
              <p>Review the available record and its source information.</p>
            </div>
          </div>

          <div className="medicine-detail-trust-grid">
            <div className="medicine-detail-trust-card">
              <span className="medicine-detail-trust-label">
                Verification Status
              </span>

              <span className="medicine-sidebar-verified">
                <span />
                Verified
              </span>

              <p>
                This medicine is marked as verified in the VaxCare
                medicine record.
              </p>
            </div>

            {(medicine.source_name || medicine.source_url) && (
              <div className="medicine-detail-trust-card">
                <span className="medicine-detail-trust-label">
                  Information Source
                </span>

                {medicine.source_name && (
                  <strong className="medicine-source-name">
                    {medicine.source_name}
                  </strong>
                )}

                {medicine.source_url && (
                  <a
                    href={medicine.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="medicine-source-link"
                  >
                    View Original Source
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            )}

            {medicine.last_reviewed_at && (
              <div className="medicine-detail-trust-card">
                <span className="medicine-detail-trust-label">
                  Last Reviewed
                </span>

                <strong className="medicine-reviewed-date">
                  <CalendarDays size={16} />
                  {new Date(
                    medicine.last_reviewed_at
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>

                <p>
                  Date recorded for the latest review.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* MEDICAL DISCLAIMER */}

        <div className="medicine-detail-disclaimer">
          <div className="medicine-detail-disclaimer-icon">
            <Info size={19} />
          </div>

          <div>
            <strong>Important Medical Disclaimer</strong>

            <p>
              This information is provided for educational purposes
              only. It is not a substitute for professional medical
              advice, diagnosis or treatment. Always consult a
              qualified doctor or pharmacist regarding medicines,
              their uses, dosage, precautions and possible side effects.
              Do not start, stop or change medication based only on
              information on this website. In an emergency, seek
              immediate medical attention.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default MedicineDetails;
