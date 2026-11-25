
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Activity,
  Stethoscope,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./Treatments.css";

function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
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
        .order("treatment_name", { ascending: true });

      // Diagnostic information
      console.log("Treatment fetch error:", fetchError);
      console.log("Treatment fetch data:", data);
      console.log("Treatment records found:", data?.length ?? 0);

      if (fetchError) {
        throw fetchError;
      }

      setTreatments(data || []);
    } catch (fetchError) {
      console.error("Failed to fetch treatments:", fetchError);

      setError(
        fetchError.message ||
          "Unable to load treatments. Please try again."
      );

      setTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTreatments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return treatments.filter((treatment) => {
      const matchesSearch =
        !searchValue ||
        treatment.treatment_name?.toLowerCase().includes(searchValue) ||
        treatment.diseases?.name?.toLowerCase().includes(searchValue) ||
        treatment.description?.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "all" || treatment.treatment_type === category;

      return matchesSearch && matchesCategory;
    });
  }, [treatments, search, category]);

  const formatType = (value) => {
    if (!value) return "Other";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="treatments-page">
      <section className="treatments-hero">
        <div className="treatments-hero-content">
          <span className="treatments-eyebrow">
            <ShieldCheck size={16} />
            REVIEWED HEALTHCARE INFORMATION
          </span>

          <h1>
            Explore Medical <span>Treatments</span>
          </h1>

          <p>
            Explore evidence-supported treatment information associated
            with different health conditions. Learn about treatment
            approaches, precautions and medical references.
          </p>

          <div className="treatments-hero-stats">
            <div>
              <Activity size={20} />
              <span>Evidence-based information</span>
            </div>

            <div>
              <ShieldCheck size={20} />
              <span>Reviewed content</span>
            </div>
          </div>
        </div>
      </section>

      <main className="treatments-container">
        <section className="treatments-search-section">
          <div className="treatments-section-heading">
            <div>
              <span>HEALTHCARE DIRECTORY</span>
              <h2>Find Treatments</h2>
              <p>
                Search by treatment name, disease or treatment category.
              </p>
            </div>

            <div className="treatments-count">
              {filteredTreatments.length}{" "}
              {filteredTreatments.length === 1
                ? "Treatment"
                : "Treatments"}
            </div>
          </div>

          <div className="treatments-toolbar">
            <div className="treatments-search-box">
              <Search size={20} />

              <input
                type="search"
                placeholder="Search treatments or diseases..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className="treatments-category-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by treatment category"
            >
              <option value="all">All Categories</option>
              <option value="medication">Medication</option>
              <option value="surgery">Surgery</option>
              <option value="therapy">Therapy</option>
              <option value="physiotherapy">Physiotherapy</option>
              <option value="lifestyle">Lifestyle Management</option>
              <option value="procedure">Medical Procedure</option>
              <option value="other">Other</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="treatments-state">
            <RefreshCw className="treatments-spinner" size={28} />
            <p>Loading verified treatments...</p>
          </div>
        ) : error ? (
          <div className="treatments-state treatments-error">
            <p>{error}</p>

            <button onClick={fetchTreatments}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : filteredTreatments.length === 0 ? (
          <div className="treatments-empty">
            <div className="treatments-empty-icon">
              <Stethoscope size={32} />
            </div>

            <h3>No Treatments Found</h3>

            <p>
              {treatments.length === 0
                ? "There are currently no verified and published treatments available."
                : "Try another search term or select a different category."}
            </p>

            {(search || category !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <section className="treatments-grid">
            {filteredTreatments.map((treatment) => (
              <article
                className="treatment-card"
                key={treatment.id}
              >
                <div className="treatment-card-top">
                  <div className="treatment-card-icon">
                    <Activity size={23} />
                  </div>

                  <span className="treatment-card-category">
                    {formatType(treatment.treatment_type)}
                  </span>
                </div>

                <h3>{treatment.treatment_name}</h3>

                <div className="treatment-card-disease">
                  <Stethoscope size={15} />

                  <span>
                    {treatment.diseases?.name ||
                      "Related disease not available"}
                  </span>
                </div>

                <p className="treatment-card-description">
                  {treatment.description ||
                    "View the treatment details and available medical references."}
                </p>

                <div className="treatment-card-footer">
                  <span>
                    <ShieldCheck size={15} />
                    Reviewed information
                  </span>

                  <Link to={`/treatments/${treatment.id}`}>
                    View Details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="treatments-disclaimer">
          <ShieldCheck size={21} />

          <div>
            <strong>Important Healthcare Information</strong>

            <p>
              Treatment information is provided for educational purposes.
              Treatment decisions, medication selection and procedures
              must be discussed with a qualified healthcare professional.
              Individual care depends on clinical assessment.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Treatments;
