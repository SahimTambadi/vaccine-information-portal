
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  ArrowRight,
  Syringe,
  Pill,
  Activity,
  Stethoscope,
  Building2,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./GlobalSearch.css";

// ==========================================
// SEARCH HELPERS
// ==========================================

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSearchableText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(extractSearchableText).join(" ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .filter(
        ([key]) =>
          !["id", "created_at", "updated_at"].includes(key)
      )
      .map(
        ([key, item]) =>
          `${key} ${extractSearchableText(item)}`
      )
      .join(" ");
  }

  return "";
}

function calculateSearchScore(record, query) {
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(" ").filter(Boolean);

  if (!tokens.length) {
    return 0;
  }

  const name = normalizeText(record.name);
  const searchableText = normalizeText(
    record.searchableText || ""
  );

  const allTokensMatch = tokens.every((token) =>
    searchableText.includes(token)
  );

  if (!allTokensMatch) {
    return 0;
  }

  let score = 1;

  if (name === normalizedQuery) {
    score += 100;
  } else if (name.startsWith(normalizedQuery)) {
    score += 60;
  } else if (name.includes(normalizedQuery)) {
    score += 40;
  }

  tokens.forEach((token) => {
    if (name.startsWith(token)) {
      score += 10;
    } else if (name.includes(token)) {
      score += 5;
    }
  });

  return score;
}

function getDescription(record, type) {
  if (type === "Treatment") {
    return (
      record.description ||
      `Treatment for ${record.diseases?.name || "a health condition"}.`
    );
  }

  if (type === "Medicine") {
    return (
      record.generic_name ||
      record.description ||
      record.category ||
      "Verified medicine information"
    );
  }

  if (type === "Doctor") {
    return (
      record.qualifications ||
      record.specialization ||
      "Verified healthcare professional"
    );
  }

  if (type === "Hospital") {
    return (
      record.description ||
      record.hospital_type ||
      "Verified healthcare facility"
    );
  }

  if (type === "Disease") {
    return (
      record.description ||
      record.overview ||
      "Verified disease information"
    );
  }

  return (
    record.description ||
    record.short_description ||
    record.category ||
    "Verified healthcare information"
  );
}

