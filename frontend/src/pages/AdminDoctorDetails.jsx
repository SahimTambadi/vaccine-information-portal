
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Stethoscope,
  Building2,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "./AdminDoctorDetails.css";

function AdminDoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [sources, setSources] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDoctorDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const doctorId = Number(id);

      if (!Number.isInteger(doctorId) || doctorId <= 0) {
        throw new Error("Invalid doctor ID.");
      }

      const [
        doctorResult,
        specializationResult,
        diseaseResult,
        sourceResult,
        locationResult,
      ] = await Promise.all([
        supabase
          .from("doctors")
          .select("*")
          .eq("id", doctorId)
          .maybeSingle(),

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
              review_status
            )
          `)
          .eq("doctor_id", doctorId),

        supabase
          .from("doctor_sources")
          .select("*")
          .eq("doctor_id", doctorId)
          .order("created_at", { ascending: false }),

        supabase
          .from("doctor_locations")
          .select("*")
          .eq("doctor_id", doctorId)
          .order("is_primary", { ascending: false }),
      ]);

      const results = [
        doctorResult,
        specializationResult,
        diseaseResult,
        sourceResult,
        locationResult,
      ];

      const failedResult = results.find((result) => result.error);

      if (failedResult) {
        throw failedResult.error;
      }

      if (!doctorResult.data) {
        throw new Error("Doctor record not found.");
      }

      setDoctor(doctorResult.data);
      setSpecializations(specializationResult.data || []);
      setDiseases(diseaseResult.data || []);
      setSources(sourceResult.data || []);
      setLocations(locationResult.data || []);
    } catch (err) {
      console.error("Doctor details loading error:", err);
      setError(err.message || "Unable to load doctor details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoctorDetails();
  }, [fetchDoctorDetails]);

  const updateDoctorStatus = async (status) => {
    if (!doctor) return;

    const actionLabel =
      status === "verified" ? "verify" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} this doctor?`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("doctors")
        .update({
          review_status: status,
          last_reviewed_at: new Date().toISOString().slice(0, 10),
          updated_at: new Date().toISOString(),
        })
        .eq("id", doctor.id);

      if (updateError) throw updateError;

      setDoctor((current) => ({
        ...current,
        review_status: status,
        last_reviewed_at: new Date().toISOString().slice(0, 10),
      }));
    } catch (err) {
      console.error("Doctor status update error:", err);
      setError(err.message || "Unable to update doctor status.");
    } finally {
      setActionLoading(false);
    }
  };

  const updateLocationStatus = async (locationId, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this practice location as ${status}?`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("doctor_locations")
        .update({
          review_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", locationId);

      if (updateError) throw updateError;

      await fetchDoctorDetails();
    } catch (err) {
      console.error("Location status update error:", err);
      setError(err.message || "Unable to update practice location.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteDoctor = async () => {
    if (!doctor) return;

    const confirmed = window.confirm(
      `Permanently delete ${doctor.full_name}? This will also delete the doctor's linked specializations, diseases, sources and locations.`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("doctors")
        .delete()
        .eq("id", doctor.id);

      if (deleteError) throw deleteError;

      navigate("/admin/doctors");
    } catch (err) {
      console.error("Doctor deletion error:", err);
      setError(err.message || "Unable to delete doctor.");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="admin-doctor-details-page">
        <div className="admin-doctor-details-message">
          <RefreshCw size={22} className="doctor-spin" />
          <p>Loading doctor information...</p>
        </div>
      </main>
    );
  }

  if (error && !doctor) {
    return (
      <main className="admin-doctor-details-page">
        <Link to="/admin/doctors" className="doctor-back-link">
          <ArrowLeft size={17} />
          Back to Doctor Management
        </Link>

        <div className="admin-doctor-details-error">
          <h2>Unable to load doctor</h2>
          <p>{error}</p>
          <button onClick={fetchDoctorDetails}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!doctor) return null;

  return (
    <main className="admin-doctor-details-page">

      {/* HEADER */}

      <div className="admin-doctor-details-header">
        <Link to="/admin/doctors" className="doctor-back-link">
          <ArrowLeft size={17} />
          Back to Doctor Management
        </Link>

        <div className="admin-doctor-details-heading">
          <div>
            <span className="admin-doctor-details-eyebrow">
              DOCTOR VERIFICATION
            </span>

            <h1>Doctor Profile Review</h1>

            <p>
              Review professional details, source evidence and
              practice locations before approving this profile.
            </p>
          </div>

          <span
            className={`doctor-review-status status-${doctor.review_status}`}
          >
            {doctor.review_status}
          </span>
        </div>
      </div>

      {error && (
        <div className="doctor-details-alert">
          {error}
        </div>
      )}

      {/* PROFILE */}

      <section className="doctor-details-card doctor-profile-card">
        <div className="doctor-profile-top">
          <div className="doctor-profile-avatar">
            {doctor.profile_image_url ? (
              <img
                src={doctor.profile_image_url}
                alt={doctor.full_name}
              />
            ) : (
              <Stethoscope size={38} />
            )}
          </div>

          <div className="doctor-profile-heading">
            <h2>{doctor.full_name}</h2>

            <p>
              {doctor.qualifications || "Qualifications not provided"}
            </p>

            <span>
              <ShieldCheck size={15} />
              Current status: {doctor.review_status}
            </span>
          </div>
        </div>

        <div className="doctor-details-grid">

          <div>
            <label>Experience</label>
            <p>
              {doctor.experience_years != null
                ? `${doctor.experience_years} years`
                : "Not provided"}
            </p>
          </div>

          <div>
            <label>Registration Number</label>
            <p>{doctor.registration_number || "Not provided"}</p>
          </div>

          <div>
            <label>Registration Council</label>
            <p>{doctor.registration_council || "Not provided"}</p>
          </div>

          <div>
            <label>Registration State</label>
            <p>{doctor.registration_state || "Not provided"}</p>
          </div>

          <div>
            <label>Consultation Fee</label>
            <p>
              {doctor.consultation_fee != null
                ? `₹${doctor.consultation_fee}`
                : "Not provided"}
            </p>
          </div>

          <div>
            <label>Consultation Mode</label>
            <p>{doctor.consultation_mode || "Not provided"}</p>
          </div>

          <div>
            <label>Phone</label>
            <p>
              {doctor.phone ? (
                <a href={`tel:${doctor.phone}`}>
                  <Phone size={14} />
                  {doctor.phone}
                </a>
              ) : "Not provided"}
            </p>
          </div>

          <div>
            <label>Email</label>
            <p>
              {doctor.email ? (
                <a href={`mailto:${doctor.email}`}>
                  <Mail size={14} />
                  {doctor.email}
                </a>
              ) : "Not provided"}
            </p>
          </div>

          <div>
            <label>Website</label>
            <p>
              {doctor.website_url ? (
                <a
                  href={doctor.website_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit website <ExternalLink size={13} />
                </a>
              ) : "Not provided"}
            </p>
          </div>

          <div>
            <label>Languages</label>
            <p>
              {doctor.languages?.length
                ? doctor.languages.join(", ")
                : "Not provided"}
            </p>
          </div>

        </div>

        <div className="doctor-details-description">
          <label>Professional Biography</label>
          <p>{doctor.bio || "No biography provided."}</p>
        </div>

        <div className="doctor-details-description">
          <label>Availability Notes</label>
          <p>{doctor.availability_notes || "Not provided."}</p>
        </div>
      </section>

      {/* SPECIALIZATIONS */}

      <section className="doctor-details-card">
        <div className="doctor-details-section-heading">
          <Stethoscope size={20} />
          <h2>Medical Specializations</h2>
        </div>

        {specializations.length ? (
          <div className="doctor-details-tags">
            {specializations.map((item) => (
              <div className="doctor-details-tag" key={item.id}>
                <strong>
                  {item.specialization?.name || "Unknown specialization"}
                </strong>

                {item.notes && <p>{item.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="doctor-details-muted">
            No specializations linked.
          </p>
        )}
      </section>

      {/* DISEASES */}

      <section className="doctor-details-card">
        <div className="doctor-details-section-heading">
          <CheckCircle size={20} />
          <h2>Associated Diseases</h2>
        </div>

        {diseases.length ? (
          <div className="doctor-details-tags">
            {diseases.map((item) => (
              <div className="doctor-details-tag" key={item.id}>
                <strong>
                  {item.disease?.name || "Unknown disease"}
                </strong>

                {item.disease?.review_status && (
                  <small>
                    Disease status: {item.disease.review_status}
                  </small>
                )}

                {item.notes && <p>{item.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="doctor-details-muted">
            No disease associations linked.
          </p>
        )}
      </section>

      {/* PRACTICE LOCATIONS */}

      <section className="doctor-details-card">
        <div className="doctor-details-section-heading">
          <MapPin size={20} />
          <h2>Practice Locations</h2>
        </div>

        {locations.length ? (
          <div className="doctor-location-list">
            {locations.map((location) => (
              <article
                className="doctor-location-item"
                key={location.id}
              >
                <div>
                  <h3>
                    {location.clinic_name || "Practice location"}
                    {location.is_primary && (
                      <span className="doctor-primary-label">
                        Primary
                      </span>
                    )}
                  </h3>

                  <p>{location.address}</p>

                  <p>
                    {location.locality}, {location.city},{" "}
                    {location.state} - {location.pincode}
                  </p>

                  <span
                    className={`doctor-review-status status-${location.review_status}`}
                  >
                    {location.review_status}
                  </span>
                </div>

                <div className="doctor-location-actions">
                  {location.review_status !== "verified" && (
                    <button
                      className="doctor-verify-small"
                      disabled={actionLoading}
                      onClick={() =>
                        updateLocationStatus(location.id, "verified")
                      }
                    >
                      Verify Location
                    </button>
                  )}

                  {location.review_status !== "rejected" && (
                    <button
                      className="doctor-reject-small"
                      disabled={actionLoading}
                      onClick={() =>
                        updateLocationStatus(location.id, "rejected")
                      }
                    >
                      Reject Location
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="doctor-details-muted">
            No practice locations provided.
          </p>
        )}
      </section>

      {/* SOURCES */}

      <section className="doctor-details-card">
        <div className="doctor-details-section-heading">
          <Building2 size={20} />
          <h2>Verification Sources</h2>
        </div>

        {sources.length ? (
          <div className="doctor-source-list">
            {sources.map((source) => (
              <article key={source.id} className="doctor-source-item">
                <div>
                  <h3>{source.source_name}</h3>

                  <p>{source.source_title || "Reference"}</p>

                  <p>
                    Source type: {source.source_type}
                  </p>

                  {source.evidence_note && (
                    <p>{source.evidence_note}</p>
                  )}

                  <small>
                    Checked on: {source.source_checked_on || "Not recorded"}
                  </small>
                </div>

                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open source <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <p className="doctor-details-muted">
            No verification sources provided. Do not verify this
            profile until reliable evidence is added.
          </p>
        )}
      </section>

      {/* REVIEW ACTIONS */}

      <section className="doctor-details-card doctor-review-actions-card">
        <div>
          <h2>Verification Decision</h2>

          <p>
            Verify only after checking professional registration,
            qualifications, source evidence and practice details.
          </p>
        </div>

        <div className="doctor-review-actions">

          {doctor.review_status !== "verified" && (
            <button
              className="doctor-verify-button"
              disabled={actionLoading || sources.length === 0}
              title={
                sources.length === 0
                  ? "Add a verification source before approving."
                  : ""
              }
              onClick={() => updateDoctorStatus("verified")}
            >
              <CheckCircle size={17} />
              Verify Doctor
            </button>
          )}

          {doctor.review_status !== "rejected" && (
            <button
              className="doctor-reject-button"
              disabled={actionLoading}
              onClick={() => updateDoctorStatus("rejected")}
            >
              <XCircle size={17} />
              Reject Doctor
            </button>
          )}

          <button
            className="doctor-delete-button"
            disabled={actionLoading}
            onClick={deleteDoctor}
          >
            <Trash2 size={17} />
            Delete Doctor
          </button>

        </div>

        {sources.length === 0 && doctor.review_status !== "verified" && (
          <p className="doctor-verification-warning">
            A verification source is required before this profile can be approved.
          </p>
        )}

        {actionLoading && (
          <p className="doctor-details-muted">
            Processing your request...
          </p>
        )}

      </section>

      <div className="doctor-details-footer">
        <Link to="/admin/doctors">
          <ArrowLeft size={16} />
          Back to Doctor Management
        </Link>
      </div>

    </main>
  );
}

export default AdminDoctorDetails;
