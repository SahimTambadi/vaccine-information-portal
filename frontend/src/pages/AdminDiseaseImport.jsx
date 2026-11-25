
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  HeartPulse,
  Info,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "./AdminDiseaseImport.css";

/*
  VAXCARE - DISEASE IMPORT CENTRE

  20 individual disease catalogue entries.

  Import workflow:
  1. Browse diseases.
  2. Open authoritative references.
  3. Import one disease at a time.
  4. Save as pending.
  5. Admin reviews and verifies separately.

  Clinical details must be reviewed before publication.
*/

const makeDisease = (
  slug,
  name,
  category,
  description,
  overview,
  causes,
  source
) => ({
  slug,
  name,
  category,
  description,
  overview,
  causes,

  // These fields remain empty until detailed clinical
  // content is researched and reviewed by an administrator.
  risk_factors: null,
  complications: null,
  prevention: null,
  diagnosis: null,
  when_to_seek_help: null,

  sources: [source],
});

const whoSource = (title, url, note) => ({
  source_name: "World Health Organization",
  source_type: "WHO",
  source_title: title,
  source_url: url,
  evidence_note: note,
});

const indiaSource = (title, url, note) => ({
  source_name: "Ministry of Health and Family Welfare, Government of India",
  source_type: "MoHFW",
  source_title: title,
  source_url: url,
  evidence_note: note,
});

