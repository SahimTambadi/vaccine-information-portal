
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  CalendarDays,
  Languages,
  Stethoscope,
  UserRound,
  Navigation,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "./HospitalDetails.css";

function HospitalDetails() {
  const { slug } = useParams();

  const [hospital, setHospital] = useState(null);
  const [locations, setLocations] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHospitalDetails();
  }, [slug]);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const { data: hospitalData, error: hospitalError } =
        await supabase
          .from("hospital_public_catalog")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

      if (hospitalError) throw hospitalError;

      if (!hospitalData) {
        setHospital(null);
        setError("Hospital not found or not currently available.");
        return;
      }

      setHospital(hospitalData);

      const [
        locationsResult,
        specializationsResult,
        doctorsResult,
      ] = await Promise.all([
        supabase
          .from("hospital_locations")
          .select("*")
          .eq("hospital_id", hospitalData.id)
          .eq("review_status", "verified")
          .order("is_primary", { ascending: false }),

        supabase
          .from("hospital_specializations")
          .select(`
            id,
            notes,
            specializations (
              id,
              name
            )
          `)
          .eq("hospital_id", hospitalData.id),

        supabase
          .from("hospital_doctors")
          .select(`
            id,
            department,
            designation,
            hospital_location_id,
            doctors (
              id,
              full_name,
              slug,
              qualifications,
              experience_years,
              profile_image_url
            )
          `)
          .eq("hospital_id", hospitalData.id)
          .eq("review_status", "verified"),
      ]);

      if (locationsResult.error) throw locationsResult.error;
      if (specializationsResult.error) throw specializationsResult.error;
      if (doctorsResult.error) throw doctorsResult.error;

      setLocations(locationsResult.data || []);

      setSpecializations(
        (specializationsResult.data || []).filter(
          (item) => item.specializations
        )
      );

      setDoctors(
        (doctorsResult.data || []).filter(
          (item) => item.doctors
        )
      );
    } catch (err) {
      console.error("Hospital details error:", err);
      setError("Unable to load hospital details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hospital-details-state">
        <LoaderCircle size={32} className="hospital-loading-icon" />
        <p>Loading hospital information...</p>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="hospital-details-page">
        <Link to="/hospitals" className="hospital-back-link">
          <ArrowLeft size={17} />
          Back to Hospitals
        </Link>

        <div className="hospital-details-state hospital-details-error">
          <AlertCircle size={34} />
          <h2>Hospital unavailable</h2>
          <p>{error || "The requested hospital could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hospital-details-page">
      <Link to="/hospitals" className="hospital-back-link">
        <ArrowLeft size={17} />
        Back to Hospitals
      </Link>

      {/* HOSPITAL HEADER */}

      <section className="hospital-profile-header">
        <div className="hospital-profile-logo">
          {hospital.logo_url ? (
            <img
              src={hospital.logo_url}
              alt={`${hospital.name} logo`}
            />
          ) : (
            <Building2 size={42} />
          )}
        </div>

        <div className="hospital-profile-heading">
          <span className="hospital-profile-type">
            {hospital.hospital_type || "Hospital"}
          </span>

          <h1>{hospital.name}</h1>

          {hospital.description && (
            <p>{hospital.description}</p>
          )}
        </div>
      </section>

      {/* QUICK INFORMATION */}

      <section className="hospital-overview-grid">
        {hospital.phone && (
          <div className="hospital-overview-card">
            <Phone size={20} />
            <div>
              <span>Contact Number</span>
              <a href={`tel:${hospital.phone}`}>
                {hospital.phone}
              </a>
            </div>
          </div>
        )}

        {hospital.email && (
          <div className="hospital-overview-card">
            <Mail size={20} />
            <div>
              <span>Email Address</span>
              <a href={`mailto:${hospital.email}`}>
                {hospital.email}
              </a>
            </div>
          </div>
        )}

        {hospital.website_url && (
          <div className="hospital-overview-card">
            <Globe size={20} />
            <div>
              <span>Official Website</span>
              <a
                href={hospital.website_url}
                target="_blank"
                rel="noreferrer"
              >
                Visit Website
              </a>
            </div>
          </div>
        )}

        {hospital.established_year && (
          <div className="hospital-overview-card">
            <CalendarDays size={20} />
            <div>
              <span>Established</span>
              <strong>{hospital.established_year}</strong>
            </div>
          </div>
        )}
      </section>

      {/* FACILITIES */}

      {hospital.facilities?.length > 0 && (
        <section className="hospital-details-section">
          <div className="hospital-section-heading">
            <Building2 size={21} />
            <h2>Facilities</h2>
          </div>

          <div className="hospital-tag-list">
            {hospital.facilities.map((facility, index) => (
              <span key={`${facility}-${index}`}>
                {facility}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* SPECIALIZATIONS */}

      <section className="hospital-details-section">
        <div className="hospital-section-heading">
          <Stethoscope size={21} />
          <h2>Medical Specializations</h2>
        </div>

        {specializations.length > 0 ? (
          <div className="hospital-specialization-grid">
            {specializations.map((item) => (
              <div
                className="hospital-specialization-card"
                key={item.id}
              >
                <Stethoscope size={18} />
                <div>
                  <strong>{item.specializations.name}</strong>
                  {item.notes && <p>{item.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="hospital-section-empty">
            Specialization information is not available yet.
          </p>
        )}
      </section>

      {/* HOSPITAL LOCATIONS */}

      <section className="hospital-details-section">
        <div className="hospital-section-heading">
          <MapPin size={21} />
          <h2>Hospital Locations</h2>
        </div>

        {locations.length > 0 ? (
          <div className="hospital-location-grid">
            {locations.map((location) => {
              const address = [
                location.address,
                location.locality,
                location.city,
                location.state,
                location.pincode,
              ]
                .filter(Boolean)
                .join(", ");

              const hasCoordinates =
                location.latitude !== null &&
                location.longitude !== null;

              const mapUrl = hasCoordinates
                ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

              return (
                <div
                  className="hospital-location-card"
                  key={location.id}
                >
                  <div className="hospital-location-title">
                    <Building2 size={20} />
                    <div>
                      <h3>
                        {location.branch_name || hospital.name}
                      </h3>

                      {location.is_primary && (
                        <span className="hospital-primary-label">
                          Main Branch
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="hospital-location-address">
                    <MapPin size={17} />
                    {address}
                  </p>

                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hospital-map-link"
                  >
                    <Navigation size={16} />
                    View on Map
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="hospital-section-empty">
            Verified location information is not available yet.
          </p>
        )}
      </section>

      {/* ASSOCIATED DOCTORS */}

      <section className="hospital-details-section">
        <div className="hospital-section-heading">
          <UserRound size={21} />
          <h2>Doctors at this Hospital</h2>
        </div>

        {doctors.length > 0 ? (
          <div className="hospital-doctors-grid">
            {doctors.map((item) => {
              const doctor = item.doctors;

              return (
                <div
                  className="hospital-doctor-card"
                  key={item.id}
                >
                  <div className="hospital-doctor-avatar">
                    {doctor.profile_image_url ? (
                      <img
                        src={doctor.profile_image_url}
                        alt={doctor.full_name}
                      />
                    ) : (
                      <UserRound size={30} />
                    )}
                  </div>

                  <div className="hospital-doctor-info">
                    <h3>{doctor.full_name}</h3>

                    {doctor.qualifications && (
                      <p>{doctor.qualifications}</p>
                    )}

                    {item.designation && (
                      <span>{item.designation}</span>
                    )}

                    {item.department && (
                      <small>{item.department}</small>
                    )}

                    {doctor.experience_years !== null && (
                      <small>
                        {doctor.experience_years} years of experience
                      </small>
                    )}

                    <Link
                      to={`/doctors/${doctor.slug}`}
                      className="hospital-doctor-link"
                    >
                      View Doctor Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="hospital-section-empty">
            Verified doctor associations are not available yet.
          </p>
        )}
      </section>

      {/* LANGUAGES */}

      {hospital.languages?.length > 0 && (
        <section className="hospital-details-section">
          <div className="hospital-section-heading">
            <Languages size={21} />
            <h2>Languages</h2>
          </div>

          <div className="hospital-tag-list">
            {hospital.languages.map((language, index) => (
              <span key={`${language}-${index}`}>
                {language}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default HospitalDetails;

