
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import SourceReferences from "../components/SourceReferences";
import "./VaccineAvailability.css";

// Safely convert a value into an array.
function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    return [value];
  }

  return [];
}

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDistance(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return `${Number(value).toFixed(1)} km`;
}

function formatDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function VaccineDetails() {
  const { id } = useParams();

  const [selectedSection, setSelectedSection] = useState(null);
  const [vaccine, setVaccine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Nearby vaccine availability states.
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilitySearched, setAvailabilitySearched] = useState(false);

  // Fetch vaccine information from Supabase.
  useEffect(() => {
    const fetchVaccine = async () => {
      try {
        setLoading(true);
        setError("");
        setVaccine(null);
        setSelectedSection(null);

        setAvailability([]);
        setAvailabilityError("");
        setAvailabilitySearched(false);

        const { data, error } = await supabase
          .from("vaccines")
          .select("*")
          .eq("id", Number(id))
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setVaccine({
            ...(data.details || {}),
            id: data.id,
            name: data.name,
            fullName: data.full_name,
            category: data.category,
            purpose: data.purpose,
            age: data.age,
            icon: data.icon,
          });
        }
      } catch (err) {
        console.error("Error fetching vaccine:", err);
        setError("Unable to load vaccine information.");
      } finally {
        setLoading(false);
      }
    };

    fetchVaccine();
  }, [id]);

  // Fetch nearby verified vaccine availability.
  const searchAvailability = useCallback(
    async ({ latitude, longitude }) => {
      if (!vaccine?.id) {
        return;
      }

      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");
        setAvailability([]);
        setAvailabilitySearched(true);

        const { data, error } = await supabase.rpc(
          "get_nearby_vaccine_availability",
          {
            p_vaccine_id: Number(vaccine.id),
            p_latitude: latitude,
            p_longitude: longitude,
            p_pincode: null,
          }
        );

        if (error) {
          throw error;
        }

        setAvailability(data || []);
      } catch (err) {
        console.error("Vaccine availability error:", err);

        setAvailabilityError(
          "Unable to retrieve nearby vaccination centres. Please try again later."
        );
      } finally {
        setAvailabilityLoading(false);
      }
    },
    [vaccine?.id]
  );

  // Automatically detect visitor location and load nearby centres.
  useEffect(() => {
    if (!vaccine?.id) {
      return;
    }

    if (!navigator.geolocation) {
      setAvailabilityError(
        "Location services are not supported by this browser."
      );
      return;
    }

    let cancelled = false;

    setAvailabilityLoading(true);
    setAvailabilityError("");
    setAvailabilitySearched(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;

        searchAvailability({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (geoError) => {
        if (cancelled) return;

        setAvailabilityLoading(false);

        if (geoError.code === 1) {
          setAvailabilityError(
            "Allow location access in your browser to see vaccination centres near you."
          );
        } else if (geoError.code === 2) {
          setAvailabilityError(
            "Your current location could not be detected. Please check your device location settings."
          );
        } else {
          setAvailabilityError(
            "Location detection timed out. Please refresh the page and try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [vaccine?.id, searchAvailability]);

  if (loading) {
    return (
      <main className="app">
        <p>Loading vaccine information...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app">
        <h1>Unable to Load Vaccine</h1>
        <p>{error}</p>
        <Link to="/vaccines">Back to Vaccines</Link>
      </main>
    );
  }

  if (!vaccine) {
    return (
      <main className="app">
        <h1>Vaccine Not Found</h1>
        <p>The requested vaccine information is unavailable.</p>
        <Link to="/vaccines">Back to Vaccines</Link>
      </main>
    );
  }

  // Create information sections for the selected vaccine.
  const sections = [];

  // 1. Vaccine Overview
  if (vaccine.protection) {
    sections.push({
      id: "protection",
      icon: "🛡️",
      title: "Vaccine Overview",
      description: "Protection, working and limitations",
      content: (
        <>
          <h3>What does this vaccine protect against?</h3>
          <ul>
            {asArray(vaccine.protection.diseases).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>How does it work?</h3>
          <p>{vaccine.protection.howItWorks}</p>

          <h3>Important limitations</h3>
          <p>{vaccine.protection.limitations}</p>
        </>
      ),
    });
  }

  // 2. India Government Guidelines
  if (vaccine.indiaGuidance) {
    sections.push({
      id: "india",
      icon: "🇮🇳",
      title: "India Government Guidelines",
      description: "Indian vaccination programme and schedule",
      content: (
        <>
          <p>
            <strong>Programme:</strong>{" "}
            {vaccine.indiaGuidance.program}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {vaccine.indiaGuidance.status}
          </p>

          <p>{vaccine.indiaGuidance.eligibility}</p>

          <h3>Vaccination Schedule</h3>

          <div className="schedule-list">
            {asArray(vaccine.indiaGuidance.schedule).map((item, index) => {
              if (typeof item === "string") {
                return (
                  <div className="schedule-card" key={index}>
                    <p>{item}</p>
                  </div>
                );
              }

              return (
                <div className="schedule-card" key={index}>
                  <h4>{item.age}</h4>
                  <p><strong>{item.dose}</strong></p>
                  <p>{item.note}</p>
                </div>
              );
            })}
          </div>

          {vaccine.indiaGuidance.administration && (
            <>
              <h3>Administration</h3>

              {typeof vaccine.indiaGuidance.administration === "object" &&
              !Array.isArray(vaccine.indiaGuidance.administration) ? (
                Object.entries(vaccine.indiaGuidance.administration).map(
                  ([key, value]) => (
                    <p key={key}>
                      <strong>
                        {key.replace(/([A-Z])/g, " $1")}:
                      </strong>{" "}
                      {typeof value === "string" ||
                      typeof value === "number"
                        ? value
                        : JSON.stringify(value)}
                    </p>
                  )
                )
              ) : (
                <p>{String(vaccine.indiaGuidance.administration)}</p>
              )}
            </>
          )}
        </>
      ),
    });
  }

  // 3. WHO Guidance
  if (vaccine.whoGuidance) {
    sections.push({
      id: "who",
      icon: "🌍",
      title: "WHO Guidance",
      description: "World Health Organization recommendations",
      content: (
        <>
          <h3>WHO Recommendations</h3>
          <p>{vaccine.whoGuidance.recommendation}</p>

          <h3>Target Groups</h3>
          <ul>
            {asArray(vaccine.whoGuidance.targetGroups).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {asArray(vaccine.whoGuidance.schedule).length > 0 && (
            <>
              <h3>WHO Schedule and Recommendations</h3>
              <ul>
                {asArray(vaccine.whoGuidance.schedule).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {asArray(vaccine.whoGuidance.specialConsiderations).length > 0 && (
            <>
              <h3>Special Considerations</h3>
              <ul>
                {asArray(vaccine.whoGuidance.specialConsiderations).map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </>
          )}
        </>
      ),
    });
  }

  // 4. Safety Information
  if (vaccine.safety) {
    sections.push({
      id: "safety",
      icon: "❤️",
      title: "Safety Information",
      description: "Possible side effects and precautions",
      content: (
        <>
          <h3>Possible Side Effects</h3>
          <ul>
            {asArray(vaccine.safety.commonSideEffects).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>Precautions</h3>
          <ul>
            {asArray(vaccine.safety.precautions).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>When to Seek Medical Advice</h3>
          <p>{vaccine.safety.seekMedicalAttention}</p>
        </>
      ),
    });
  }

  // 5. Storage and Handling
  if (vaccine.storage) {
    sections.push({
      id: "storage",
      icon: "❄️",
      title: "Storage and Handling",
      description: "Vaccine storage information",
      content: (
        <p>
          {typeof vaccine.storage === "string"
            ? vaccine.storage
            : vaccine.storage.information}
        </p>
      ),
    });
  }

  // 6. Frequently Asked Questions
  if (asArray(vaccine.faqs).length > 0) {
    sections.push({
      id: "faqs",
      icon: "❓",
      title: "Frequently Asked Questions",
      description: "Common questions about this vaccine",
      content: (
        <div className="faq-list">
          {asArray(vaccine.faqs).map((faq, index) => (
            <div className="faq-card" key={index}>
              {typeof faq === "string" ? (
                <p>{faq}</p>
              ) : (
                <>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </>
              )}
            </div>
          ))}
        </div>
      ),
    });
  }

  // 7. Official Sources
  if (asArray(vaccine.sources).length > 0) {
    sections.push({
      id: "sources",
      icon: "📚",
      title: "Official Sources",
      description: "Government of India and WHO references",
      content: (
        <SourceReferences sources={asArray(vaccine.sources)} />
      ),
    });
  }

  // 8. Medical Disclaimer
  sections.push({
    id: "disclaimer",
    icon: "⚠️",
    title: "Medical Disclaimer",
    description: "Important information for visitors",
    content: (
      <section className="medical-disclaimer">
        <h3>Educational Information Only</h3>
        <p>
          This information is provided for general educational
          purposes only. It is not a substitute for professional
          medical advice, diagnosis or treatment. Always consult
          a qualified healthcare professional for vaccination
          recommendations.
        </p>
      </section>
    ),
  });

  const activeSection = sections.find(
    (section) => section.id === selectedSection
  );

  return (
    <main className="app vaccine-details-page">

      {/* Vaccine Overview */}
      <section className="vaccine-details">
        <div className="vaccine-icon">{vaccine.icon}</div>

        <span className="category">{vaccine.category}</span>

        <h1>{vaccine.name}</h1>

        <h3>{vaccine.fullName}</h3>

        <p>{vaccine.purpose}</p>

        <p>
          <strong>Recommended age group:</strong> {vaccine.age}
        </p>
      </section>

      {/* Automatically Loaded Nearby Vaccine Availability */}
      <section className="vaccine-availability-section">

        <div className="vaccine-availability-heading">
          <span className="availability-eyebrow">
            LOCATION-BASED VACCINATION SERVICES
          </span>

          <h2>Vaccination Centres Near You</h2>

          <p>
            Looking for <strong>{vaccine.name}</strong>?
            Discover verified hospitals and vaccination centres
            near your current location, with reported prices
            and availability.
          </p>
        </div>

        {availabilityLoading && (
          <div className="availability-loading">
            <p>
              📍 Finding vaccination centres near your location...
            </p>
          </div>
        )}

        {availabilityError && (
          <div className="availability-error" role="alert">
            <span>📍</span>
            <p>{availabilityError}</p>
          </div>
        )}

        {!availabilityLoading &&
          !availabilityError &&
          availabilitySearched &&
          availability.length > 0 && (
            <div className="availability-results">

              <div className="availability-results-heading">
                <h3>Available Centres Near You</h3>

                <span>
                  {availability.length}{" "}
                  {availability.length === 1 ? "centre" : "centres"} found
                </span>
              </div>

              <div className="availability-card-grid">
                {availability.map((centre) => (
                  <article
                    className="availability-centre-card"
                    key={centre.availability_id}
                  >
                    <div className="availability-card-top">
                      <div>
                        <span className="availability-centre-label">
                          VERIFIED CENTRE
                        </span>

                        <h3>
                          {centre.centre_name || centre.hospital_name}
                        </h3>

                        {centre.centre_name && (
                          <p className="availability-hospital-name">
                            {centre.hospital_name}
                          </p>
                        )}
                      </div>

                      <span
                        className={`availability-status ${centre.availability_status}`}
                      >
                        {centre.availability_status === "available"
                          ? "Available"
                          : "Limited Stock"}
                      </span>
                    </div>

                    <div className="availability-address">
                      <span>📍</span>

                      <p>
                        {[
                          centre.address,
                          centre.locality,
                          centre.city,
                          centre.state,
                          centre.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>

                    {centre.distance_km != null && (
                      <p className="availability-distance">
                        ↗ {formatDistance(centre.distance_km)} away
                      </p>
                    )}

                    <div className="availability-price-area">
                      <div>
                        <span>Vaccine price per dose</span>

                        <strong>
                          {formatCurrency(centre.price_per_dose) ||
                            "Price not provided"}
                        </strong>
                      </div>

                      <div>
                        <span>Administration fee</span>

                        <strong>
                          {formatCurrency(centre.administration_fee)}
                        </strong>
                      </div>

                      <div className="availability-total-price">
                        <span>Total per dose (reported)</span>

                        <strong>
                          {formatCurrency(centre.total_price) ||
                            "Total price unavailable"}
                        </strong>
                      </div>
                    </div>

                    {centre.stock_quantity != null && (
                      <p className="availability-stock">
                        Reported stock: {centre.stock_quantity} doses
                      </p>
                    )}

                    <div className="availability-updated">
                      Last stock update:{" "}
                      {formatDate(centre.last_stock_updated_at) ||
                        "Date not provided"}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

        {!availabilityLoading &&
          !availabilityError &&
          availabilitySearched &&
          availability.length === 0 && (
            <div className="availability-empty">
              <span>🏥</span>

              <h3>No verified centres found nearby</h3>

              <p>
                There are currently no published availability
                records for {vaccine.name} near your location.
                Please check again later.
              </p>
            </div>
          )}

        <p className="availability-disclaimer">
          Prices and availability are based on verified centre
          records. Please contact the centre to reconfirm stock
          and final charges before visiting.
        </p>

      </section>

      {/* Information Cards */}
      {!activeSection && (
        <>
          <section className="details-sections">
            <div className="details-heading">
              <p className="eyebrow">EXPLORE INFORMATION</p>

              <h2>Explore {vaccine.name}</h2>

              <p>
                Select a section below to learn more about this vaccine.
              </p>
            </div>

            <div className="details-section-grid">
              {sections.map((section) => (
                <button
                  type="button"
                  className="details-section-card"
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                >
                  <span className="section-icon">
                    {section.icon}
                  </span>

                  <h3>{section.title}</h3>

                  <p>{section.description}</p>

                  <span className="section-card-link">
                    View Information →
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="back-navigation">
            <Link to="/vaccines">← Back to Vaccines</Link>
          </div>
        </>
      )}

      {/* Selected Information */}
      {activeSection && (
        <section className="selected-section">

          <button
            type="button"
            className="back-to-sections"
            onClick={() => setSelectedSection(null)}
          >
            ← Back to Sections
          </button>

          <div className="selected-section-heading">
            <span className="section-icon">
              {activeSection.icon}
            </span>

            <div>
              <p className="eyebrow">VACCINE INFORMATION</p>
              <h2>{activeSection.title}</h2>
            </div>
          </div>

          <div className="selected-section-content">
            {activeSection.content}
          </div>

        </section>
      )}

    </main>
  );
}

export default VaccineDetails;
