
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Stethoscope,
  Phone,
  UserRound,
  BriefcaseMedical,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "./Doctors.css";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [diseases, setDiseases] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        doctorsResult,
        specializationsResult,
        diseasesResult,
      ] = await Promise.all([
        supabase
          .from("doctor_public_catalog")
          .select("*")
          .order("full_name"),

        supabase
          .from("specializations")
          .select("id, name")
          .order("name"),

        supabase
          .from("disease_public_catalog")
          .select("id, name")
          .order("name"),
      ]);

      if (doctorsResult.error) throw doctorsResult.error;
      if (specializationsResult.error) throw specializationsResult.error;
      if (diseasesResult.error) throw diseasesResult.error;

      const doctorRecords = doctorsResult.data || [];

      if (doctorRecords.length > 0) {
        const doctorIds = doctorRecords.map((doctor) => doctor.id);

        const [
          doctorSpecializationsResult,
          doctorDiseasesResult,
        ] = await Promise.all([
          supabase
            .from("doctor_specializations")
            .select(`
              doctor_id,
              specialization_id,
              specializations (
                id,
                name
              )
            `)
            .in("doctor_id", doctorIds),

          supabase
            .from("doctor_diseases")
            .select(`
              doctor_id,
              disease_id,
              diseases (
                id,
                name,
                review_status
              )
            `)
            .in("doctor_id", doctorIds),
        ]);

        if (doctorSpecializationsResult.error) {
          throw doctorSpecializationsResult.error;
        }

        if (doctorDiseasesResult.error) {
          throw doctorDiseasesResult.error;
        }

        const specializationMap = new Map();
        const diseaseMap = new Map();

        (doctorSpecializationsResult.data || []).forEach((item) => {
          const current = specializationMap.get(item.doctor_id) || [];

          if (item.specializations) {
            current.push(item.specializations);
          }

          specializationMap.set(item.doctor_id, current);
        });

        (doctorDiseasesResult.data || []).forEach((item) => {
          const current = diseaseMap.get(item.doctor_id) || [];

          if (
            item.diseases &&
            item.diseases.review_status === "verified"
          ) {
            current.push(item.diseases);
          }

          diseaseMap.set(item.doctor_id, current);
        });

        setDoctors(
          doctorRecords.map((doctor) => ({
            ...doctor,
            specializations:
              specializationMap.get(doctor.id) || [],
            diseases: diseaseMap.get(doctor.id) || [],
          }))
        );
      } else {
        setDoctors([]);
      }

      setSpecializations(specializationsResult.data || []);
      setDiseases(diseasesResult.data || []);
    } catch (err) {
      console.error("Doctor directory error:", err);
      setError(
        err.message ||
        "Unable to load doctors. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  const filteredDoctors = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !searchTerm ||
        doctor.full_name?.toLowerCase().includes(searchTerm) ||
        doctor.qualifications?.toLowerCase().includes(searchTerm) ||
        doctor.specializations.some((item) =>
          item.name?.toLowerCase().includes(searchTerm)
        );

      const matchesSpecialization =
        !selectedSpecialization ||
        doctor.specializations.some(
          (item) =>
            String(item.id) === selectedSpecialization
        );

      const matchesDisease =
        !selectedDisease ||
        doctor.diseases.some(
          (item) =>
            String(item.id) === selectedDisease
        );

      return (
        matchesSearch &&
        matchesSpecialization &&
        matchesDisease
      );
    });
  }, [
    doctors,
    search,
    selectedSpecialization,
    selectedDisease,
  ]);

  return (
    <main className="doctors-page">
      <section className="doctors-hero">
        <div className="doctors-hero-content">
          <span className="doctors-eyebrow">
            VAXCARE HEALTHCARE DIRECTORY
          </span>

          <h1>
            Find the Right
            <span> Doctor for You.</span>
          </h1>

          <p>
            Discover verified doctors and healthcare specialists.
            Search by name, medical specialization or disease.
          </p>

          <div className="doctors-hero-note">
            <Stethoscope size={19} />
            Explore verified professional profiles
          </div>
        </div>

        <div className="doctors-hero-visual">
          <div className="doctors-hero-icon">
            <Stethoscope size={76} />
          </div>
        </div>
      </section>

      <section className="doctors-search-section">
        <div className="doctors-section-heading">
          <span className="doctors-eyebrow">
            DOCTOR DISCOVERY
          </span>

          <h2>Find a Healthcare Specialist</h2>

          <p>
            Search for a doctor or narrow your results using
            medical specializations and diseases.
          </p>
        </div>

        <div className="doctors-filter-panel">
          <div className="doctors-search-field">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search doctor name or specialization..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="doctors-filter-fields">
            <div className="doctors-filter-group">
              <label htmlFor="doctor-specialization">
                Medical Specialization
              </label>

              <select
                id="doctor-specialization"
                value={selectedSpecialization}
                onChange={(event) =>
                  setSelectedSpecialization(event.target.value)
                }
              >
                <option value="">All Specializations</option>

                {specializations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="doctors-filter-group">
              <label htmlFor="doctor-disease">
                Find Doctors by Disease
              </label>

              <select
                id="doctor-disease"
                value={selectedDisease}
                onChange={(event) =>
                  setSelectedDisease(event.target.value)
                }
              >
                <option value="">All Diseases</option>

                {diseases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="doctors-reset-button"
            onClick={() => {
              setSearch("");
              setSelectedSpecialization("");
              setSelectedDisease("");
            }}
          >
            Clear Filters
          </button>
        </div>
      </section>

      <section className="doctors-results-section">
        <div className="doctors-results-heading">
          <div>
            <span className="doctors-eyebrow">
              VERIFIED DIRECTORY
            </span>

            <h2>Available Doctors</h2>
          </div>

          <span className="doctors-results-count">
            {loading
              ? "Loading..."
              : `${filteredDoctors.length} doctors found`}
          </span>
        </div>

        {loading ? (
          <div className="doctors-message">
            <RefreshCw size={25} />
            <p>Loading verified doctor profiles...</p>
          </div>
        ) : error ? (
          <div className="doctors-message doctors-error">
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchDirectory}
            >
              Try Again
            </button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="doctors-message">
            <UserRound size={35} />

            <h3>No doctors found</h3>

            <p>
              {doctors.length === 0
                ? "No verified doctor profiles are available yet."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          <div className="doctors-grid">
            {filteredDoctors.map((doctor) => (
              <article
                className="doctor-card"
                key={doctor.id}
              >
                <div className="doctor-card-top">
                  <div className="doctor-avatar">
                    {doctor.profile_image_url ? (
                      <img
                        src={doctor.profile_image_url}
                        alt={doctor.full_name}
                      />
                    ) : (
                      <UserRound size={34} />
                    )}
                  </div>

                  <span className="doctor-verified-label">
                    Verified
                  </span>
                </div>

                <h3>
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="doctor-profile-link"
                  >
                    {doctor.full_name}
                  </Link>
                </h3>

                <p className="doctor-qualification">
                  {doctor.qualifications ||
                    "Qualifications not provided"}
                </p>

                <div className="doctor-card-experience">
                  <BriefcaseMedical size={16} />

                  {doctor.experience_years != null
                    ? `${doctor.experience_years} years experience`
                    : "Experience not provided"}
                </div>

                <div className="doctor-card-specializations">
                  {doctor.specializations.length > 0 ? (
                    doctor.specializations.map((item) => (
                      <span key={item.id}>
                        {item.name}
                      </span>
                    ))
                  ) : (
                    <span>Specialization not listed</span>
                  )}
                </div>

                {doctor.diseases.length > 0 && (
                  <div className="doctor-card-diseases">
                    <strong>Related conditions:</strong>

                    <p>
                      {doctor.diseases
                        .map((item) => item.name)
                        .join(", ")}
                    </p>
                  </div>
                )}

                <div className="doctor-card-actions">
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="doctor-view-profile-button"
                  >
                    View Full Profile
                  </Link>

                  {doctor.phone ? (
                    <a
                      href={`tel:${doctor.phone}`}
                      className="doctor-call-button"
                    >
                      <Phone size={17} />
                      Contact Doctor
                    </a>
                  ) : (
                    <span className="doctor-no-contact">
                      Contact information unavailable
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Doctors;
