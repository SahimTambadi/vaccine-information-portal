
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminVaccineImport.css";

const MOHFW_SOURCE =
  "https://www.mohfw.gov.in/sites/default/files/Universal%20Immunization%20Programme.pdf";

const SOURCE_NAME =
  "Ministry of Health and Family Welfare (MoHFW)";

const VACCINES = [
  {
    id: "IN-UIP-BCG",
    name: "BCG",
    full_name: "Bacillus Calmette–Guérin Vaccine",
    icon: "🛡️",
    purpose: "Protects against severe forms of childhood tuberculosis.",
    age: "At birth, or as early as possible according to the National Immunization Schedule.",
    groups: ["Birth", "Infants"],
    schedule: "At birth",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-HEPB",
    name: "Hepatitis B",
    full_name: "Hepatitis B Birth Dose Vaccine",
    icon: "💉",
    purpose: "Helps prevent hepatitis B virus infection.",
    age: "Birth dose, preferably within 24 hours of birth.",
    groups: ["Birth", "Infants"],
    schedule: "At birth",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-OPV",
    name: "OPV",
    full_name: "Oral Polio Vaccine",
    icon: "💧",
    purpose: "Helps protect against poliomyelitis.",
    age: "Birth dose, primary doses at 6, 10 and 14 weeks, and booster at 16–24 months.",
    groups: ["Birth", "Infants", "Children"],
    schedule: "Birth, 6, 10 and 14 weeks; booster at 16–24 months",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-PENTA",
    name: "Pentavalent",
    full_name: "Pentavalent Vaccine",
    icon: "🧬",
    purpose:
      "Protects against diphtheria, pertussis, tetanus, hepatitis B and Haemophilus influenzae type b disease.",
    age: "Three primary doses at 6, 10 and 14 weeks.",
    groups: ["Infants"],
    schedule: "6, 10 and 14 weeks",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-RVV",
    name: "Rotavirus",
    full_name: "Rotavirus Vaccine",
    icon: "💧",
    purpose: "Helps protect infants against rotavirus-associated diarrhoeal disease.",
    age: "Three doses at 6, 10 and 14 weeks under the National Immunization Schedule.",
    groups: ["Infants"],
    schedule: "6, 10 and 14 weeks",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-FIPV",
    name: "fIPV",
    full_name: "Fractional Inactivated Polio Vaccine",
    icon: "🛡️",
    purpose: "Provides protection against poliomyelitis.",
    age: "Fractional doses at 6 and 14 weeks under the listed schedule.",
    groups: ["Infants"],
    schedule: "6 and 14 weeks",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-PCV",
    name: "PCV",
    full_name: "Pneumococcal Conjugate Vaccine",
    icon: "🧬",
    purpose: "Helps protect against pneumococcal disease.",
    age: "Primary doses at 6 and 14 weeks, with a booster at 9–12 months.",
    groups: ["Infants"],
    schedule: "6 and 14 weeks; booster at 9–12 months",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-MR",
    name: "MR",
    full_name: "Measles and Rubella Vaccine",
    icon: "🛡️",
    purpose: "Helps protect against measles and rubella.",
    age: "First dose at 9–12 months and second dose at 16–24 months.",
    groups: ["Infants", "Children"],
    schedule: "9–12 months and 16–24 months",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-JE",
    name: "JE",
    full_name: "Japanese Encephalitis Vaccine",
    icon: "🧬",
    purpose: "Helps protect against Japanese encephalitis.",
    age: "First and second doses at 9–12 months and 16–24 months, where applicable in JE-endemic districts.",
    groups: ["Infants", "Children"],
    schedule: "9–12 months and 16–24 months; endemic districts only",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-DPT",
    name: "DPT Booster",
    full_name: "Diphtheria, Pertussis and Tetanus Booster Vaccine",
    icon: "💉",
    purpose: "Boosts protection against diphtheria, pertussis and tetanus.",
    age: "First booster at 16–24 months and second booster at 5–6 years.",
    groups: ["Children"],
    schedule: "16–24 months and 5–6 years",
    category: "National Immunization Programme",
  },
  {
    id: "IN-UIP-TD",
    name: "Td",
    full_name: "Tetanus and Adult Diphtheria Vaccine",
    icon: "🛡️",
    purpose: "Helps protect against tetanus and diphtheria.",
    age: "Routine doses at 10 and 16 years; Td doses during pregnancy as specified by the schedule.",
    groups: ["Adolescents", "Pregnancy"],
    schedule: "10 years, 16 years and pregnancy",
    category: "National Immunization Programme",
  },
];

