
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Stethoscope,
  BriefcaseMedical,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Building2,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "./DoctorDetails.css";

function formatDate(value) {
  if (!value) return "Not available";

  const date =
    value.length === 10
      ? new Date(`${value}T00:00:00`)
      : new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getSafeUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}

function DoctorDetails() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctorDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const doctorId = Number(id);

      if (!Number.isInteger(doctorId) || doctorId <= 0) {
        throw new Error("Invalid doctor profile.");
      }

      // Public catalogue contains verified doctor profiles.
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctor_public_catalog")
        .select("*")
        .eq("id", doctorId)
        .maybeSingle();

      if (doctorError) throw doctorError;

      if (!doctorData) {
        throw new Error(
          "This doctor profile is unavailable or has not been verified."
        );
      }

      setDoctor(doctorData);

      const [
        specializationResult,
        diseaseResult,
        locationResult,
        sourceResult,
      ] = await Promise.all([
        supabase
          .from("doctor_specializations")
          .select(`
            id,
            notes,
            specialization:specializations (
              id,
              name,
              description
            )
          `)
          .eq("doctor_id", doctorId),

        supabase
          .from("doctor_diseases")
          .select(`
            id,
            notes,
            disease:diseases (
              id,
              name,
              slug,
              review_status
            )
          `)
          .eq("doctor_id", doctorId),

        supabase
          .from("doctor_locations")
          .select("*")
          .eq("doctor_id", doctorId)
          .eq("review_status", "verified")
          .order("is_primary", { ascending: false }),

        supabase
          .from("doctor_sources")
          .select(`
            id,
            source_name,
            source_type,
            source_title,
            source_url,
            source_checked_on
          `)
          .eq("doctor_id", doctorId)
          .order("created_at", { ascending: false }),
      ]);

      if (specializationResult.error) {
        throw specializationResult.error;
      }

      if (diseaseResult.error) {
        throw diseaseResult.error;
      }

      setSpecializations(
        (specializationResult.data || []).filter(
          (item) => item.specialization
        )
      );

      setDiseases(
        (diseaseResult.data || []).filter(
          (item) =>
            item.disease?.review_status === "verified"
        )
      );

      // Locations and source references are supplementary.
      // A permissions issue with either should not hide the doctor profile.
      if (locationResult.error) {
        console.error("Doctor locations:", locationResult.error);
        setLocations([]);
      } else {
        setLocations(locationResult.data || []);
      }

      if (sourceResult.error) {
        console.error("Doctor sources:", sourceResult.error);
        setSources([]);
      } else {
        setSources(sourceResult.data || []);
      }
    } catch (err) {
      console.error("Public doctor details error:", err);
      setError(
        err.message || "Unable to load this doctor profile."
      );
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoctorDetails();
  }, [fetchDoctorDetails]);

  if (loading) {
    return (
      <main className="doctor-details-state">
        <RefreshCw
          size={30}
          className="doctor-details-spinner"
        />
        <p>Loading verified doctor profile...</p>
      </main>
    );
  }

  if (error || !doctor) {
    return (
      <main className="doctor-details-state">
        <div className="doctor-details-state-icon">
          <AlertCircle size={30} />
        </div>

        <h2>Doctor Profile Unavailable</h2>
        <p>{error || "This doctor profile could not be found."}</p>

        <Link to="/doctors" className="doctor-details-back-button">
          <ArrowLeft size={17} />
          Back to Find Doctors
        </Link>
      </main>
    );
  }

  const websiteUrl = getSafeUrl(doctor.website_url);

  return (
    <main className="doctor-details-page">
      <div className="doctor-details-breadcrumb-bar">
        <div className="doctor-details-breadcrumb-inner">
          <Link to="/doctors" className="doctor-details-back-link">
            <ArrowLeft size={17} />
            Back to Find Doctors
          </Link>

          <div className="doctor-details-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/doctors">Doctors</Link>
            <span>/</span>
            <span>Doctor Profile</span>
          </div>
        </div>
      </div>

      <div className="doctor-details-container">
        {/* PROFILE HEADER */}

        <section className="doctor-details-hero">
          <div className="doctor-details-profile-image">
            {doctor.profile_image_url ? (
              <img
                src={doctor.profile_image_url}
                alt={doctor.full_name}
              />
            ) : (
              <UserRound size={55} />
            )}
          </div>

          <div className="doctor-details-profile-content">
            <div className="doctor-details-profile-badges">
              <span className="doctor-details-verified">
                <ShieldCheck size={15} />
                Verified Doctor
              </span>

              {doctor.consultation_mode && (
                <span className="doctor-details-mode">
                  {doctor.consultation_mode}
                </span>
              )}
            </div>

            <h1>{doctor.full_name}</h1>

            <p className="doctor-details-qualification">
              {doctor.qualifications ||
                "Professional qualifications not provided"}
            </p>

            <div className="doctor-details-hero-meta">
              <span>
                <BriefcaseMedical size={17} />
                {doctor.experience_years != null
                  ? `${doctor.experience_years} years of experience`
                  : "Experience not provided"}
              </span>

              {doctor.languages?.length > 0 && (
                <span>
                  <Globe size={17} />
                  {doctor.languages.join(", ")}
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="doctor-details-layout">
          <div className="doctor-details-main">
            {/* ABOUT */}

            <section className="doctor-details-card">
              <div className="doctor-details-section-title">
                <UserRound size={21} />
                <h2>About the Doctor</h2>
              </div>

              <p className="doctor-details-bio">
                {doctor.bio ||
                  "A professional biography has not been provided."}
              </p>
            </section>

            {/* SPECIALIZATIONS */}

            <section className="doctor-details-card">
              <div className="doctor-details-section-title">
                <Stethoscope size={21} />
                <h2>Medical Specializations</h2>
              </div>

              {specializations.length > 0 ? (
                <div className="doctor-details-specialization-list">
                  {specializations.map((item) => (
                    <article
                      className="doctor-details-specialization"
                      key={item.id}
                    >
                      <div className="doctor-details-small-icon">
                        <Stethoscope size={19} />
                      </div>

                      <div>
                        <h3>{item.specialization.name}</h3>

                        {item.specialization.description && (
                          <p>{item.specialization.description}</p>
                        )}

                        {item.notes && (
                          <small>{item.notes}</small>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="doctor-details-muted">
                  No specializations are currently listed.
                </p>
              )}
            </section>

            {/* DISEASES */}

            <section className="doctor-details-card">
              <div className="doctor-details-section-title">
                <CheckCircle2 size={21} />
                <h2>Associated Health Conditions</h2>
              </div>

              {diseases.length > 0 ? (
                <div className="doctor-details-disease-list">
                  {diseases.map((item) => (
                    <article
                      className="doctor-details-disease"
                      key={item.id}
                    >
                      <div>
                        <strong>{item.disease.name}</strong>

                        {item.notes && <p>{item.notes}</p>}
                      </div>

                      <Link
                        to={`/diseases/${
                          item.disease.slug || item.disease.id
                        }`}
                      >
                        View Disease
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="doctor-details-muted">
                  No verified disease associations are currently listed.
                </p>
              )}
            </section>

            {/* PRACTICE LOCATIONS */}

            <section className="doctor-details-card">
              <div className="doctor-details-section-title">
                <MapPin size={21} />
                <h2>Practice Locations</h2>
              </div>

              {locations.length > 0 ? (
                <div className="doctor-details-location-list">
                  {locations.map((location) => (
                    <article
                      className="doctor-details-location"
                      key={location.id}
                    >
                      <div className="doctor-details-location-icon">
                        <Building2 size={22} />
                      </div>

                      <div className="doctor-details-location-content">
                        <div className="doctor-details-location-heading">
                          <h3>
                            {location.clinic_name ||
                              "Practice Location"}
                          </h3>

                          {location.is_primary && (
                            <span>Primary Location</span>
                          )}
                        </div>

                        {location.address && (
                          <p>{location.address}</p>
                        )}

                        <p className="doctor-details-address">
                          {[
                            location.locality,
                            location.city,
                            location.state,
                            location.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Address not provided"}
                        </p>

                        {location.phone && (
                          <a href={`tel:${location.phone}`}>
                            <Phone size={15} />
                            {location.phone}
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="doctor-details-muted">
                  No verified practice locations are currently available.
                </p>
              )}
            </section>

            {/* PROFESSIONAL REGISTRATION */}

            <section className="doctor-details-card">
              <div className="doctor-details-section-title">
                <ShieldCheck size={21} />
                <h2>Professional Registration</h2>
              </div>

              <div className="doctor-details-registration-grid">
                <div>
                  <span>Registration Number</span>
                  <strong>
                    {doctor.registration_number || "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>Registration Council</span>
                  <strong>
                    {doctor.registration_council || "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>Registration State</span>
                  <strong>
                    {doctor.registration_state || "Not provided"}
                  </strong>
                </div>
              </div>
            </section>

            {/* VERIFICATION REFERENCES */}

            {sources.length > 0 && (
              <section className="doctor-details-card">
                <div className="doctor-details-section-title">
                  <CalendarDays size={21} />
                  <h2>Verification References</h2>
                </div>

                <div className="doctor-details-source-list">
                  {sources.map((source) => {
                    const sourceUrl = getSafeUrl(source.source_url);

                    return (
                      <article
                        className="doctor-details-source"
                        key={source.id}
                      >
                        <div>
                          <strong>
                            {source.source_name || "Reference"}
                          </strong>

                          {source.source_title && (
                            <p>{source.source_title}</p>
                          )}

                          {source.source_checked_on && (
                            <small>
                              Checked on:{" "}
                              {formatDate(source.source_checked_on)}
                            </small>
                          )}
                        </div>

                        {sourceUrl && (
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open Reference
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR */}

          <aside className="doctor-details-sidebar">
            <section className="doctor-details-contact-card">
              <div className="doctor-details-contact-heading">
                <h2>Contact Information</h2>
                <p>Available professional contact details</p>
              </div>

              {doctor.phone ? (
                <a
                  href={`tel:${doctor.phone}`}
                  className="doctor-details-contact-button"
                >
                  <Phone size={18} />
                  Call Doctor
                </a>
              ) : (
                <p className="doctor-details-contact-unavailable">
                  Phone number not available.
                </p>
              )}

              {doctor.email && (
                <a
                  href={`mailto:${doctor.email}`}
                  className="doctor-details-contact-item"
                >
                  <Mail size={18} />
                  <span>{doctor.email}</span>
                </a>
              )}

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doctor-details-contact-item"
                >
                  <Globe size={18} />
                  <span>Official Website</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </section>

            <section className="doctor-details-sidebar-card">
              <div className="doctor-details-section-title">
                <BriefcaseMedical size={20} />
                <h2>Consultation Information</h2>
              </div>

              <div className="doctor-details-consultation-row">
                <span>Consultation Fee</span>
                <strong>
                  {doctor.consultation_fee != null
                    ? `₹${Number(
                        doctor.consultation_fee
                      ).toLocaleString("en-IN")}`
                    : "Not provided"}
                </strong>
              </div>

              <div className="doctor-details-consultation-row">
                <span>Consultation Mode</span>
                <strong>
                  {doctor.consultation_mode || "Not provided"}
                </strong>
              </div>

              <div className="doctor-details-consultation-row">
                <span>Languages</span>
                <strong>
                  {doctor.languages?.length
                    ? doctor.languages.join(", ")
                    : "Not provided"}
                </strong>
              </div>

              {doctor.availability_notes && (
                <div className="doctor-details-availability">
                  <strong>Availability Information</strong>
                  <p>{doctor.availability_notes}</p>
                </div>
              )}
            </section>

            <section className="doctor-details-reviewed-card">
              <ShieldCheck size={22} />

              <div>
                <strong>Verified Profile</strong>
                <p>
                  This doctor profile is listed in VaxCare's
                  verified doctor directory.
                </p>

                {doctor.last_reviewed_at && (
                  <small>
                    Last reviewed:{" "}
                    {formatDate(doctor.last_reviewed_at)}
                  </small>
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className="doctor-details-disclaimer">
          <AlertCircle size={21} />

          <div>
            <strong>Important Information</strong>
            <p>
              VaxCare provides doctor profile information for discovery
              purposes. Profile verification does not guarantee
              availability, treatment outcomes or suitability for a
              particular condition. Confirm consultation details
              directly with the doctor or practice before visiting.
              For medical decisions, consult a qualified healthcare
              professional.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default DoctorDetails;