function formatTreatmentType(value) {
  if (!value) return "Treatment";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// ==========================================
// FETCH VERIFIED RECORDS
// ==========================================

async function fetchAllVerifiedRecords(
  table,
  columns,
  orderColumn
) {
  const batchSize = 1000;
  let allRecords = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq("review_status", "verified")
      .order(orderColumn, { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      throw error;
    }

    const records = data || [];

    allRecords = [...allRecords, ...records];

    if (records.length < batchSize) {
      break;
    }

    from += batchSize;
  }

  return allRecords;
}

// ==========================================
// FETCH VERIFIED AND PUBLISHED TREATMENTS
// ==========================================

async function fetchAllVerifiedTreatments() {
  const batchSize = 1000;
  let allRecords = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("disease_treatments")
      .select(`
        id,
        treatment_name,
        treatment_type,
        description,
        benefits,
        diseases!inner (
          id,
          name,
          review_status
        )
      `)
      .eq("review_status", "verified")
      .eq("is_published", true)
      .eq("diseases.review_status", "verified")
      .order("treatment_name", { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      throw error;
    }

    const records = data || [];

    allRecords = [...allRecords, ...records];

    if (records.length < batchSize) {
      break;
    }

    from += batchSize;
  }

  return allRecords;
}

// ==========================================
// LOAD EACH CATEGORY INDEPENDENTLY
// ==========================================

async function loadCategory(
  label,
  fetchFunction
) {
  try {
    const records = await fetchFunction();

    console.log(
      `Global Search: ${label} loaded`,
      records.length
    );

    return records;
  } catch (error) {
    console.error(
      `Global Search: Unable to load ${label}`,
      error
    );

    return [];
  }
}

// ==========================================
// GLOBAL SEARCH COMPONENT
// ==========================================

function GlobalSearch({ variant = "navbar" }) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [vaccines, setVaccines] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // ==========================================
  // LOAD VERIFIED PUBLIC RECORDS
  // ==========================================

  useEffect(() => {
    let active = true;

    async function fetchSearchData() {
      setLoading(true);

      const [
        vaccineData,
        medicineData,
        diseaseData,
        treatmentData,
        doctorData,
        hospitalData,
      ] = await Promise.all([
        loadCategory("Vaccines", () =>
          fetchAllVerifiedRecords(
            "vaccines",
            "*",
            "name"
          )
        ),

        loadCategory("Medicines", () =>
          fetchAllVerifiedRecords(
            "medicine_public_catalog",
            "id, name, generic_name, category, review_status",
            "name"
          )
        ),

        loadCategory("Diseases", () =>
          fetchAllVerifiedRecords(
            "diseases",
            "id, name, slug, description, overview, causes, prevention, review_status",
            "name"
          )
        ),

        loadCategory(
          "Treatments",
          fetchAllVerifiedTreatments
        ),

        loadCategory("Doctors", () =>
          fetchAllVerifiedRecords(
            "doctor_public_catalog",
            "*",
            "full_name"
          )
        ),

        loadCategory("Hospitals", () =>
          fetchAllVerifiedRecords(
            "hospitals",
            "id, name, slug, hospital_type, description, facilities, languages, review_status",
            "name"
          )
        ),
      ]);

      if (!active) return;

      setVaccines(vaccineData);
      setMedicines(medicineData);
      setDiseases(diseaseData);
      setTreatments(treatmentData);
      setDoctors(doctorData);
      setHospitals(hospitalData);

      setLoading(false);
    }

    fetchSearchData();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // PREPARE SEARCH RECORDS
  // ==========================================

  const searchableRecords = useMemo(() => {
    const prepareRecords = (
      records,
      type,
      getName,
      getCategory,
      getPath,
      Icon
    ) =>
      records
        .filter((record) => getName(record))
        .map((record) => ({
          id: record.id,
          name: getName(record),
          category: getCategory(record),
          description: getDescription(record, type),
          type,
          path: getPath(record),
          Icon,
          searchableText: extractSearchableText(record),
        }));

    return [
      ...prepareRecords(
        vaccines,
        "Vaccine",
        (item) => item.full_name || item.name,
        (item) => item.category || "Vaccine",
        (item) => `/vaccines/${item.id}`,
        Syringe
      ),

      ...prepareRecords(
        medicines,
        "Medicine",
        (item) => item.name,
        (item) =>
          item.generic_name || item.category || "Medicine",
        (item) => `/medicines/${item.id}`,
        Pill
      ),

      ...prepareRecords(
        diseases,
        "Disease",
        (item) => item.name,
        () => "Disease information",
        (item) => `/diseases/${item.id}`,
        Activity
      ),

      ...prepareRecords(
        treatments,
        "Treatment",
        (item) => item.treatment_name,
        (item) => formatTreatmentType(item.treatment_type),
        (item) => `/treatments/${item.id}`,
        Stethoscope
      ),

      ...prepareRecords(
        doctors,
        "Doctor",
        (item) => item.full_name,
        (item) =>
          item.qualifications ||
          item.specialization ||
          "Verified Doctor",
        (item) => `/doctors/${item.id}`,
        Stethoscope
      ),

      ...prepareRecords(
        hospitals,
        "Hospital",
        (item) => item.name,
        (item) => item.hospital_type || "Hospital",
        (item) => `/hospitals/${item.slug}`,
        Building2
      ),
    ];
  }, [
    vaccines,
    medicines,
    diseases,
    treatments,
    doctors,
    hospitals,
  ]);

  // ==========================================
  // SEARCH AND RANK RESULTS
  // ==========================================

  const results = useMemo(() => {
    const query = search.trim();

    if (normalizeText(query).length < 2) {
      return [];
    }

    return searchableRecords
      .map((record) => ({
        ...record,
        score: calculateSearchScore(record, query),
      }))
      .filter((record) => record.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }, [search, searchableRecords]);

  // ==========================================
  // SELECT RESULT
  // ==========================================

  function handleSelect(result) {
    setSearch("");
    setShowResults(false);
    navigate(result.path);
  }

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  function handleClear() {
    setSearch("");
    setShowResults(false);
  }

  // ==========================================
  // RESULT CATEGORY CLASS
  // ==========================================

  function getCategoryClass(type) {
    return `${type.toLowerCase()}-card-icon`;
  }

  // ==========================================
  // RENDER SEARCH RESULT
  // ==========================================

  function renderResult(result) {
    const Icon = result.Icon;

    if (variant === "home") {
      return (
        <button
          type="button"
          key={`${result.type}-${result.id}`}
          className="global-search-home-card"
          onClick={() => handleSelect(result)}
        >
          <div className="global-search-home-card-top">
            <div
              className={`global-search-home-card-icon ${getCategoryClass(
                result.type
              )}`}
            >
              <Icon size={22} />
            </div>

            <span
              className={`global-search-result-type ${result.type.toLowerCase()}-type`}
            >
              {result.type}
            </span>
          </div>

          <h3>{result.name}</h3>

          <p>{result.description}</p>

          <span className="global-search-home-card-link">
            View Details
            <ArrowRight size={15} />
          </span>
        </button>
      );
    }

    return (
      <button
        type="button"
        key={`${result.type}-${result.id}`}
        className="global-search-result-item"
        onClick={() => handleSelect(result)}
      >
        <span className="global-search-result-info">
          <strong>{result.name}</strong>
          <small>{result.category}</small>
        </span>

        <span
          className={`global-search-result-type ${result.type.toLowerCase()}-type`}
        >
          {result.type}
        </span>
      </button>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className={`global-search global-search-${variant}`}>
      <div className="global-search-input-wrapper">
        <Search
          className="global-search-icon"
          size={20}
        />

        <input
          type="text"
          value={search}
          placeholder="Search vaccines, medicines, diseases, treatments, doctors, hospitals..."
          onChange={(event) => {
            setSearch(event.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              handleClear();
            }
          }}
          aria-label="Search VaxCare"
          aria-expanded={
            showResults && search.trim().length >= 2
          }
          autoComplete="off"
        />

        {search && (
          <button
            type="button"
            className="global-search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {showResults && search.trim().length >= 2 && (
        <div className="global-search-results">
          {loading ? (
            <p className="global-search-message">
              Loading healthcare records...
            </p>
          ) : results.length > 0 ? (
            <>
              <div className="global-search-results-heading">
                Search Results ({results.length})
              </div>

              {variant === "home" ? (
                <div className="global-search-home-grid">
                  {results.map(renderResult)}
                </div>
              ) : (
                results.map(renderResult)
              )}
            </>
          ) : (
            <p className="global-search-message">
              No verified healthcare records found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
