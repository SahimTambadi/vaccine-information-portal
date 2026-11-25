
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  HeartPulse,
  ShieldCheck,
  AlertCircle,
  Stethoscope,
  Activity,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Clock,
  Building2,
  Syringe,
  Pill,
  ClipboardList,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./DiseaseDetails.css";

// ==========================================
// REUSABLE INFORMATION SECTION
// ==========================================

function InfoSection({ title, icon: Icon, content }) {
  if (!content) return null;

  return (
    <section className="disease-info-section">
      <div className="disease-info-heading">
        <div className="disease-info-icon">
          <Icon size={21} />
        </div>
        <h2>{title}</h2>
      </div>
      <p>{content}</p>
    </section>
  );
}

// ==========================================
// RECOMMENDATION SECTION
// ==========================================


function RecommendationSection({
  title,
  icon: Icon,
  items,
  loading,
  emptyMessage,
  renderItem,
  className = "",
}) {
  return (
    <section
      className={`disease-info-section disease-recommendation-section ${className}`}
    >
      <div className="disease-info-heading">
        <div className="disease-info-icon">
          <Icon size={21} />
        </div>
        <h2>{title}</h2>
        {!loading && items.length > 0 && (
          <span className="disease-section-count">
            {items.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="disease-recommendation-loading">
          <RefreshCw size={17} className="disease-small-spinner" />
          <span>Checking available records...</span>
        </div>
      ) : items.length > 0 ? (
        <div className={`disease-recommendation-grid ${className.includes("treatment") ? "disease-treatment-grid" : ""}`}>
          {items.map(renderItem)}
        </div>
      ) : (
        <p className="disease-no-data">{emptyMessage}</p>
      )}
    </section>
  );
}

// ==========================================
// DISEASE DETAILS PAGE
// ==========================================

function DiseaseDetails() {
  const { id } = useParams();

  const [disease, setDisease] = useState(null);
  const [catalogStatus, setCatalogStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recommendations, setRecommendations] = useState({
    hospitals: [],
    vaccines: [],
    treatments: [],
    medicines: [],
  });

  const [recommendationsLoading, setRecommendationsLoading] =
    useState(false);

  // ==========================================
  // FETCH RELATED RECOMMENDATIONS
  // ==========================================

  async function fetchRecommendations(diseaseData, isActive) {
    setRecommendationsLoading(true);

    const result = {
      hospitals: [],
      vaccines: [],
      treatments: [],
      medicines: [],
    };

    try {
      // --------------------------------------
      // 1. FETCH VERIFIED TREATMENTS
      // --------------------------------------

      const { data: treatmentData, error: treatmentError } =
        await supabase
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
            source_url
          `)
          .eq("disease_id", diseaseData.id)
          .eq("review_status", "verified")
          .eq("is_published", true)
          .order("treatment_name");

      if (treatmentError) {
        console.error("Related treatments error:", treatmentError);
      } else {
        result.treatments = treatmentData || [];
      }

      // --------------------------------------
      // 2. FETCH MEDICINES LINKED TO TREATMENTS
      // --------------------------------------

      if (result.treatments.length > 0) {
        const treatmentIds = result.treatments.map(
          (item) => item.id
        );

        const { data: treatmentMedicineData, error: relationError } =
          await supabase
            .from("treatment_medicines")
            .select("id, treatment_id, medicine_id, usage_notes")
            .in("treatment_id", treatmentIds);

        if (relationError) {
          console.error("Treatment medicine relation error:", relationError);
        } else if (treatmentMedicineData?.length > 0) {
          const medicineIds = [
            ...new Set(
              treatmentMedicineData.map((item) => item.medicine_id)
            ),
          ];

          const { data: medicineData, error: medicineError } =
            await supabase
              .from("medicines")
              .select(`
                id,
                name,
                generic_name,
                category,
                uses,
                prescription_required
              `)
              .in("id", medicineIds)
              .eq("review_status", "verified")
              .eq("is_published", true)
              .order("name");

          if (medicineError) {
            console.error("Related medicines error:", medicineError);
          } else {
            result.medicines = (medicineData || []).map((medicine) => {
              const links = treatmentMedicineData.filter(
                (relation) => relation.medicine_id === medicine.id
              );

              return {
                ...medicine,
                usage_notes: [
                  ...new Set(
                    links
                      .map((relation) => relation.usage_notes)
                      .filter(Boolean)
                  ),
                ],
              };
            });
          }
        }
      }

      // --------------------------------------
      // 3. FETCH APPROVED DISEASE VACCINES
      // --------------------------------------

      const { data: diseaseVaccineData, error: vaccineRelationError } =
        await supabase
          .from("disease_vaccines")
          .select("id, vaccine_id, recommendation_notes")
          .eq("disease_id", diseaseData.id)
          .eq("review_status", "verified")
          .eq("is_published", true);

      if (vaccineRelationError) {
        console.error(
          "Disease vaccine relationship error:",
          vaccineRelationError
        );
      } else if (diseaseVaccineData?.length > 0) {
        const vaccineIds = [
          ...new Set(diseaseVaccineData.map((item) => item.vaccine_id)),
        ];

        const { data: vaccineData, error: vaccineError } =
          await supabase
            .from("vaccines")
            .select(`
              id,
              name,
              full_name,
              category,
              purpose,
              age,
              icon
            `)
            .in("id", vaccineIds)
            .order("name");

        if (vaccineError) {
          console.error("Related vaccines error:", vaccineError);
        } else {
          result.vaccines = (vaccineData || []).map((vaccine) => ({
            ...vaccine,
            recommendation_notes:
              diseaseVaccineData.find(
                (relation) => relation.vaccine_id === vaccine.id
              )?.recommendation_notes || "",
          }));
        }
      }

      // --------------------------------------
      // 4. FIND RELATED HOSPITALS
      // --------------------------------------

      const hospitalIds = new Set();

      // Route A: Hospitals connected to doctors
      // associated with this disease.

      const { data: doctorDiseaseData, error: doctorDiseaseError } =
        await supabase
          .from("doctor_diseases")
          .select("doctor_id")
          .eq("disease_id", diseaseData.id);

      if (doctorDiseaseError) {
        console.error("Disease doctor relationship error:", doctorDiseaseError);
      } else if (doctorDiseaseData?.length > 0) {
        const doctorIds = [
          ...new Set(doctorDiseaseData.map((item) => item.doctor_id)),
        ];

        const { data: hospitalDoctorData, error: hospitalDoctorError } =
          await supabase
            .from("hospital_doctors")
            .select("hospital_id")
            .in("doctor_id", doctorIds)
            .eq("review_status", "verified");

        if (hospitalDoctorError) {
          console.error("Hospital doctor relationship error:", hospitalDoctorError);
        } else {
          (hospitalDoctorData || []).forEach((item) => {
            hospitalIds.add(item.hospital_id);
          });
        }
      }

      // Route B: Hospitals connected to the disease's
      // verified medical specializations.

      const specializationIds = (
        diseaseData.disease_specializations || []
      )
        .filter((item) => item.specializations)
        .map((item) => item.specializations.id);

      if (specializationIds.length > 0) {
        const { data: hospitalSpecializationData, error: specializationError } =
          await supabase
            .from("hospital_specializations")
            .select("hospital_id")
            .in("specialization_id", specializationIds);

        if (specializationError) {
          console.error(
            "Hospital specialization relationship error:",
            specializationError
          );
        } else {
          (hospitalSpecializationData || []).forEach((item) => {
            hospitalIds.add(item.hospital_id);
          });
        }
      }

      // Fetch only verified hospitals and verified locations.

      if (hospitalIds.size > 0) {
        const { data: hospitalData, error: hospitalError } =
          await supabase
            .from("hospitals")
            .select(`
              id,
              name,
              slug,
              hospital_type,
              description,
              phone,
              website_url,
              hospital_locations (
                id,
                branch_name,
                address,
                locality,
                city,
                state,
                pincode,
                is_primary,
                review_status
              )
            `)
            .in("id", [...hospitalIds])
            .eq("review_status", "verified")
            .order("name");

        if (hospitalError) {
          console.error("Related hospitals error:", hospitalError);
        } else {
          result.hospitals = (hospitalData || [])
            .map((hospital) => ({
              ...hospital,
              hospital_locations: (
                hospital.hospital_locations || []
              ).filter(
                (location) => location.review_status === "verified"
              ),
            }))
            .filter(
              (hospital) => hospital.hospital_locations.length > 0
            );
        }
      }
    } catch (recommendationError) {
      console.error(
        "Unable to fetch disease recommendations:",
        recommendationError
      );
    }

    if (isActive()) {
      setRecommendations(result);
      setRecommendationsLoading(false);
    }
  }

  // ==========================================
  // FETCH DISEASE STATUS AND DETAILS
  // ==========================================

  useEffect(() => {
    let active = true;

    async function fetchDiseaseDetails() {
      setLoading(true);
      setError("");
      setDisease(null);
      setCatalogStatus(null);
      setRecommendations({
        hospitals: [],
        vaccines: [],
        treatments: [],
        medicines: [],
      });

      setRecommendationsLoading(false);

      // STEP 1: Check the public catalogue.

      const {
        data: catalogData,
        error: catalogError,
      } = await supabase
        .from("disease_public_catalog")
        .select("id, name, slug, review_status")
        .eq("id", id)
        .maybeSingle();

      if (!active) return;

      if (catalogError) {
        console.error("Disease catalogue error:", catalogError);
        setError(
          "Unable to check disease information. Please try again later."
        );
        setLoading(false);
        return;
      }

      if (!catalogData) {
        setDisease(null);
        setLoading(false);
        return;
      }

      setCatalogStatus(catalogData.review_status);

      // Do not fetch medical details for unverified records.

      if (catalogData.review_status !== "verified") {
        setLoading(false);
        return;
      }

      // STEP 2: Fetch verified disease details.

      const { data, error: detailsError } = await supabase
        .from("diseases")
        .select(`
          id,
          name,
          slug,
          description,
          overview,
          causes,
          risk_factors,
          complications,
          prevention,
          diagnosis,
          when_to_seek_help,
          source_name,
          source_url,
          last_reviewed_at,
          disease_symptoms (
            id,
            notes,
            symptoms (
              id,
              name,
              description
            )
          ),
          disease_specializations (
            id,
            notes,
            specializations (
              id,
              name,
              description
            )
          )
        `)
        .eq("id", id)
        .eq("review_status", "verified")
        .maybeSingle();

      if (!active) return;

      if (detailsError) {
        console.error("Disease details error:", detailsError);
        setError(
          "Unable to load disease information. Please try again later."
        );
        setLoading(false);
        return;
      }

      if (!data) {
        setDisease(null);
        setLoading(false);
        return;
      }

      setDisease(data);
      setLoading(false);

      // Recommendations load independently from the main disease details.
      await fetchRecommendations(data, () => active);
    }

    fetchDiseaseDetails();

    return () => {
      active = false;
    };
  }, [id]);

  // ==========================================
  // FORMAT REVIEW DATE
  // ==========================================

  function formatDate(date) {
    if (!date) return null;

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <main className="disease-details-page">
        <div className="disease-details-state">
          <div className="disease-details-loader" />
          <h2>Loading Disease Information</h2>
          <p>Please wait while we retrieve the information.</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error) {
    return (
      <main className="disease-details-page">
        <div className="disease-details-state disease-details-error">
          <AlertCircle size={42} />
          <h2>Unable to Load Information</h2>
          <p>{error}</p>
          <Link to="/diseases" className="disease-back-button">
            <ArrowLeft size={17} />
            Back to Diseases
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // PENDING DISEASE STATE
  // ==========================================

  if (catalogStatus === "pending") {
    return (
      <main className="disease-details-page">
        <div className="disease-details-state">
          <Clock size={45} />
          <h2>Information Under Review</h2>
          <p>
            This disease is listed in the VaxCare directory,
            but its medical information is currently awaiting
            verification. Full details will be available after
            the review process is completed.
          </p>
          <Link to="/diseases" className="disease-back-button">
            <ArrowLeft size={17} />
            Back to Diseases
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // REJECTED DISEASE STATE
  // ==========================================

  if (catalogStatus === "rejected") {
    return (
      <main className="disease-details-page">
        <div className="disease-details-state disease-details-error">
          <AlertCircle size={45} />
          <h2>Information Not Published</h2>
          <p>
            This disease is listed in the VaxCare directory,
            but its information has not been approved for
            public viewing.
          </p>
          <Link to="/diseases" className="disease-back-button">
            <ArrowLeft size={17} />
            Back to Diseases
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // NOT FOUND STATE
  // ==========================================

  if (!disease) {
    return (
      <main className="disease-details-page">
        <div className="disease-details-state">
          <HeartPulse size={45} />
          <h2>Disease Information Not Available</h2>
          <p>
            This disease may not exist or may not be available
            in the public VaxCare directory.
          </p>
          <Link to="/diseases" className="disease-back-button">
            <ArrowLeft size={17} />
            Back to Diseases
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // PREPARE RELATED RECORDS
  // ==========================================

  const symptoms = (disease.disease_symptoms || [])
    .filter((item) => item.symptoms)
    .map((item) => ({
      ...item.symptoms,
      notes: item.notes,
    }));

  const specializations = (disease.disease_specializations || [])
    .filter((item) => item.specializations)
    .map((item) => ({
      ...item.specializations,
      notes: item.notes,
    }));

  const reviewedDate = formatDate(disease.last_reviewed_at);

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="disease-details-page">
      <div className="disease-details-container">

        <Link to="/diseases" className="disease-back-link">
          <ArrowLeft size={17} />
          Back to Disease Directory
        </Link>

        {/* DISEASE HERO */}

        <section className="disease-details-hero">
          <div className="disease-details-hero-content">
            <span className="disease-details-label">
              VAXCARE HEALTH INFORMATION
            </span>

            <h1>{disease.name}</h1>

            {disease.description && (
              <p className="disease-details-description">
                {disease.description}
              </p>
            )}

            <div className="disease-details-verified">
              <ShieldCheck size={17} />
              Verified Information
            </div>
          </div>

          <div className="disease-details-hero-icon">
            <HeartPulse size={75} strokeWidth={1.4} />
          </div>
        </section>

        <div className="disease-details-layout">
          <div className="disease-details-main">

            <InfoSection
              title="Disease Overview"
              icon={BookOpen}
              content={disease.overview}
            />

            <InfoSection
              title="Causes"
              icon={Activity}
              content={disease.causes}
            />

            <InfoSection
              title="Risk Factors"
              icon={AlertCircle}
              content={disease.risk_factors}
            />

            {/* SYMPTOMS */}

            <section className="disease-info-section">
              <div className="disease-info-heading">
                <div className="disease-info-icon">
                  <HeartPulse size={21} />
                </div>
                <h2>Symptoms</h2>
              </div>

              {symptoms.length > 0 ? (
                <div className="disease-symptoms-list">
                  {symptoms.map((symptom) => (
                    <article
                      className="disease-symptom-card"
                      key={symptom.id}
                    >
                      <h3>{symptom.name}</h3>

                      {symptom.description && (
                        <p>{symptom.description}</p>
                      )}

                      {symptom.notes && (
                        <p className="disease-symptom-notes">
                          {symptom.notes}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="disease-no-data">
                  Symptom information has not been added yet.
                </p>
              )}
            </section>

            <InfoSection
              title="Possible Complications"
              icon={AlertCircle}
              content={disease.complications}
            />

            <InfoSection
              title="Prevention"
              icon={ShieldCheck}
              content={disease.prevention}
            />

            <InfoSection
              title="Diagnosis"
              icon={Stethoscope}
              content={disease.diagnosis}
            />

            <InfoSection
              title="When to Seek Medical Help"
              icon={AlertCircle}
              content={disease.when_to_seek_help}
            />

            {/* SPECIALIZATIONS */}

            <section className="disease-info-section">
              <div className="disease-info-heading">
                <div className="disease-info-icon">
                  <Stethoscope size={21} />
                </div>
                <h2>Related Medical Specializations</h2>
              </div>

              {specializations.length > 0 ? (
                <div className="disease-specializations-list">
                  {specializations.map((specialization) => (
                    <article
                      className="disease-specialization-card"
                      key={specialization.id}
                    >
                      <h3>{specialization.name}</h3>

                      {specialization.description && (
                        <p>{specialization.description}</p>
                      )}

                      {specialization.notes && (
                        <p className="disease-specialization-notes">
                          {specialization.notes}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="disease-no-data">
                  Related medical specializations have not been added yet.
                </p>
              )}
            </section>

            {/* RELATED HOSPITALS */}

            <RecommendationSection
              title="Related Hospitals"
              icon={Building2}
              items={recommendations.hospitals}
              loading={recommendationsLoading}
              emptyMessage="No verified hospitals linked to this disease or its medical specializations are currently available."
              renderItem={(hospital) => {
                const location = hospital.hospital_locations?.[0];

                return (
                  <article
                    className="disease-recommendation-card"
                    key={hospital.id}
                  >
                    <div className="disease-recommendation-card-icon">
                      <Building2 size={22} />
                    </div>

                    <h3>{hospital.name}</h3>

                    {hospital.hospital_type && (
                      <span className="disease-recommendation-tag">
                        {hospital.hospital_type}
                      </span>
                    )}

                    {location && (
                      <p className="disease-recommendation-detail">
                        <MapPin size={15} />
                        {[
                          location.locality,
                          location.city,
                          location.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    <Link
                      to={`/hospitals/${hospital.slug || hospital.id}`}
                      className="disease-recommendation-link"
                    >
                      View Hospital
                      <ArrowLeft size={15} className="recommendation-arrow" />
                    </Link>
                  </article>
                );
              }}
            />

            {/* RELATED VACCINES */}

            <RecommendationSection
              title="Related Vaccines"
              icon={Syringe}
              items={recommendations.vaccines}
              loading={recommendationsLoading}
              emptyMessage="No verified vaccine recommendations have been added for this disease yet."
              renderItem={(vaccine) => (
                <article
                  className="disease-recommendation-card"
                  key={vaccine.id}
                >
                  <div className="disease-recommendation-card-icon">
                    <Syringe size={22} />
                  </div>

                  <h3>{vaccine.full_name || vaccine.name}</h3>

                  {vaccine.category && (
                    <span className="disease-recommendation-tag">
                      {vaccine.category}
                    </span>
                  )}

                  {vaccine.purpose && (
                    <p className="disease-recommendation-description">
                      {vaccine.purpose}
                    </p>
                  )}

                  {vaccine.recommendation_notes && (
                    <p className="disease-recommendation-notes">
                      {vaccine.recommendation_notes}
                    </p>
                  )}

                  <Link
                    to={`/vaccines/${vaccine.id}`}
                    className="disease-recommendation-link"
                  >
                    View Vaccine
                    <ArrowLeft size={15} className="recommendation-arrow" />
                  </Link>
                </article>
              )}
            />

            {/* RELATED MEDICINES */}

            <RecommendationSection
              title="Related Medicines"
              icon={Pill}
              items={recommendations.medicines}
              loading={recommendationsLoading}
              emptyMessage="No verified and published medicines are currently linked to the available treatments for this disease."
              renderItem={(medicine) => (
                <article
                  className="disease-recommendation-card"
                  key={medicine.id}
                >
                  <div className="disease-recommendation-card-icon">
                    <Pill size={22} />
                  </div>

                  <h3>{medicine.name}</h3>

                  {medicine.generic_name && (
                    <p className="disease-recommendation-detail">
                      Generic name: {medicine.generic_name}
                    </p>
                  )}

                  {medicine.category && (
                    <span className="disease-recommendation-tag">
                      {medicine.category}
                    </span>
                  )}

                  {medicine.uses && (
                    <p className="disease-recommendation-description">
                      {medicine.uses}
                    </p>
                  )}

                  {medicine.prescription_required && (
                    <p className="disease-recommendation-notes">
                      Prescription required
                    </p>
                  )}

                  <Link
                    to={`/medicines/${medicine.id}`}
                    className="disease-recommendation-link"
                  >
                    View Medicine
                    <ArrowLeft size={15} className="recommendation-arrow" />
                  </Link>
                </article>
              )}
            />

            

{/* AVAILABLE TREATMENTS */}

<RecommendationSection
  title="Available Treatments"
  icon={ClipboardList}
  className="disease-treatment-section"
  items={recommendations.treatments}
  loading={recommendationsLoading}
  emptyMessage="No verified and published treatment information is currently available for this disease."
  renderItem={(treatment) => {
    const linkedMedicines = recommendations.medicines.filter(
      (medicine) =>
        medicine.usage_notes?.length > 0 &&
        medicine.usage_notes.some((note) => note)
    );

    return (
      <article
        className="disease-treatment-card"
        key={treatment.id}
      >
        <div className="disease-treatment-card-header">
          <div className="disease-treatment-icon">
            {treatment.treatment_type?.toLowerCase() === "medication" ? (
              <Pill size={22} />
            ) : (
              <Activity size={22} />
            )}
          </div>

          <span className="disease-treatment-type">
            {treatment.treatment_type
              ? treatment.treatment_type.charAt(0).toUpperCase() +
                treatment.treatment_type.slice(1)
              : "Treatment"}
          </span>
        </div>

        <div className="disease-treatment-card-body">
          <h3>{treatment.treatment_name}</h3>

          {treatment.description && (
            <p>{treatment.description}</p>
          )}
        </div>

        <div className="disease-treatment-card-footer">
          <Link
            to={`/treatments/${treatment.id}`}
            className="disease-treatment-link"
          >
            View Treatment
            <span>→</span>
          </Link>
        </div>
      </article>
    );
  }}
/>
</div>
          {/* SIDEBAR */}

          <aside className="disease-details-sidebar">
            <div className="disease-sidebar-card">
              <div className="disease-sidebar-icon">
                <ShieldCheck size={25} />
              </div>

              <h3>Information Review</h3>

              <p>
                This record has passed the VaxCare verification
                process for public display.
              </p>

              {disease.source_name && (
                <div className="disease-source-information">
                  <span>Information Source</span>
                  <strong>{disease.source_name}</strong>
                </div>
              )}

              {reviewedDate && (
                <div className="disease-review-information">
                  <CalendarDays size={16} />
                  <span>Last reviewed: {reviewedDate}</span>
                </div>
              )}

              {disease.source_url && (
                <a
                  href={disease.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="disease-source-link"
                >
                  View Original Source
                  <ExternalLink size={15} />
                </a>
              )}
            </div>

            <div className="disease-sidebar-notice">
              <AlertCircle size={22} />
              <h3>Medical Disclaimer</h3>

              <p>
                This page provides educational information only.
                It is not a substitute for professional medical
                advice, diagnosis or treatment.
              </p>

              <p>
                Consult a qualified healthcare professional
                regarding personal medical concerns.
              </p>
            </div>
          </aside>
        </div>

        <div className="disease-details-bottom">
          <Link to="/diseases" className="disease-back-button">
            <ArrowLeft size={17} />
            Return to Disease Directory
          </Link>
        </div>

      </div>
    </main>
  );
}

export default DiseaseDetails;