const DISEASE_CATALOGUE = [
  // 1. DENGUE
  {
    slug: "dengue",
    name: "Dengue",
    category: "Vector-borne diseases",

    description:
      "A mosquito-borne viral infection caused by the dengue virus.",

    overview:
      "Dengue is transmitted to humans through the bite of infected mosquitoes. Infections may be asymptomatic or cause illness, and some cases can progress to severe dengue.",

    causes:
      "Dengue is caused by dengue virus (DENV), transmitted primarily through infected Aedes mosquitoes.",

    risk_factors:
      "A previous dengue infection can increase the risk of severe dengue during a subsequent infection. Individual risk requires clinical assessment.",

    complications:
      "Severe dengue can involve plasma leakage, severe bleeding, or severe organ impairment.",

    prevention:
      "Prevention includes avoiding mosquito bites and reducing mosquito breeding sites.",

    diagnosis:
      "Diagnosis involves clinical assessment and appropriate laboratory testing. Test selection depends on the stage of illness.",

    when_to_seek_help:
      "Seek immediate medical care for severe abdominal pain, persistent vomiting, bleeding, rapid breathing, unusual tiredness, or cold and pale skin.",

    sources: [
      whoSource(
        "Dengue and severe dengue",
        "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue",
        "WHO reference covering dengue transmission, symptoms, severe dengue, diagnosis and prevention."
      ),
      indiaSource(
        "Dengue - NCVBDC",
        "https://ncvbdc.mohfw.gov.in/index1.php?level=1&lid=3690&sublinkid=5776",
        "Indian government reference for dengue prevention and control."
      ),
      indiaSource(
        "National Guidelines for Clinical Management of Dengue Fever 2023",
        "https://ncvbdc.mohfw.gov.in/Doc/National%20Guidelines%20for%20Clinical%20Management%20of%20Dengue%20Fever%202023.pdf",
        "Indian clinical management guideline for administrator review."
      ),
    ],
  },

  // 2. MALARIA
  makeDisease(
    "malaria",
    "Malaria",
    "Vector-borne diseases",
    "A parasitic disease transmitted through the bites of infected female Anopheles mosquitoes.",
    "Malaria is a potentially serious disease caused by Plasmodium parasites. It is transmitted to humans through infected mosquitoes.",
    "Human malaria is caused by Plasmodium parasites.",
    indiaSource(
      "NCVBDC - Diseases",
      "https://ncvbdc.mohfw.gov.in/index4.php?lang=1&level=0&lid=3683&linkid=407",
      "Government of India disease catalogue listing malaria among India's vector-borne diseases."
    )
  ),

  // 3. CHIKUNGUNYA
  makeDisease(
    "chikungunya",
    "Chikungunya",
    "Vector-borne diseases",
    "A mosquito-borne viral disease commonly associated with fever and joint pain.",
    "Chikungunya is caused by chikungunya virus and is transmitted by infected Aedes mosquitoes.",
    "Chikungunya is caused by chikungunya virus (CHIKV).",
    whoSource(
      "Chikungunya",
      "https://www.who.int/news-room/fact-sheets/detail/chikungunya",
      "WHO reference covering transmission, symptoms and prevention."
    )
  ),

  // 4. JAPANESE ENCEPHALITIS
  makeDisease(
    "japanese-encephalitis",
    "Japanese Encephalitis",
    "Vector-borne diseases",
    "A mosquito-borne viral infection that can cause inflammation of the brain.",
    "Japanese encephalitis is caused by Japanese encephalitis virus and is transmitted through infected mosquitoes.",
    "The disease is caused by Japanese encephalitis virus (JEV).",
    whoSource(
      "Japanese encephalitis",
      "https://www.who.int/news-room/fact-sheets/detail/japanese-encephalitis",
      "WHO reference covering transmission, disease impact and vaccination."
    )
  ),

  // 5. LYMPHATIC FILARIASIS
  makeDisease(
    "lymphatic-filariasis",
    "Lymphatic Filariasis",
    "Vector-borne diseases",
    "A parasitic infection that affects the lymphatic system and may cause long-term swelling and disability.",
    "Lymphatic filariasis is a mosquito-transmitted parasitic disease affecting the lymphatic system.",
    "It is caused by filarial nematode parasites, including Wuchereria bancrofti and Brugia species.",
    whoSource(
      "Lymphatic filariasis",
      "https://www.who.int/news-room/fact-sheets/detail/lymphatic-filariasis",
      "WHO reference covering causes, transmission and disease effects."
    )
  ),

  // 6. KALA-AZAR
  makeDisease(
    "kala-azar",
    "Kala-azar (Visceral Leishmaniasis)",
    "Vector-borne diseases",
    "A parasitic disease transmitted through the bites of infected sandflies.",
    "Visceral leishmaniasis, also known as kala-azar, is a serious form of leishmaniasis.",
    "It is caused by Leishmania parasites and transmitted by infected female sandflies.",
    indiaSource(
      "NCVBDC - Diseases",
      "https://ncvbdc.mohfw.gov.in/index4.php?lang=1&level=0&lid=3683&linkid=407",
      "Government of India reference listing kala-azar among nationally monitored vector-borne diseases."
    )
  ),

  // 7. TUBERCULOSIS
  makeDisease(
    "tuberculosis",
    "Tuberculosis (TB)",
    "Infectious diseases",
    "An infectious disease caused by bacteria that most commonly affects the lungs.",
    "Tuberculosis is an infectious disease caused by Mycobacterium tuberculosis. It can affect the lungs and other parts of the body.",
    "Tuberculosis is caused by Mycobacterium tuberculosis bacteria.",
    indiaSource(
      "Central Tuberculosis Division - Guidelines",
      "https://tbcindia.mohfw.gov.in/guidelines/",
      "National Tuberculosis Elimination Programme guidelines from the Government of India."
    )
  ),

  // 8. LEPROSY
  makeDisease(
    "leprosy",
    "Leprosy (Hansen Disease)",
    "Infectious diseases",
    "A chronic infectious disease that mainly affects the skin and peripheral nerves.",
    "Leprosy is a chronic bacterial infection that can cause skin and nerve involvement.",
    "Leprosy is caused mainly by Mycobacterium leprae.",
    whoSource(
      "Leprosy",
      "https://www.who.int/en/news-room/fact-sheets/detail/leprosy",
      "WHO reference covering the disease, transmission, diagnosis and prevention."
    )
  ),

  // 9. DIABETES
  makeDisease(
    "diabetes",
    "Diabetes",
    "Non-communicable diseases",
    "A chronic condition involving elevated blood glucose levels.",
    "Diabetes is a chronic metabolic disease in which the body does not produce enough insulin or cannot use insulin effectively.",
    "Diabetes involves problems with insulin production, insulin action, or both. The underlying mechanisms vary by type.",
    whoSource(
      "Diabetes",
      "https://www.who.int/news-room/fact-sheets/detail/diabetes",
      "WHO reference covering diabetes types, complications and prevention."
    )
  ),

  // 10. ANAEMIA
  makeDisease(
    "anaemia",
    "Anaemia",
    "Blood disorders",
    "A condition in which the number of red blood cells or haemoglobin concentration is below normal.",
    "Anaemia reduces the blood's capacity to carry oxygen to body tissues. It can have several underlying causes.",
    "Possible causes include nutritional deficiencies, infections, inherited conditions and other diseases.",
    whoSource(
      "Anaemia",
      "https://www.who.int/news-room/fact-sheets/detail/anaemia",
      "WHO reference covering causes, affected populations and prevention."
    )
  ),

  // 11. CHRONIC KIDNEY DISEASE
  makeDisease(
    "chronic-kidney-disease",
    "Chronic Kidney Disease",
    "Non-communicable diseases",
    "A long-term condition involving gradual loss of kidney function.",
    "Chronic kidney disease involves persistent abnormalities of kidney structure or function. It may progress over time.",
    "Possible causes include diabetes, hypertension, cardiovascular disease, kidney inflammation and certain genetic conditions.",
    whoSource(
      "Kidney disease",
      "https://www.who.int/news-room/fact-sheets/detail/kidney-disease",
      "WHO reference covering kidney disease, symptoms, causes and detection."
    )
  ),

  // 12. HYPERTENSION
  makeDisease(
    "hypertension",
    "Hypertension (High Blood Pressure)",
    "Non-communicable diseases",
    "A condition in which blood pressure remains higher than the recommended level.",
    "Hypertension is a cardiovascular risk condition that can be present without noticeable symptoms.",
    "Blood pressure is influenced by several genetic, lifestyle, environmental and health-related factors.",
    whoSource(
      "Hypertension",
      "https://www.who.int/news-room/fact-sheets/detail/hypertension",
      "WHO reference covering blood pressure, risk factors and prevention."
    )
  ),

  // 13. ASTHMA
  makeDisease(
    "asthma",
    "Asthma",
    "Respiratory diseases",
    "A chronic lung condition involving inflammation and narrowing of the airways.",
    "Asthma can cause episodes of coughing, wheezing, chest tightness and difficulty breathing.",
    "Asthma involves airway inflammation and muscle tightening. Multiple genetic and environmental factors may contribute.",
    whoSource(
      "Asthma",
      "https://www.who.int/en/news-room/fact-sheets/detail/asthma",
      "WHO reference covering asthma symptoms, causes and management."
    )
  ),

  // 14. PNEUMONIA
  makeDisease(
    "pneumonia",
    "Pneumonia",
    "Respiratory diseases",
    "An infection that causes inflammation of the air sacs in one or both lungs.",
    "Pneumonia can be caused by different infectious organisms and may range from mild to severe.",
    "Possible causes include bacteria, viruses and fungi.",
    whoSource(
      "Pneumonia",
      "https://www.who.int/news-room/fact-sheets/detail/pneumonia",
      "WHO reference for pneumonia and its public health impact."
    )
  ),

  // 15. VIRAL HEPATITIS B
  makeDisease(
    "hepatitis-b",
    "Hepatitis B",
    "Infectious diseases",
    "A viral infection that affects the liver and can cause acute or chronic disease.",
    "Hepatitis B is a liver infection that may become chronic and can lead to serious liver complications.",
    "It is caused by the hepatitis B virus (HBV).",
    whoSource(
      "Hepatitis B",
      "https://www.who.int/news-room/fact-sheets/detail/hepatitis-b",
      "WHO reference covering transmission, prevention and disease complications."
    )
  ),

  // 16. CHOLERA
  makeDisease(
    "cholera",
    "Cholera",
    "Waterborne diseases",
    "An acute diarrhoeal infection associated with contaminated food or water.",
    "Cholera is an intestinal infection that can cause severe dehydration if not treated promptly.",
    "Cholera is caused by the bacterium Vibrio cholerae.",
    whoSource(
      "Cholera",
      "https://www.who.int/en/news-room/fact-sheets/detail/cholera",
      "WHO reference covering transmission, symptoms, prevention and treatment information."
    )
  ),

  // 17. RABIES
  makeDisease(
    "rabies",
    "Rabies",
    "Zoonotic diseases",
    "A viral disease that affects the central nervous system and is usually transmitted through infected animal bites or scratches.",
    "Rabies is a vaccine-preventable viral disease. Once clinical symptoms develop, it is almost always fatal.",
    "Rabies is caused by rabies virus, commonly transmitted through the saliva of infected mammals.",
    whoSource(
      "Rabies",
      "https://www.who.int/en/news-room/fact-sheets/detail/rabies",
      "WHO reference covering transmission and urgent post-exposure prevention."
    )
  ),

  // 18. LEPTOSPIROSIS
  makeDisease(
    "leptospirosis",
    "Leptospirosis",
    "Zoonotic diseases",
    "A bacterial infection that can spread through contact with environments contaminated by infected animal urine.",
    "Leptospirosis affects humans and animals and is an important public health concern in several Indian states.",
    "It is caused by pathogenic Leptospira bacteria.",
    indiaSource(
      "Programme for Prevention and Control of Leptospirosis",
      "https://ncdc.mohfw.gov.in/includes/About/CentresAndDivision/leptospirosis.php",
      "National Centre for Disease Control reference covering India's leptospirosis programme and guidelines."
    )
  ),

  // 19. TYPHOID
  makeDisease(
    "typhoid",
    "Typhoid Fever",
    "Waterborne diseases",
    "A bacterial infection commonly spread through contaminated food or water.",
    "Typhoid fever is a systemic infection that can cause prolonged fever and other symptoms.",
    "Typhoid fever is caused by Salmonella Typhi bacteria.",
    whoSource(
      "Typhoid",
      "https://www.who.int/news-room/fact-sheets/detail/typhoid",
      "WHO reference covering transmission, symptoms and prevention."
    )
  ),

  // 20. COPD
  makeDisease(
    "copd",
    "Chronic Obstructive Pulmonary Disease (COPD)",
    "Respiratory diseases",
    "A chronic lung disease that causes persistent airflow limitation and breathing difficulties.",
    "COPD is a chronic respiratory condition that can progressively affect airflow.",
    "Tobacco smoke, air pollution and occupational exposure are important contributing factors.",
    indiaSource(
      "Indian Public Health Standards",
      "https://clinicalestablishments.mohfw.gov.in/en/standard-treatment-guidelines",
      "Government of India clinical standards and treatment guideline resource."
    )
  ),
];

