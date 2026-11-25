
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./Diseases.css";

function getStatusDetails(status) {
  switch (status) {
    case "verified":
      return {
        label: "Verified",
        className: "verified",
        icon: <ShieldCheck size={14} />,
      };

    case "pending":
      return {
        label: "Pending Review",
        className: "pending",
        icon: <Clock size={14} />,
      };

    case "rejected":
      return {
        label: "Not Published",
        className: "rejected",
        icon: <AlertCircle size={14} />,
      };

    default:
      return {
        label: "Under Review",
        className: "pending",
        icon: <Clock size={14} />,
      };
  }
}

function Diseases() {
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchDiseases() {
      const { data, error } = await supabase
        .from("disease_public_catalog")
        .select("id, name, slug, review_status")
        .order("name", { ascending: true });

      if (!active) return;

      if (error) {
        console.error("Error fetching disease catalogue:", error);
        setError(
          "Unable to load the disease catalogue. Please try again later."
        );
        setLoading(false);
        return;
      }

      setDiseases(data || []);
      setLoading(false);
    }

    fetchDiseases();

    return () => {
      active = false;
    };
  }, []);

  const filteredDiseases = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) return diseases;

    return diseases.filter((disease) =>
      disease.name?.toLowerCase().includes(searchTerm)
    );
  }, [diseases, search]);

  return (
    <main className="diseases-page">
      {/* HERO SECTION */}

      <section className="diseases-hero">
        <div className="diseases-hero-content">
          <span className="diseases-eyebrow">
            VAXCARE HEALTHCARE DIRECTORY
          </span>

          <h1>
            Understand Diseases.
            <br />
            <span>Explore Health Information.</span>
          </h1>

          <p>
            Explore the VaxCare disease directory and discover health
            conditions with educational information reviewed before publication.
          </p>

          <div className="diseases-hero-trust">
            <ShieldCheck size={18} />
            <span>Medical information is published after verification</span>
          </div>
        </div>

        <div className="diseases-hero-visual">
          <div className="diseases-hero-circle">
            <HeartPulse size={86} strokeWidth={1.4} />
          </div>
        </div>
      </section>

      {/* SEARCH SECTION */}

      <section className="diseases-search-section">
        <div className="diseases-section-heading">
          <span className="diseases-eyebrow">DISEASE DIRECTORY</span>
          <h2>Explore Health Conditions</h2>
          <p>
            Search disease names available in the VaxCare directory.
          </p>
        </div>

        <div className="diseases-search-box">
          <Search size={21} />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search diseases or health conditions..."
            aria-label="Search diseases"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="diseases-clear-button"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* DISEASE RESULTS */}

      <section className="diseases-results-section">
        <div className="diseases-results-heading">
          <div>
            <h2>Available Diseases</h2>
            <p>
              {loading
                ? "Loading disease records..."
                : `${filteredDiseases.length} ${
                    filteredDiseases.length === 1 ? "disease" : "diseases"
                  } found`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="diseases-state">
            <div className="diseases-loader" />
            <p>Loading disease catalogue...</p>
          </div>
        ) : error ? (
          <div className="diseases-state diseases-error">
            <h3>Unable to load information</h3>
            <p>{error}</p>
          </div>
        ) : filteredDiseases.length === 0 ? (
          <div className="diseases-state diseases-empty">
            <HeartPulse size={42} />

            <h3>
              {search
                ? "No matching diseases found"
                : "No diseases available yet"}
            </h3>

            <p>
              {search
                ? "Try another disease name or search term."
                : "Disease names will appear here after they are added to the VaxCare catalogue."}
            </p>
          </div>
        ) : (
          <div className="diseases-grid">
            {filteredDiseases.map((disease) => {
              const status = getStatusDetails(disease.review_status);

              return (
                <article className="disease-card" key={disease.id}>
                  <div className="disease-card-top">
                    <div className="disease-card-icon">
                      <HeartPulse size={25} />
                    </div>

                    <span
                      className={`disease-card-status ${status.className}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  <h3>{disease.name}</h3>

                  <p className="disease-card-description">
                    {disease.review_status === "verified"
                      ? "Verified educational information is available for this health condition."
                      : disease.review_status === "pending"
                      ? "Information for this health condition is currently awaiting review."
                      : "Information for this health condition is not currently published."}
                  </p>

                  <div className="disease-card-footer">
                    <Link
                      to={`/diseases/${disease.id}`}
                      className="disease-details-link"
                    >
                      {disease.review_status === "verified"
                        ? "Explore Details"
                        : "View Status"}
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* MEDICAL NOTICE */}

      <section className="diseases-notice">
        <ShieldCheck size={23} />

        <div>
          <h3>Important Healthcare Information</h3>
          <p>
            VaxCare provides educational information and does not replace
            professional medical advice, diagnosis or treatment. Consult a
            qualified healthcare professional for personal medical concerns.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Diseases;
