
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminHospitalDetails.css";

const statusClass = (status) => {
  if (status === "verified") return "verified";
  if (status === "rejected") return "rejected";
  return "pending";
};

function AdminHospitalDetails() {
  const { id } = useParams();

  const [hospital, setHospital] = useState(null);
  const [locations, setLocations] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [sources, setSources] = useState([]);
  const [doctorAssociations, setDoctorAssociations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHospitalDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const hospitalId = Number(id);

      if (!Number.isInteger(hospitalId) || hospitalId <= 0) {
        throw new Error("Invalid hospital ID.");
      }

      const [
        hospitalResult,
        locationResult,
        specializationResult,
        sourceResult,
        associationResult,
      ] = await Promise.all([
        supabase
          .from("hospitals")
          .select("*")
          .eq("id", hospitalId)
          .single(),

        supabase
          .from("hospital_locations")
          .select("*")
          .eq("hospital_id", hospitalId)
          .order("is_primary", { ascending: false }),

        supabase
          .from("hospital_specializations")
          .select(`
            id,
            notes,
            specialization_id,
            specializations (
              id,
              name
            )
          `)
          .eq("hospital_id", hospitalId),

        supabase
          .from("hospital_sources")
          .select("*")
          .eq("hospital_id", hospitalId)
          .order("created_at", { ascending: false }),

        supabase
          .from("hospital_doctors")
          .select(`
            id,
            hospital_location_id,
            department,
            designation,
            review_status,
            doctors (
              id,
              full_name,
              qualifications,
              slug,
              review_status
            )
          `)
          .eq("hospital_id", hospitalId)
          .order("created_at", { ascending: false }),
      ]);

      if (hospitalResult.error) throw hospitalResult.error;
      if (locationResult.error) throw locationResult.error;
      if (specializationResult.error) throw specializationResult.error;
      if (sourceResult.error) throw sourceResult.error;
      if (associationResult.error) throw associationResult.error;

      setHospital(hospitalResult.data);
      setLocations(locationResult.data || []);
      setSpecializations(specializationResult.data || []);
      setSources(sourceResult.data || []);
      setDoctorAssociations(associationResult.data || []);
    } catch (err) {
      console.error("Hospital details error:", err);
      setError(err.message || "Unable to load hospital details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHospitalDetails();
  }, [fetchHospitalDetails]);

  const updateHospitalStatus = async (status) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this hospital?`
    );

    if (!confirmed) return;

    try {
      setActionLoading("hospital");
      setError("");
      setSuccess("");

      const { error: updateError } = await supabase
        .from("hospitals")
        .update({
          review_status: status,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", hospital.id);

      if (updateError) throw updateError;

      setSuccess(`Hospital ${status} successfully.`);
      await fetchHospitalDetails();
    } catch (err) {
      setError(err.message || "Unable to update hospital status.");
    } finally {
      setActionLoading("");
    }
  };

  const updateLocationStatus = async (locationId, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this location?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(`location-${locationId}`);
      setError("");
      setSuccess("");

      const { error: updateError } = await supabase
        .from("hospital_locations")
        .update({ review_status: status })
        .eq("id", locationId)
        .eq("hospital_id", hospital.id);

      if (updateError) throw updateError;

      setSuccess(`Location ${status} successfully.`);
      await fetchHospitalDetails();
    } catch (err) {
      setError(err.message || "Unable to update location.");
    } finally {
      setActionLoading("");
    }
  };

  const updateAssociationStatus = async (associationId, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this doctor association?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(`association-${associationId}`);
      setError("");
      setSuccess("");

      const { error: updateError } = await supabase
        .from("hospital_doctors")
        .update({ review_status: status })
        .eq("id", associationId)
        .eq("hospital_id", hospital.id);

      if (updateError) throw updateError;

      setSuccess(`Doctor association ${status} successfully.`);
      await fetchHospitalDetails();
    } catch (err) {
      setError(err.message || "Unable to update doctor association.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="admin-hospital-details-page">
        <p className="hospital-details-loading">
          Loading hospital details...
        </p>
      </div>
    );
  }

  if (error && !hospital) {
    return (
      <div className="admin-hospital-details-page">
        <Link to="/admin/hospitals" className="hospital-details-back">
          ← Back to Hospitals
        </Link>
        <div className="hospital-details-error">{error}</div>
      </div>
    );
  }

  if (!hospital) return null;

  return (
    <div className="admin-hospital-details-page">
      <div className="hospital-details-container">
        <Link to="/admin/hospitals" className="hospital-details-back">
          ← Back to Hospitals
        </Link>

        <header className="hospital-details-header">
          <div>
            <p className="hospital-details-eyebrow">
              HOSPITAL MANAGEMENT
            </p>

            <h1>{hospital.name}</h1>

            <p>
              Review hospital information, locations, evidence and
              connected doctors.
            </p>
          </div>

          <span className={`hospital-details-status ${statusClass(hospital.review_status)}`}>
            {hospital.review_status}
          </span>
        </header>

        {error && (
          <div className="hospital-details-error">{error}</div>
        )}

        {success && (
          <div className="hospital-details-success">{success}</div>
        )}

        {/* HOSPITAL INFORMATION */}

        <section className="hospital-details-card">
          <div className="hospital-details-section-heading">
            <h2>Hospital Information</h2>

            <span className={`hospital-details-status ${statusClass(hospital.review_status)}`}>
              {hospital.review_status}
            </span>
          </div>

          {hospital.logo_url && (
            <img
              src={hospital.logo_url}
              alt={`${hospital.name} logo`}
              className="hospital-details-logo"
            />
          )}

          <div className="hospital-details-grid">
            <div>
              <span>Hospital Name</span>
              <strong>{hospital.name}</strong>
            </div>

            <div>
              <span>Hospital Type</span>
              <strong>{hospital.hospital_type || "Not provided"}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{hospital.phone || "Not provided"}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{hospital.email || "Not provided"}</strong>
            </div>

            <div>
              <span>Website</span>
              {hospital.website_url ? (
                <a href={hospital.website_url} target="_blank" rel="noreferrer">
                  Visit website
                </a>
              ) : (
                <strong>Not provided</strong>
              )}
            </div>

            <div>
              <span>Established Year</span>
              <strong>{hospital.established_year || "Not provided"}</strong>
            </div>

            <div>
              <span>Languages</span>
              <strong>
                {hospital.languages?.length
                  ? hospital.languages.join(", ")
                  : "Not provided"}
              </strong>
            </div>

            <div>
              <span>Facilities</span>
              <strong>
                {hospital.facilities?.length
                  ? hospital.facilities.join(", ")
                  : "Not provided"}
              </strong>
            </div>
          </div>

          <div className="hospital-details-description">
            <span>Description</span>
            <p>{hospital.description || "No description provided."}</p>
          </div>

          <div className="hospital-details-actions">
            <button
              type="button"
              className="hospital-details-verify"
              disabled={
                hospital.review_status === "verified" ||
                actionLoading === "hospital"
              }
              onClick={() => updateHospitalStatus("verified")}
            >
              {actionLoading === "hospital" ? "Updating..." : "Verify Hospital"}
            </button>

            <button
              type="button"
              className="hospital-details-reject"
              disabled={
                hospital.review_status === "rejected" ||
                actionLoading === "hospital"
              }
              onClick={() => updateHospitalStatus("rejected")}
            >
              Reject Hospital
            </button>
          </div>
        </section>

        {/* LOCATIONS */}

        <section className="hospital-details-card">
          <h2>Hospital Locations / Branches</h2>

          {locations.length === 0 ? (
            <p className="hospital-details-empty">
              No locations have been added.
            </p>
          ) : (
            locations.map((location) => (
              <div className="hospital-details-item" key={location.id}>
                <div className="hospital-details-item-heading">
                  <h3>
                    {location.branch_name || location.clinic_name || hospital.name}
                    {location.is_primary && " (Primary)"}
                  </h3>

                  <span className={`hospital-details-status ${statusClass(location.review_status)}`}>
                    {location.review_status}
                  </span>
                </div>

                <p>
                  {location.address}, {location.locality}, {location.city},
                  {" "}{location.state} - {location.pincode}
                </p>

                {(location.latitude !== null && location.longitude !== null) && (
                  <p>
                    Coordinates: {location.latitude}, {location.longitude}
                  </p>
                )}

                <div className="hospital-details-actions">
                  <button
                    type="button"
                    className="hospital-details-verify"
                    disabled={
                      location.review_status === "verified" ||
                      actionLoading === `location-${location.id}`
                    }
                    onClick={() =>
                      updateLocationStatus(location.id, "verified")
                    }
                  >
                    Verify Location
                  </button>

                  <button
                    type="button"
                    className="hospital-details-reject"
                    disabled={
                      location.review_status === "rejected" ||
                      actionLoading === `location-${location.id}`
                    }
                    onClick={() =>
                      updateLocationStatus(location.id, "rejected")
                    }
                  >
                    Reject Location
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* SPECIALIZATIONS */}

        <section className="hospital-details-card">
          <h2>Specializations</h2>

          {specializations.length === 0 ? (
            <p className="hospital-details-empty">
              No specializations added.
            </p>
          ) : (
            <div className="hospital-details-tags">
              {specializations.map((item) => (
                <span key={item.id}>
                  {item.specializations?.name || "Specialization"}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* SOURCES */}

        <section className="hospital-details-card">
          <h2>Supporting Evidence / Sources</h2>

          {sources.length === 0 ? (
            <p className="hospital-details-empty">
              No supporting sources added.
            </p>
          ) : (
            sources.map((source) => (
              <div className="hospital-details-item" key={source.id}>
                <h3>{source.source_name}</h3>

                {source.source_title && <p>{source.source_title}</p>}

                <p>
                  Source type: {source.source_type}
                </p>

                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open supporting source
                </a>

                {source.evidence_note && (
                  <p>{source.evidence_note}</p>
                )}

                <small>
                  Checked on: {source.source_checked_on || "Not recorded"}
                </small>
              </div>
            ))
          )}
        </section>

        {/* CONNECTED DOCTORS */}

        <section className="hospital-details-card">
          <h2>Associated Doctors</h2>

          {doctorAssociations.length === 0 ? (
            <p className="hospital-details-empty">
              No doctors associated with this hospital yet.
            </p>
          ) : (
            doctorAssociations.map((association) => (
              <div className="hospital-details-item" key={association.id}>
                <div className="hospital-details-item-heading">
                  <div>
                    <h3>
                      {association.doctors?.full_name || "Doctor"}
                    </h3>

                    <p>
                      {association.doctors?.qualifications || "Qualifications not provided"}
                    </p>
                  </div>

                  <span className={`hospital-details-status ${statusClass(association.review_status)}`}>
                    {association.review_status}
                  </span>
                </div>

                <p>
                  Department: {association.department || "Not provided"}
                </p>

                <p>
                  Designation: {association.designation || "Not provided"}
                </p>

                <p>
                  Doctor verification:{" "}
                  {association.doctors?.review_status || "Unknown"}
                </p>

                <div className="hospital-details-actions">
                  <button
                    type="button"
                    className="hospital-details-verify"
                    disabled={
                      association.review_status === "verified" ||
                      association.doctors?.review_status !== "verified" ||
                      actionLoading === `association-${association.id}`
                    }
                    onClick={() =>
                      updateAssociationStatus(association.id, "verified")
                    }
                  >
                    Verify Association
                  </button>

                  <button
                    type="button"
                    className="hospital-details-reject"
                    disabled={
                      association.review_status === "rejected" ||
                      actionLoading === `association-${association.id}`
                    }
                    onClick={() =>
                      updateAssociationStatus(association.id, "rejected")
                    }
                  >
                    Reject Association
                  </button>
                </div>

                {association.doctors?.review_status !== "verified" && (
                  <p className="hospital-details-note">
                    This doctor must be verified before the association can be approved.
                  </p>
                )}
              </div>
            ))
          )}
        </section>

        <div className="hospital-details-footer">
          <Link to="/admin/hospitals">
            Back to Hospital Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminHospitalDetails;