const FILTERS = [
  "All",
  "Birth",
  "Infants",
  "Children",
  "Adolescents",
  "Pregnancy",
];

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function AdminVaccineImport() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [existingNames, setExistingNames] = useState(new Set());
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingId, setLoadingId] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadExistingVaccines() {
      setInitialLoading(true);

      const { data, error } = await supabase
        .from("vaccines")
        .select("name");

      if (!active) return;

      if (error) {
        setFeedback({
          type: "error",
          message:
            "Could not check existing vaccine records. You can still try importing; duplicate checking will run again before saving.",
        });
      } else {
        setExistingNames(
          new Set(
            (data || []).map((item) => normalizeName(item.name))
          )
        );
      }

      setInitialLoading(false);
    }

    loadExistingVaccines();

    return () => {
      active = false;
    };
  }, []);

  const filteredVaccines = useMemo(() => {
    const query = search.trim().toLowerCase();

    return VACCINES.filter((vaccine) => {
      const matchesSearch =
        !query ||
        vaccine.name.toLowerCase().includes(query) ||
        vaccine.full_name.toLowerCase().includes(query) ||
        vaccine.purpose.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All" ||
        vaccine.groups.includes(activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const importedCount = VACCINES.filter((vaccine) =>
    existingNames.has(normalizeName(vaccine.name))
  ).length;

  async function handleVaccineImport(vaccine) {
    setFeedback(null);
    setLoadingId(vaccine.id);

    try {
      const { data: existingRecords, error: checkError } =
        await supabase
          .from("vaccines")
          .select("id, name, source_record_id");

      if (checkError) throw checkError;

      const alreadyExists = (existingRecords || []).some(
        (item) =>
          normalizeName(item.name) === normalizeName(vaccine.name) ||
          String(item.source_record_id || "").trim() === vaccine.id
      );

      if (alreadyExists) {
        setExistingNames((current) => {
          const updated = new Set(current);
          updated.add(normalizeName(vaccine.name));
          return updated;
        });

        setFeedback({
          type: "info",
          message: `${vaccine.name} already exists in the VaxCare vaccine directory. No duplicate was added.`,
        });

        return;
      }

      const payload = {
        name: vaccine.name,
        full_name: vaccine.full_name,
        category: vaccine.category,
        purpose: vaccine.purpose,
        age: vaccine.age,
        icon: vaccine.icon,
        details: {
          schedule: vaccine.schedule,
          beneficiary_groups: vaccine.groups,
          programme: "India Universal Immunization Programme",
          source_note:
            "Prepared from the published MoHFW National Immunization Schedule. Verify current applicability and source guidance before publication.",
        },
        source_name: SOURCE_NAME,
        source_url: MOHFW_SOURCE,
        source_record_id: vaccine.id,
        data_origin: "imported",
        review_status: "pending",
        last_synced_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("vaccines")
        .insert(payload);

      if (insertError) throw insertError;

      setExistingNames((current) => {
        const updated = new Set(current);
        updated.add(normalizeName(vaccine.name));
        return updated;
      });

      setFeedback({
        type: "success",
        message: `${vaccine.name} has been added successfully. It is now pending administrator review.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.message || `Unable to import ${vaccine.name}. Please try again.`,
      });
    } finally {
      setLoadingId("");
    }
  }

  return (
    <main className="app vax-import-page">
      <header className="vax-import-header">
        <div className="vax-import-breadcrumb">
          <Link to="/admin">Administration</Link>
          <span>/</span>
          <Link to="/admin/vaccines">Vaccine Management</Link>
          <span>/</span>
          <span>Vaccine Catalogue</span>
        </div>

        <div className="vax-import-header-content">
          <div>
            <p className="vax-import-eyebrow">
              VAXCARE ADMINISTRATION
            </p>

            <h1>
              Vaccine <span>Import Centre</span>
            </h1>

            <p className="vax-import-description">
              Browse India's National Immunization Programme catalogue
              and add vaccine records to VaxCare with one click.
            </p>
          </div>

          <Link
            to="/admin/vaccines"
            className="vax-import-back-button"
          >
            ← Vaccine Management
          </Link>
        </div>
      </header>

      <section className="vax-import-summary">
        <div className="vax-import-summary-item">
          <span className="vax-import-summary-icon">💉</span>
          <div>
            <strong>{VACCINES.length}</strong>
            <span>Catalogue vaccines</span>
          </div>
        </div>

        <div className="vax-import-summary-item">
          <span className="vax-import-summary-icon">✓</span>
          <div>
            <strong>{importedCount}</strong>
            <span>Already in directory</span>
          </div>
        </div>

        <div className="vax-import-summary-item">
          <span className="vax-import-summary-icon">＋</span>
          <div>
            <strong>{VACCINES.length - importedCount}</strong>
            <span>Available to import</span>
          </div>
        </div>
      </section>

      {/* WHO VACCINE PRODUCTS REVIEW ENTRY */}

      <section className="who-import-entry">
        <div className="who-import-entry-icon">
          🌍
        </div>

        <div className="who-import-entry-content">
          <span className="who-import-entry-label">
            INTERNATIONAL PRODUCT DATABASE
          </span>

          <h2>WHO Vaccine Products</h2>

          <p>
            Browse and review imported WHO vaccine product records.
            Check manufacturers, brands, prequalification details
            and original sources before verification.
          </p>
        </div>

        <Link
          to="/admin/vaccines/who-products"
          className="who-import-entry-button"
        >
          Open WHO Review Centre →
        </Link>
      </section>

      <section className="vax-import-catalogue">
        <div className="vax-import-catalogue-heading">
          <div>
            <p className="vax-import-eyebrow">
              OFFICIAL PROGRAMME CATALOGUE
            </p>
            <h2>National Immunization Schedule</h2>
            <p>
              Select a vaccine to add its source-attributed record
              to the VaxCare database.
            </p>
          </div>

          <a
            href={MOHFW_SOURCE}
            target="_blank"
            rel="noreferrer"
            className="vax-import-source-link"
          >
            View MoHFW source ↗
          </a>
        </div>

        <div className="vax-import-toolbar">
          <div className="vax-import-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search by vaccine name or purpose..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search vaccines"
            />
          </div>

          <div className="vax-import-filters" aria-label="Filter by age group">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  activeFilter === filter ? "active" : ""
                }
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <div
            className={`vax-import-feedback ${feedback.type}`}
            role="status"
          >
            <span>
              {feedback.type === "success"
                ? "✓"
                : feedback.type === "error"
                  ? "!"
                  : "i"}
            </span>
            <p>{feedback.message}</p>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {initialLoading && (
          <div className="vax-import-loading">
            Checking existing vaccine records...
          </div>
        )}

        {!initialLoading && filteredVaccines.length === 0 && (
          <div className="vax-import-empty">
            <span>⌕</span>
            <h3>No vaccines found</h3>
            <p>Try another search term or age-group filter.</p>
          </div>
        )}

        <div className="vax-import-vaccine-grid">
          {filteredVaccines.map((vaccine) => {
            const isImported = existingNames.has(
              normalizeName(vaccine.name)
            );
            const isLoading = loadingId === vaccine.id;

            return (
              <article
                className="vax-import-vaccine-card"
                key={vaccine.id}
              >
                <div className="vax-import-vaccine-top">
                  <div className="vax-import-vaccine-icon">
                    {vaccine.icon}
                  </div>

                  {isImported ? (
                    <span className="vax-import-status imported">
                      Already added
                    </span>
                  ) : (
                    <span className="vax-import-status available">
                      Available
                    </span>
                  )}
                </div>

                <h3>{vaccine.name}</h3>
                <p className="vax-import-vaccine-full-name">
                  {vaccine.full_name}
                </p>

                <p className="vax-import-vaccine-purpose">
                  {vaccine.purpose}
                </p>

                <div className="vax-import-vaccine-schedule">
                  <span>RECOMMENDED SCHEDULE</span>
                  <p>{vaccine.schedule}</p>
                </div>

                {vaccine.groups.includes("Pregnancy") && (
                  <p className="vax-import-special-note">
                    Includes pregnancy schedule
                  </p>
                )}

                {vaccine.name === "JE" && (
                  <p className="vax-import-special-note">
                    Applicable in JE-endemic districts
                  </p>
                )}

                <button
                  type="button"
                  className={
                    isImported
                      ? "vax-import-card-button imported"
                      : "vax-import-card-button"
                  }
                  onClick={() => handleVaccineImport(vaccine)}
                  disabled={isImported || Boolean(loadingId)}
                >
                  {isLoading
                    ? "Importing..."
                    : isImported
                      ? "✓ Added to directory"
                      : "Import vaccine →"}
                </button>
              </article>
            );
          })}
        </div>

        <div className="vax-import-source-note">
          <span>ⓘ</span>
          <p>
            Catalogue information is based on the cited MoHFW
            National Immunization Schedule. Imported records are
            saved as pending and must be reviewed before publication.
            Programme applicability can vary, including for JE.
          </p>
        </div>
      </section>

      <section className="vax-import-bottom">
        <div>
          <h3>Looking for another vaccine?</h3>
          <p>
            You can add a vaccine that is not in this catalogue
            through the manual vaccine management workflow.
          </p>
        </div>

        <Link to="/admin/vaccines/new">
          Add vaccine manually →
        </Link>
      </section>
    </main>
  );
}

export default AdminVaccineImport;
