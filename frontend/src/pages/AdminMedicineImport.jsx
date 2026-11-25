
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminMedicineImport.css";

const NLEM_SOURCE =
  "https://cdsco.mohfw.gov.in/opencms/resources/UploadCDSCOWeb/2018/UploadPublic_NoticesFiles/reportnlem2022.pdf";

const SOURCE_NAME = "National List of Essential Medicines (NLEM) 2022";

// Catalogue identities only. Clinical information is intentionally
// left blank until it can be checked against an appropriate source.
const MEDICINE_GROUPS = [
  {
    category: "Anti-infective medicines",
    names: [
      "Amikacin", "Amoxicillin", "Amphotericin B", "Ampicillin",
      "Azithromycin", "Benzathine benzylpenicillin", "Benzylpenicillin",
      "Cefadroxil", "Cefazolin", "Cefixime", "Cefotaxime",
      "Ceftazidime", "Ceftriaxone", "Cefuroxime", "Chloramphenicol",
      "Ciprofloxacin", "Clarithromycin", "Clindamycin", "Cloxacillin",
      "Co-trimoxazole", "Dapsone", "Doxycycline", "Ethambutol",
      "Ethionamide", "Fluconazole", "Gentamicin", "Griseofulvin",
      "Isoniazid", "Levofloxacin", "Linezolid",
    ],
  },
  {
    category: "Cardiovascular medicines",
    names: [
      "Amlodipine", "Atenolol", "Atorvastatin", "Clopidogrel",
      "Digoxin", "Diltiazem", "Dobutamine", "Dopamine",
      "Enalapril", "Enoxaparin", "Esmolol", "Furosemide",
      "Glyceryl trinitrate", "Heparin", "Hydrochlorothiazide",
      "Metoprolol", "Nifedipine", "Propranolol",
      "Spironolactone", "Warfarin",
    ],
  },
  {
    category: "Diabetes and endocrine medicines",
    names: [
      "Carbimazole", "Glimepiride", "Glucose", "Insulin (Soluble)",
      "Metformin", "Prednisolone", "Hydrocortisone", "Dexamethasone",
      "Levothyroxine", "Fludrocortisone", "Glibenclamide",
      "Insulin isophane", "Insulin glargine", "Pioglitazone",
      "Thiamazole", "Desmopressin", "Oxytocin", "Adrenaline",
      "Methylprednisolone", "Betamethasone",
    ],
  },
  {
    category: "Gastrointestinal medicines",
    names: [
      "Activated charcoal", "Bisacodyl", "Domperidone", "Loperamide",
      "Metoclopramide", "Omeprazole", "Pantoprazole", "Ranitidine",
      "Sucralfate", "Lactulose", "Magnesium sulphate", "Ondansetron",
      "Dicyclomine", "Hyoscine butylbromide", "Mesalazine",
      "Famotidine", "Senna", "Glycerin", "Oral rehydration salts",
      "Zinc sulphate",
    ],
  },
  {
    category: "Analgesics and anti-inflammatory medicines",
    names: [
      "Acetylsalicylic acid", "Allopurinol", "Diclofenac", "Ibuprofen",
      "Mefenamic acid", "Morphine", "Paracetamol", "Tramadol",
      "Colchicine", "Naproxen", "Ketamine", "Buprenorphine",
      "Fentanyl", "Methadone", "Piroxicam", "Indomethacin",
      "Nalbuphine", "Pentazocine", "Celecoxib", "Meloxicam",
    ],
  },
  {
    category: "Allergy and respiratory medicines",
    names: [
      "Cetirizine", "Chlorpheniramine", "Budesonide",
      "Budesonide + Formoterol", "Salbutamol", "Ipratropium bromide",
      "Adrenaline", "Beclometasone", "Dextromethorphan",
      "Aminophylline", "Montelukast", "Theophylline",
      "Prednisolone", "Hydrocortisone", "Loratadine",
      "Fexofenadine", "Cromoglycate", "Epinephrine", "Ambroxol",
      "Acetylcysteine",
    ],
  },
  {
    category: "Neurological and psychiatric medicines",
    names: [
      "Amitriptyline", "Baclofen", "Carbamazepine", "Clobazam",
      "Clonazepam", "Clozapine", "Diazepam", "Escitalopram",
      "Fluoxetine", "Haloperidol", "Levetiracetam", "Lithium",
      "Lorazepam", "Phenytoin", "Phenobarbital", "Sodium valproate",
      "Midazolam", "Donepezil", "Risperidone", "Sertraline",
    ],
  },
  {
    category: "Vitamins and minerals",
    names: [
      "Ascorbic acid", "Calcium carbonate", "Cholecalciferol",
      "Cyanocobalamin", "Ferrous salts", "Folic acid",
      "Hydroxocobalamin", "Pyridoxine", "Riboflavin", "Thiamine",
      "Vitamin A", "Vitamin D", "Zinc sulphate", "Potassium chloride",
      "Sodium bicarbonate", "Magnesium sulphate", "Calcium gluconate",
      "Calcium folinate", "Ferrous salts + Folic acid",
      "Potassium citrate",
    ],
  },
  {
    category: "Dermatological and topical medicines",
    names: [
      "Benzoyl peroxide", "Calamine", "Clotrimazole",
      "Coal tar + Salicylic acid", "Gentian violet", "Hydrocortisone",
      "Mupirocin", "Permethrin", "Povidone iodine", "Salicylic acid",
      "Silver sulfadiazine", "Betamethasone valerate", "Fusidic acid",
      "Framycetin", "Methylrosanilinium chloride", "Miconazole",
      "Neomycin", "Bacitracin", "Terbinafine", "Zinc oxide",
    ],
  },
  {
    category: "Other essential medicine candidates",
    names: [
      "Acyclovir", "Albendazole", "Acetazolamide", "Atropine",
      "Azathioprine", "Bedaquiline", "Carboplatin", "Cisplatin",
      "Cyclophosphamide", "Cyclosporine", "Dexamethasone",
      "Fluorouracil", "Hydroxyurea", "Imatinib", "Methotrexate",
      "Meropenem", "Metronidazole", "Nitrofurantoin", "Rifampicin",
      "Tamoxifen",
    ],
  },
];

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function makeSourceId(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `IN-NLEM2022-${slug}`;
}

