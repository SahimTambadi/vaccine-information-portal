
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Download,
  Search,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import "./AdminTreatmentImport.css";

const SOURCE_URL =
  "https://ncvbdc.mohfw.gov.in/Doc/National%20Guidelines%20for%20Clinical%20Management%20of%20Dengue%20Fever%202023.pdf";

const SOURCE_NAME =
  "National Center for Vector Borne Diseases Control (NCVBDC), Ministry of Health and Family Welfare, Government of India";

const SOURCE_TITLE =
  "National Guidelines for Clinical Management of Dengue Fever 2023";

// These candidates are based on the official 2023 Indian national guideline.
// They contain no dosage instructions and require administrator review.
const TREATMENT_CATALOGUE = [
  {
    name: "Supportive and symptomatic management",
    diseaseName: "Dengue",
    category: "General supportive care",
    treatment_type: "therapy",
    description:
      "The national guideline describes dengue management as primarily symptomatic and supportive because there is no specific antiviral treatment. Care and monitoring depend on the patient's clinical condition.",
    benefits:
      "Supports appropriate clinical management and monitoring of dengue cases.",
    precautions:
      "Management must be guided by a qualified healthcare professional. Patients require assessment for warning signs and progression to severe dengue.",
    evidence_note:
      "National Guidelines for Clinical Management of Dengue Fever 2023. Refer to the introduction and Chapter 7, Management of Dengue Fever.",
  },
  {
    name: "Oral fluid intake and hydration support",
    diseaseName: "Dengue",
    category: "General supportive care",
    treatment_type: "therapy",
    description:
      "The guideline advises adequate oral fluid intake, including oral rehydration solution and other suitable fluids, for patients who can tolerate oral intake.",
    benefits:
      "Supports hydration as part of the supportive management of dengue.",
    precautions:
      "Fluid intake must be appropriate to the patient's condition. Warning signs, persistent vomiting, reduced oral intake or deterioration require prompt medical assessment. Avoid excessive fluid intake.",
    evidence_note:
      "National Guidelines for Clinical Management of Dengue Fever 2023. Chapter 7, outpatient advice and supportive management.",
  },
  {
    name: "Paracetamol for fever management",
    diseaseName: "Dengue",
    category: "Fever management",
    treatment_type: "medication",
    description:
      "The national guideline identifies paracetamol as an option for fever management in dengue when clinically indicated.",
    benefits:
      "Helps manage fever as part of symptomatic care.",
    precautions:
      "Use only under appropriate medical guidance. The guideline advises avoiding aspirin and non-steroidal anti-inflammatory drugs (NSAIDs) in dengue. No dosage is supplied in this catalogue entry.",
    evidence_note:
      "National Guidelines for Clinical Management of Dengue Fever 2023. Chapter 7, outpatient management and fever advice.",
  },
  {
    name: "Intravenous fluid therapy for indicated cases",
    diseaseName: "Dengue",
    category: "Hospital-based management",
    treatment_type: "procedure",
    description:
      "The guideline describes intravenous fluid therapy for selected patients with warning signs, poor oral intake or evidence of plasma leakage. Fluid management is adjusted according to clinical assessment and monitoring.",
    benefits:
      "Supports circulation and management of fluid loss in appropriately selected patients.",
    precautions:
      "This is a hospital-based clinical intervention. Fluid type, volume and rate require professional assessment and close monitoring. Excess fluid can cause fluid overload.",
    evidence_note:
      "National Guidelines for Clinical Management of Dengue Fever 2023. Chapter 7, management of moderate and severe dengue.",
  },
];

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function makeCandidateId(item) {
  return `${normalizeName(item.diseaseName)}-${normalizeName(item.name)}`
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeRecordKey(diseaseId, treatmentName) {
  return `${diseaseId}-${normalizeName(treatmentName)}`;
}

function AdminTreatmentImport() {
  const [diseases, setDiseases] = useState([]);
  const [existingRecords, setExistingRecords] = useState(new Set());
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingId, setLoadingId] = useState("");
  const [importingAll, setImportingAll] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function loadImportData() {
    setInitialLoading(true);
    setFeedback(null);

    try {
      const [diseaseResult, treatmentResult] = await Promise.all([
        supabase
          .from("diseases")
          .select("id, name, review_status")
          .eq("review_status", "verified")
          .order("name"),

        supabase
          .from("disease_treatments")
          .select("id, disease_id, treatment_name"),
      ]);

      if (diseaseResult.error) throw diseaseResult.error;
      if (treatmentResult.error) throw treatmentResult.error;

      setDiseases(diseaseResult.data || []);

      const existing = new Set();

      (treatmentResult.data || []).forEach((item) => {
        existing.add(
          makeRecordKey(item.disease_id, item.treatment_name)
        );
      });

      setExistingRecords(existing);
    } catch (error) {
      console.error("Treatment import data error:", error);
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Unable to load verified diseases and existing treatments.",
      });
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    loadImportData();
  }, []);

  const catalogue = useMemo(() => {
    return TREATMENT_CATALOGUE.map((item) => {
      const disease = diseases.find(
        (entry) =>
          normalizeName(entry.name) === normalizeName(item.diseaseName)
      );

      return {
        ...item,
        disease,
        candidateId: makeCandidateId(item),
      };
    });
  }, [diseases]);

  const availableCatalogue = catalogue.filter(
    (item) => item.disease?.id
  );

  const filters = [
    "All",
    ...new Set(TREATMENT_CATALOGUE.map((item) => item.category)),
  ];

  const isImported = (item) => {
    if (!item.disease?.id) return false;

    return existingRecords.has(
      makeRecordKey(item.disease.id, item.name)
    );
  };

  const importedCount = availableCatalogue.filter(isImported).length;
  const availableCount = availableCatalogue.length - importedCount;

  const filteredTreatments = availableCatalogue.filter((item) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.diseaseName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    const matchesFilter =
      activeFilter === "All" || item.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  async function refreshExistingRecords() {
    const { data, error } = await supabase
      .from("disease_treatments")
      .select("id, disease_id, treatment_name");

    if (error) throw error;

    const existing = new Set();

    (data || []).forEach((item) => {
      existing.add(
        makeRecordKey(item.disease_id, item.treatment_name)
      );
    });

    setExistingRecords(existing);
    return existing;
  }

  function buildPayload(item) {
    return {
      disease_id: item.disease.id,
      treatment_name: item.name,
      treatment_type: item.treatment_type,
      description: item.description,
      benefits: item.benefits,
      precautions: item.precautions,
      source_name: SOURCE_NAME,
      source_title: SOURCE_TITLE,
      source_url: SOURCE_URL,
      source_checked_on: new Date().toISOString().slice(0, 10),
      evidence_note: item.evidence_note,
      review_status: "pending",
      is_published: false,
    };
  }

  async function handleImport(item) {
    setFeedback(null);
    setLoadingId(item.candidateId);

    try {
      if (!item.disease?.id) {
        throw new Error(
          `No verified disease record was found for ${item.diseaseName}.`
        );
      }

      const existing = await refreshExistingRecords();
      const recordKey = makeRecordKey(item.disease.id, item.name);

      if (existing.has(recordKey)) {
        setFeedback({
          type: "info",
          message: `${item.name} is already in the treatment catalogue for ${item.diseaseName}.`,
        });
        return;
      }

      const { error } = await supabase
        .from("disease_treatments")
        .insert(buildPayload(item));

      if (error) throw error;

      setExistingRecords((current) => {
        const updated = new Set(current);
        updated.add(recordKey);
        return updated;
      });

      setFeedback({
        type: "success",
        message: `${item.name} imported successfully as pending review. It is not publicly published.`,
      });
    } catch (error) {
      console.error("Treatment import error:", error);
      setFeedback({
        type: "error",
        message: error.message || `Unable to import ${item.name}.`,
      });
    } finally {
      setLoadingId("");
    }
  }

  async function handleImportAll() {
    setFeedback(null);
    setImportingAll(true);

    try {
      const existing = await refreshExistingRecords();

      const itemsToImport = availableCatalogue.filter((item) => {
        if (!item.disease?.id) return false;

        return !existing.has(
          makeRecordKey(item.disease.id, item.name)
        );
      });

      if (itemsToImport.length === 0) {
        setFeedback({
          type: "info",
          message: "All available treatment candidates have already been imported.",
        });
        return;
      }

      const payload = itemsToImport.map(buildPayload);

      const { error } = await supabase
        .from("disease_treatments")
        .insert(payload);

      if (error) throw error;

      await refreshExistingRecords();

      setFeedback({
        type: "success",
        message: `${itemsToImport.length} treatment records imported. All are pending administrator review and remain unpublished.`,
      });
    } catch (error) {
      console.error("Bulk treatment import error:", error);
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Treatment catalogue import failed. Please check the database and try again.",
      });
    } finally {
      setImportingAll(false);
    }
  }

  return (
    <main className="app treatment-import-page">
      <header className="treatment-import-header">
        <div className="treatment-import-breadcrumb">
          <Link to="/admin">Administration</Link>
          <span>/</span>
          <Link to="/admin/treatments">Treatment Management</Link>
          <span>/</span>
          <span>Import Catalogue</span>
        </div>

        <div className="treatment-import-heading">
          <div>
            <p className="treatment-import-eyebrow">
              VAXCARE ADMINISTRATION
            </p>
            <h1>
              Treatment <span>Import Centre</span>
            </h1>
            <p className="treatment-import-description">
              Browse evidence-linked treatment candidates and import
              records into the administrator review queue.
            </p>
          </div>

          <Link
            to="/admin/treatments"
            className="treatment-import-back"
          >
            ← Treatment Management
          </Link>
        </div>
      </header>

      <section className="treatment-import-summary">
        <div className="treatment-import-summary-item">
          <span className="treatment-import-summary-icon">
            <ClipboardList size={22} />
          </span>
          <div>
            <strong>{availableCatalogue.length}</strong>
            <span>Available candidates</span>
          </div>
        </div>

        <div className="treatment-import-summary-item">
          <span className="treatment-import-summary-icon">
            <CheckCircle2 size={22} />
          </span>
          <div>
            <strong>{importedCount}</strong>
            <span>Already imported</span>
          </div>
        </div>

        <div className="treatment-import-summary-item">
          <span className="treatment-import-summary-icon">
            <Download size={22} />
          </span>
          <div>
            <strong>{availableCount}</strong>
            <span>Ready to import</span>
          </div>
        </div>
      </section>

      <section className="treatment-import-catalogue">
        <div className="treatment-import-catalogue-heading">
          <div>
            <p className="treatment-import-eyebrow">
              EVIDENCE-LINKED CATALOGUE
            </p>
            <h2>Dengue Treatment Candidates</h2>
            <p>
              These initial candidates are associated with the verified
              Dengue record in your database.
            </p>
          </div>

          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="treatment-import-source-link"
          >
            View official 2023 guideline ↗
          </a>
        </div>

        <div className="treatment-import-notice">
          <ShieldCheck size={21} />
          <p>
            Imported records are saved as pending and unpublished.
            Review the clinical content and source before approving
            or publishing any treatment.
          </p>
        </div>

        <div className="treatment-import-bulk">
          <div>
            <strong>{availableCount} records ready to import</strong>
            <p>Existing records are checked before importing.</p>
          </div>

          <button
            type="button"
            onClick={handleImportAll}
            disabled={
              initialLoading ||
              importingAll ||
              availableCount === 0
            }
          >
            <Download size={17} />
            {importingAll
              ? "Importing..."
              : `Import All Available (${availableCount})`}
          </button>
        </div>

        <div className="treatment-import-toolbar">
          <div className="treatment-import-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search treatment or category..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search treatment candidates"
            />
          </div>

          <div className="treatment-import-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <div
            className={`treatment-import-feedback ${feedback.type}`}
            role="status"
          >
            <AlertCircle size={19} />
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
          <div className="treatment-import-message">
            <RefreshCw size={20} />
            Checking verified diseases and existing treatment records...
          </div>
        )}

        {!initialLoading && diseases.length === 0 && (
          <div className="treatment-import-empty">
            <AlertCircle size={35} />
            <h3>No verified diseases available</h3>
            <p>
              Verify a disease in Disease Management before importing
              treatments associated with it.
            </p>
            <Link to="/admin/diseases">
              Open Disease Management
            </Link>
          </div>
        )}

        {!initialLoading &&
          diseases.length > 0 &&
          filteredTreatments.length === 0 && (
            <div className="treatment-import-empty">
              <Search size={35} />
              <h3>No treatment candidates found</h3>
              <p>Try another search term or category.</p>
            </div>
          )}

        {!initialLoading && filteredTreatments.length > 0 && (
          <div className="treatment-import-grid">
            {filteredTreatments.map((item) => {
              const added = isImported(item);
              const isLoading = loadingId === item.candidateId;

              return (
                <article
                  className="treatment-import-card"
                  key={item.candidateId}
                >
                  <div className="treatment-import-card-top">
                    <div className="treatment-import-card-icon">
                      <ClipboardList size={23} />
                    </div>

                    <span
                      className={`treatment-import-status ${
                        added ? "imported" : "available"
                      }`}
                    >
                      {added ? "Already added" : "Available"}
                    </span>
                  </div>

                  <span className="treatment-import-category">
                    {item.category}
                  </span>

                  <h3>{item.name}</h3>

                  <p className="treatment-import-disease">
                    Related disease: <strong>{item.disease.name}</strong>
                  </p>

                  <div className="treatment-import-description">
                    <span>OVERVIEW</span>
                    <p>{item.description}</p>
                  </div>

                  <div className="treatment-import-source">
                    <span>REFERENCE</span>
                    <p>{SOURCE_TITLE}</p>
                  </div>

                  <p className="treatment-import-review-note">
                    Requires administrator review before publication.
                  </p>

                  <button
                    type="button"
                    className={`treatment-import-card-button ${
                      added ? "imported" : ""
                    }`}
                    onClick={() => handleImport(item)}
                    disabled={
                      added ||
                      Boolean(loadingId) ||
                      importingAll
                    }
                  >
                    {isLoading
                      ? "Importing..."
                      : added
                        ? "✓ Added to catalogue"
                        : "Import treatment →"}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <div className="treatment-import-source-note">
          <ShieldCheck size={20} />
          <p>
            Source: {SOURCE_NAME}. The catalogue contains a limited
            set of candidates based on the cited national guideline.
            It is not a complete clinical protocol. Clinical decisions,
            eligibility, dosing and publication require qualified
            review of the original reference.
          </p>
        </div>
      </section>

      <section className="treatment-import-bottom">
        <div>
          <h3>Need to add another treatment?</h3>
          <p>
            Use the manual treatment form to add a separately
            researched treatment with its own disease association
            and supporting reference.
          </p>
        </div>

        <Link to="/admin/treatments/new">
          Add treatment manually →
        </Link>
      </section>
    </main>
  );
}

export default AdminTreatmentImport;