function normalizeName(value) {
  return (value || "").trim().toLowerCase();
}

function AdminDiseaseImport() {
  const [existingDiseases, setExistingDiseases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [importingSlug, setImportingSlug] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        DISEASE_CATALOGUE.map((disease) => disease.category)
      ),
    ];
  }, []);

  const loadExistingDiseases = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("diseases")
      .select("id, name, slug, review_status");

    if (error) {
      console.error("Error loading existing diseases:", error);

      setFeedback({
        type: "error",
        message:
          "Unable to load the existing disease directory. Please refresh and try again.",
      });

      setLoading(false);
      return;
    }

    setExistingDiseases(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadExistingDiseases();
  }, []);

  const existingSlugs = useMemo(() => {
    return new Set(
      existingDiseases.map((disease) =>
        normalizeName(disease.slug)
      )
    );
  }, [existingDiseases]);

  const filteredDiseases = useMemo(() => {
    return DISEASE_CATALOGUE.filter((disease) => {
      const searchValue = normalizeName(search);

      const matchesSearch =
        normalizeName(disease.name).includes(searchValue) ||
        normalizeName(disease.category).includes(searchValue);

      const matchesCategory =
        activeCategory === "All" ||
        disease.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const importedCount = DISEASE_CATALOGUE.filter((disease) =>
    existingSlugs.has(normalizeName(disease.slug))
  ).length;

  const availableCount =
    DISEASE_CATALOGUE.length - importedCount;

  const handleImport = async (disease) => {
    if (existingSlugs.has(normalizeName(disease.slug))) {
      setFeedback({
        type: "info",
        message: `${disease.name} is already present in the disease directory.`,
      });
      return;
    }

    setImportingSlug(disease.slug);
    setFeedback(null);

    try {
      // STEP 1: Insert disease as pending.

      const { data: insertedDisease, error: diseaseError } =
        await supabase
          .from("diseases")
          .insert({
            name: disease.name,
            slug: disease.slug,

            description: disease.description,
            overview: disease.overview,
            causes: disease.causes,
            risk_factors: disease.risk_factors,
            complications: disease.complications,
            prevention: disease.prevention,
            diagnosis: disease.diagnosis,
            when_to_seek_help: disease.when_to_seek_help,

            source_name: disease.sources
              .map((source) => source.source_name)
              .filter(
                (name, index, array) =>
                  array.indexOf(name) === index
              )
              .join(", "),

            source_url: disease.sources[0].source_url,

            review_status: "pending",
          })
          .select("id")
          .single();

      if (diseaseError) {
        throw diseaseError;
      }

      // STEP 2: Insert source references.

      const sourceRecords = disease.sources.map((source) => ({
        disease_id: insertedDisease.id,
        source_name: source.source_name,
        source_type: source.source_type,
        source_title: source.source_title,
        source_url: source.source_url,
        evidence_note: source.evidence_note,
      }));

      const { error: sourceError } = await supabase
        .from("disease_sources")
        .insert(sourceRecords);

      if (sourceError) {
        const { error: rollbackError } = await supabase
          .from("diseases")
          .delete()
          .eq("id", insertedDisease.id);

        if (rollbackError) {
          console.error("Import cleanup failed:", rollbackError);
        }

        throw new Error(
          rollbackError
            ? "The disease was created, but its references could not be saved. Please check the admin directory before retrying."
            : `Disease references could not be saved: ${sourceError.message}`
        );
      }

      await loadExistingDiseases();

      setFeedback({
        type: "success",
        message: `${disease.name} was imported successfully as Pending Review.`,
      });
    } catch (error) {
      console.error("Disease import failed:", error);

      setFeedback({
        type: "error",
        message:
          error.message ||
          "Unable to import this disease. Please try again.",
      });
    } finally {
      setImportingSlug(null);
    }
  };

  return (
    <div className="disease-import-page">

      {/* HEADER */}

      <header className="disease-import-header">

        <div className="disease-import-breadcrumb">
          <Link to="/admin">Dashboard</Link>
          <span>/</span>
          <Link to="/admin/diseases">Disease Management</Link>
          <span>/</span>
          <span>Import Diseases</span>
        </div>

        <div className="disease-import-header-content">

          <div>
            <p className="disease-import-eyebrow">
              VAXCARE ADMINISTRATION
            </p>

            <h1>
              Import <span>Diseases</span>
            </h1>

            <p className="disease-import-description">
              Explore the disease catalogue, review trusted
              medical references, and import individual diseases
              into your admin directory for verification.
            </p>
          </div>

          <Link
            to="/admin/diseases"
            className="disease-import-back-button"
          >
            <ArrowLeft size={16} />
            Back to Diseases
          </Link>

        </div>
      </header>

      {/* SUMMARY */}

      <section className="disease-import-summary">

        <div className="disease-import-summary-item">
          <div className="disease-import-summary-icon">
            <BookOpen size={23} />
          </div>

          <div>
            <strong>{DISEASE_CATALOGUE.length}</strong>
            <span>Catalogue Diseases</span>
          </div>
        </div>

        <div className="disease-import-summary-item">
          <div className="disease-import-summary-icon imported">
            <CheckCircle2 size={23} />
          </div>

          <div>
            <strong>{importedCount}</strong>
            <span>Already in Directory</span>
          </div>
        </div>

        <div className="disease-import-summary-item">
          <div className="disease-import-summary-icon available">
            <Upload size={23} />
          </div>

          <div>
            <strong>{availableCount}</strong>
            <span>Available to Import</span>
          </div>
        </div>

      </section>

      {/* CATALOGUE */}

      <section className="disease-import-catalogue">

        <div className="disease-import-catalogue-heading">

          <div>
            <h2>Disease Catalogue</h2>

            <p>
              Browse diseases supported by recognised
              healthcare authorities.
            </p>
          </div>

          <span className="disease-import-catalogue-count">
            {filteredDiseases.length} diseases
          </span>

        </div>

        {/* SEARCH */}

        <div className="disease-import-toolbar">

          <div className="disease-import-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search diseases..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="disease-import-filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category ? "active" : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

        </div>

        {/* FEEDBACK */}

        {feedback && (
          <div
            className={`disease-import-feedback ${feedback.type}`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={19} />
            ) : (
              <Info size={19} />
            )}

            <p>{feedback.message}</p>

            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        {/* DISEASE GRID */}

        {loading ? (
          <div className="disease-import-loading">
            Loading disease catalogue...
          </div>
        ) : filteredDiseases.length === 0 ? (
          <div className="disease-import-empty">
            <Search size={35} />

            <h3>No diseases found</h3>

            <p>
              Try another search term or select a different category.
            </p>
          </div>
        ) : (
          <div className="disease-import-grid">

            {filteredDiseases.map((disease) => {
              const isImported = existingSlugs.has(
                normalizeName(disease.slug)
              );

              const isImporting =
                importingSlug === disease.slug;

              return (
                <article
                  className="disease-import-card"
                  key={disease.slug}
                >

                  <div className="disease-import-card-top">

                    <div className="disease-import-disease-icon">
                      <Activity size={23} />
                    </div>

                    <span
                      className={`disease-import-status ${
                        isImported ? "imported" : "available"
                      }`}
                    >
                      {isImported
                        ? "Already Imported"
                        : "Available"}
                    </span>

                  </div>

                  <h3>{disease.name}</h3>

                  <p className="disease-import-category">
                    {disease.category}
                  </p>

                  <p className="disease-import-description-card">
                    {disease.description}
                  </p>

                  <div className="disease-import-source-info">

                    <div className="disease-import-source-heading">
                      <ShieldCheck size={15} />
                      <span>AUTHORITATIVE REFERENCES</span>
                    </div>

                    {disease.sources.map((source) => (
                      <a
                        key={source.source_url}
                        href={source.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="disease-import-source-link"
                      >
                        <span>{source.source_title}</span>
                        <ExternalLink size={13} />
                      </a>
                    ))}

                  </div>

                  <p className="disease-import-review-note">
                    <FileText size={13} />
                    Requires admin reference review and completion
                    of medical details before public publication.
                  </p>

                  <button
                    type="button"
                    className={`disease-import-card-button ${
                      isImported ? "imported" : ""
                    }`}
                    disabled={isImported || isImporting}
                    onClick={() => handleImport(disease)}
                  >
                    {isImporting ? (
                      "Importing..."
                    ) : isImported ? (
                      <>
                        <CheckCircle2 size={16} />
                        Already Imported
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Import Disease
                      </>
                    )}
                  </button>

                </article>
              );
            })}

          </div>
        )}

        {/* SOURCE NOTE */}

        <div className="disease-import-source-note">
          <Info size={19} />

          <p>
            <strong>Medical content review:</strong> Imported
            diseases remain pending until an administrator checks
            the references, completes the required medical details,
            and verifies the information. Catalogue summaries are
            not a substitute for professional medical advice.
          </p>
        </div>

      </section>

      {/* BOTTOM */}

      <div className="disease-import-bottom">

        <div>
          <h3>Need to add a disease manually?</h3>

          <p>
            You can still use the existing manual disease-entry
            workflow.
          </p>
        </div>

        <Link to="/admin/diseases/new">
          <HeartPulse size={16} />
          Add Disease Manually
        </Link>

      </div>

    </div>
  );
}

export default AdminDiseaseImport;