// Remove repeated names across categories and retain the first category.
const MEDICINES = Array.from(
  new Map(
    MEDICINE_GROUPS.flatMap((group) =>
      group.names.map((name) => [
        normalizeName(name),
        {
          name,
          category: group.category,
          source_record_id: makeSourceId(name),
        },
      ])
    )
  ).values()
).slice(0, 200);

const FILTERS = [
  "All",
  ...MEDICINE_GROUPS.map((group) => group.category),
];

function AdminMedicineImport() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [existingNames, setExistingNames] = useState(new Set());
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingId, setLoadingId] = useState("");
  const [importingAll, setImportingAll] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadExistingMedicines() {
      setInitialLoading(true);

      const { data, error } = await supabase
        .from("medicines")
        .select("name, source_record_id");

      if (!active) return;

      if (error) {
        setFeedback({
          type: "error",
          message:
            "Could not check existing medicine records. Duplicate checking will run again before importing.",
        });
      } else {
        const existing = new Set();

        (data || []).forEach((item) => {
          existing.add(normalizeName(item.name));

          if (item.source_record_id) {
            existing.add(String(item.source_record_id).trim());
          }
        });

        setExistingNames(existing);
      }

      setInitialLoading(false);
    }

    loadExistingMedicines();

    return () => {
      active = false;
    };
  }, []);

  const filteredMedicines = useMemo(() => {
    const query = search.trim().toLowerCase();

    return MEDICINES.filter((medicine) => {
      const matchesSearch =
        !query ||
        medicine.name.toLowerCase().includes(query) ||
        medicine.category.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All" ||
        medicine.category === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const importedCount = MEDICINES.filter(
    (medicine) =>
      existingNames.has(normalizeName(medicine.name)) ||
      existingNames.has(medicine.source_record_id)
  ).length;

  const availableCount = MEDICINES.length - importedCount;

  function isImported(medicine) {
    return (
      existingNames.has(normalizeName(medicine.name)) ||
      existingNames.has(medicine.source_record_id)
    );
  }

  function buildPayload(medicine) {
    return {
      name: medicine.name,
      generic_name: medicine.name,
      category: medicine.category,

      // These fields remain empty until verified information is added.
      brand_names: [],
      active_ingredients: [],
      available_forms: [],

      source_name: SOURCE_NAME,
      source_url: NLEM_SOURCE,
      source_record_id: medicine.source_record_id,
      data_origin: "imported",
      review_status: "pending",
      last_synced_at: new Date().toISOString(),
    };
  }

  async function refreshExistingRecords() {
    const { data, error } = await supabase
      .from("medicines")
      .select("name, source_record_id");

    if (error) throw error;

    const existing = new Set();

    (data || []).forEach((item) => {
      existing.add(normalizeName(item.name));

      if (item.source_record_id) {
        existing.add(String(item.source_record_id).trim());
      }
    });

    setExistingNames(existing);
    return existing;
  }

  async function handleImportMedicine(medicine) {
    setFeedback(null);
    setLoadingId(medicine.source_record_id);

    try {
      const existing = await refreshExistingRecords();

      if (
        existing.has(normalizeName(medicine.name)) ||
        existing.has(medicine.source_record_id)
      ) {
        setFeedback({
          type: "info",
          message: `${medicine.name} already exists. No duplicate was added.`,
        });
        return;
      }

      const { error } = await supabase
        .from("medicines")
        .insert(buildPayload(medicine));

      if (error) throw error;

      setExistingNames((current) => {
        const updated = new Set(current);
        updated.add(normalizeName(medicine.name));
        updated.add(medicine.source_record_id);
        return updated;
      });

      setFeedback({
        type: "success",
        message: `${medicine.name} imported successfully and is pending administrator review.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message || `Unable to import ${medicine.name}.`,
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

      const medicinesToImport = MEDICINES.filter(
        (medicine) =>
          !existing.has(normalizeName(medicine.name)) &&
          !existing.has(medicine.source_record_id)
      );

      if (medicinesToImport.length === 0) {
        setFeedback({
          type: "info",
          message: "All catalogue candidates already exist in your medicine directory.",
        });
        return;
      }

      const payload = medicinesToImport.map(buildPayload);

      const { error } = await supabase
        .from("medicines")
        .insert(payload);

      if (error) throw error;

      await refreshExistingRecords();

      setFeedback({
        type: "success",
        message: `${medicinesToImport.length} medicine records imported. All are pending administrator review.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Bulk import failed. Please check your database and try again.",
      });
    } finally {
      setImportingAll(false);
    }
  }

  return (
    <main className="app med-import-page">
      <header className="med-import-header">
        <div className="med-import-breadcrumb">
          <Link to="/admin">Administration</Link>
          <span>/</span>
          <Link to="/admin/medicines">Medicine Management</Link>
          <span>/</span>
          <span>Medicine Catalogue</span>
        </div>

        <div className="med-import-header-content">
          <div>
            <p className="med-import-eyebrow">
              VAXCARE ADMINISTRATION
            </p>

            <h1>
              Medicine <span>Import Centre</span>
            </h1>

            <p className="med-import-description">
              Browse medicine candidates for the Indian healthcare
              catalogue and import records for administrator review.
            </p>
          </div>

          <Link
            to="/admin/medicines"
            className="med-import-back-button"
          >
            ← Medicine Management
          </Link>
        </div>
      </header>

      <section className="med-import-summary">
        <div className="med-import-summary-item">
          <span className="med-import-summary-icon">💊</span>
          <div>
            <strong>{MEDICINES.length}</strong>
            <span>Catalogue candidates</span>
          </div>
        </div>

        <div className="med-import-summary-item">
          <span className="med-import-summary-icon">✓</span>
          <div>
            <strong>{importedCount}</strong>
            <span>Already in directory</span>
          </div>
        </div>

        <div className="med-import-summary-item">
          <span className="med-import-summary-icon">＋</span>
          <div>
            <strong>{availableCount}</strong>
            <span>Available to import</span>
          </div>
        </div>
      </section>

      <section className="med-import-catalogue">
        <div className="med-import-catalogue-heading">
          <div>
            <p className="med-import-eyebrow">
              INDIA MEDICINE CATALOGUE
            </p>
            <h2>Essential Medicine Candidates</h2>
            <p>
              Import individual records or add all available
              candidates to the pending-review queue.
            </p>
          </div>

          <a
            href={NLEM_SOURCE}
            target="_blank"
            rel="noreferrer"
            className="med-import-source-link"
          >
            View official NLEM source ↗
          </a>
        </div>

        <div className="med-import-bulk-action">
          <div>
            <strong>{availableCount} records ready to import</strong>
            <p>
              Imported records will not appear publicly until approved.
            </p>
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
            {importingAll
              ? "Importing catalogue..."
              : `Import All Available (${availableCount}) →`}
          </button>
        </div>

        <div className="med-import-toolbar">
          <div className="med-import-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search medicine name or category..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search medicines"
            />
          </div>

          <div
            className="med-import-filters"
            aria-label="Filter by medicine category"
          >
            {FILTERS.map((filter) => (
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
            className={`med-import-feedback ${feedback.type}`}
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
          <div className="med-import-loading">
            Checking existing medicine records...
          </div>
        )}

        {!initialLoading && filteredMedicines.length === 0 && (
          <div className="med-import-empty">
            <span>⌕</span>
            <h3>No medicines found</h3>
            <p>Try another search term or category filter.</p>
          </div>
        )}

        <div className="med-import-grid">
          {filteredMedicines.map((medicine) => {
            const added = isImported(medicine);
            const loading =
              loadingId === medicine.source_record_id;

            return (
              <article
                className="med-import-card"
                key={medicine.source_record_id}
              >
                <div className="med-import-card-top">
                  <div className="med-import-medicine-icon">
                    💊
                  </div>

                  <span
                    className={`med-import-status ${
                      added ? "imported" : "available"
                    }`}
                  >
                    {added ? "Already added" : "Available"}
                  </span>
                </div>

                <h3>{medicine.name}</h3>

                <p className="med-import-category">
                  {medicine.category}
                </p>

                <div className="med-import-source-info">
                  <span>DATA SOURCE</span>
                  <p>{SOURCE_NAME}</p>
                </div>

                <p className="med-import-review-note">
                  Clinical details require verification before approval.
                </p>

                <button
                  type="button"
                  className={`med-import-card-button ${
                    added ? "imported" : ""
                  }`}
                  onClick={() => handleImportMedicine(medicine)}
                  disabled={added || Boolean(loadingId) || importingAll}
                >
                  {loading
                    ? "Importing..."
                    : added
                      ? "✓ Added to directory"
                      : "Import medicine →"}
                </button>
              </article>
            );
          })}
        </div>

        <div className="med-import-source-note">
          <span>ⓘ</span>
          <p>
            This is an initial catalogue candidate list, not a ranking
            of India's most-used medicines. The NLEM is an essential
            medicines reference, not a measure of retail usage.
            Imported records contain medicine identities and source
            attribution only. Missing clinical details must be
            independently verified before administrator approval.
          </p>
        </div>
      </section>

      <section className="med-import-bottom">
        <div>
          <h3>Need to add another medicine?</h3>
          <p>
            You can use the existing manual medicine management
            workflow for records outside this catalogue.
          </p>
        </div>

        <Link to="/admin/medicines/new">
          Add medicine manually →
        </Link>
      </section>
    </main>
  );
}

export default AdminMedicineImport;
