
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Download,
  MapPin,
  Stethoscope,
  Building2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { DOCTOR_IMPORT_CATALOGUE } from "../data/doctorImportCatalogue";
import "./AdminDoctorImport.css";

function normalizeName(value = "") {
  return value
    .toLowerCase()
    .replace(/^dr\.?\s*/i, "")
    .replace(/[^a-z0-9]/g, "");
}

function createSlug(value = "") {
  return value
    .toLowerCase()
    .replace(/^dr\.?\s*/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminDoctorImport() {
  const [search, setSearch] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [existingNames, setExistingNames] = useState(new Set());
  const [importedSources, setImportedSources] = useState(new Set());
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadImportStatus = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        doctorsResult,
        sourcesResult,
        specializationsResult,
      ] = await Promise.all([
        supabase.from("doctors").select("id, full_name"),
        supabase
          .from("doctor_sources")
          .select("doctor_id, source_url, source_title"),
        supabase.from("specializations").select("id, name"),
      ]);

      if (doctorsResult.error) throw doctorsResult.error;
      if (sourcesResult.error) throw sourcesResult.error;
      if (specializationsResult.error) {
        throw specializationsResult.error;
      }

      setExistingNames(
        new Set(
          (doctorsResult.data || []).map((doctor) =>
            normalizeName(doctor.full_name)
          )
        )
      );

      setImportedSources(
        new Set(
          (sourcesResult.data || []).map(
            (source) =>
              `${source.source_url}::${normalizeName(
                source.source_title || ""
              )}`
          )
        )
      );

      setSpecializations(specializationsResult.data || []);
    } catch (err) {
      setError(err.message || "Unable to load doctor catalogue status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImportStatus();
  }, [loadImportStatus]);

  const hospitals = useMemo(
    () => [
      ...new Set(
        DOCTOR_IMPORT_CATALOGUE.map(
          (doctor) => doctor.source_name
        )
      ),
    ],
    []
  );

  const filteredDoctors = useMemo(() => {
    return DOCTOR_IMPORT_CATALOGUE.filter((doctor) => {
      const matchesSearch = [
        doctor.full_name,
        doctor.specialization,
        doctor.source_name,
        doctor.qualifications,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesHospital =
        hospitalFilter === "all" ||
        doctor.source_name === hospitalFilter;

      return matchesSearch && matchesHospital;
    });
  }, [search, hospitalFilter]);

  const getImportStatus = (doctor) => {
    const normalized = normalizeName(doctor.full_name);
    const sourceKey = `${doctor.source_url}::${normalizeName(
      doctor.source_title
    )}`;

    if (existingNames.has(normalized)) return "duplicate";
    if (importedSources.has(sourceKey)) return "imported";

    return "available";
  };

  const findSpecializationId = (name) => {
    if (!name) return null;

    const normalized = name.toLowerCase().trim();

    const match = specializations.find(
      (item) => item.name.toLowerCase().trim() === normalized
    );

    return match?.id || null;
  };

  const importDoctor = async (doctor, index) => {
    setImportingId(index);
    setMessage("");
    setError("");

    let doctorId = null;

    try {
      const status = getImportStatus(doctor);

      if (status !== "available") {
        throw new Error(
          "This doctor is already present or has already been imported."
        );
      }

      const slugBase = createSlug(doctor.full_name);

      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .insert({
          full_name: doctor.full_name,
          slug: `${slugBase}-${Date.now()}`,
          qualifications: doctor.qualifications || null,
          experience_years: doctor.experience_years ?? null,
          review_status: "pending",
          languages: [],
        })
        .select("id")
        .single();

      if (doctorError) throw doctorError;

      doctorId = doctorData.id;

      const specializationId = findSpecializationId(
        doctor.specialization
      );

      if (specializationId) {
        const { error: specializationError } = await supabase
          .from("doctor_specializations")
          .insert({
            doctor_id: doctorId,
            specialization_id: specializationId,
          });

        if (specializationError) throw specializationError;
      }

      const { error: sourceError } = await supabase
        .from("doctor_sources")
        .insert({
          doctor_id: doctorId,
          source_name: doctor.source_name,
          source_type: doctor.source_type,
          source_title: doctor.full_name,
          source_url: doctor.source_url,
          evidence_note:
            "Listed in the hospital's published doctor directory. Professional registration, current practice and profile details require admin verification.",
        });

      if (sourceError) throw sourceError;

      const location = doctor.location;

      const { error: locationError } = await supabase
        .from("doctor_locations")
        .insert({
          doctor_id: doctorId,
          clinic_name: location.hospital_name,
          address: location.address,
          locality: location.locality,
          city: location.city,
          state: location.state,
          pincode: location.pincode,
          is_primary: true,
          review_status: "pending",
        });

      if (locationError) throw locationError;

      setExistingNames((previous) => {
        const next = new Set(previous);
        next.add(normalizeName(doctor.full_name));
        return next;
      });

      setImportedSources((previous) => {
        const next = new Set(previous);
        next.add(
          `${doctor.source_url}::${normalizeName(doctor.full_name)}`
        );
        return next;
      });

      setMessage(
        `${doctor.full_name} was imported successfully and is pending review.`
      );
    } catch (err) {
      if (doctorId) {
        const { error: rollbackError } = await supabase
          .from("doctors")
          .delete()
          .eq("id", doctorId);

        if (rollbackError) {
          setError(
            `${err.message}. Automatic cleanup failed: ${rollbackError.message}. Please inspect doctor ID ${doctorId}.`
          );
          setImportingId(null);
          return;
        }
      }

      setError(err.message || "Unable to import this doctor.");
    } finally {
      setImportingId(null);
    }
  };

  const availableCount = DOCTOR_IMPORT_CATALOGUE.filter(
    (doctor) => getImportStatus(doctor) === "available"
  ).length;

  const duplicateCount = DOCTOR_IMPORT_CATALOGUE.filter(
    (doctor) => getImportStatus(doctor) === "duplicate"
  ).length;

  const importedCount = DOCTOR_IMPORT_CATALOGUE.filter(
    (doctor) => getImportStatus(doctor) === "imported"
  ).length;

  return (
    <main className="admin-doctor-import-page">
      <header className="admin-doctor-import-header">
        <Link
          to="/admin/doctors"
          className="admin-doctor-import-back"
        >
          <ArrowLeft size={17} />
          Back to Doctor Management
        </Link>

        <div className="admin-doctor-import-heading">
          <div>
            <span className="admin-doctor-import-eyebrow">
              DOCTOR MANAGEMENT
            </span>
            <h1>Import Doctors</h1>
            <p>
              Browse source-listed doctors and import individual profiles
              for administrative verification.
            </p>
          </div>

          <Link
            to="/admin/doctors/new"
            className="admin-doctor-import-manual"
          >
            + Add Doctor Manually
          </Link>
        </div>
      </header>

      <section className="admin-doctor-import-stats">
        <div>
          <span>Catalogue entries</span>
          <strong>{DOCTOR_IMPORT_CATALOGUE.length}</strong>
        </div>

        <div>
          <span>Available</span>
          <strong>{availableCount}</strong>
        </div>

        <div>
          <span>Imported</span>
          <strong>{importedCount}</strong>
        </div>

        <div>
          <span>Possible duplicates</span>
          <strong>{duplicateCount}</strong>
        </div>
      </section>

      {message && (
        <div className="admin-doctor-import-success">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="admin-doctor-import-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <section className="admin-doctor-import-notice">
        <AlertCircle size={19} />
        <p>
          Imported profiles and hospital locations remain pending until
          an administrator verifies the doctor's professional details
          and practice information. Missing information is not invented.
        </p>
      </section>

      <section className="admin-doctor-import-toolbar">
        <div className="admin-doctor-import-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search doctor, specialization or hospital..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={hospitalFilter}
          onChange={(event) => setHospitalFilter(event.target.value)}
        >
          <option value="all">All hospitals</option>
          {hospitals.map((hospital) => (
            <option key={hospital} value={hospital}>
              {hospital}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={loadImportStatus}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      {loading ? (
        <div className="admin-doctor-import-state">
          Loading doctor catalogue...
        </div>
      ) : (
        <>
          <div className="admin-doctor-import-results">
            Showing {filteredDoctors.length} of{" "}
            {DOCTOR_IMPORT_CATALOGUE.length} catalogue entries
          </div>

          <section className="admin-doctor-import-grid">
            {filteredDoctors.map((doctor) => {
              const originalIndex =
                DOCTOR_IMPORT_CATALOGUE.indexOf(doctor);

              const status = getImportStatus(doctor);

              return (
                <article
                  className="admin-doctor-import-card"
                  key={`${doctor.source_url}-${doctor.full_name}`}
                >
                  <div className="admin-doctor-import-card-top">
                    <div className="admin-doctor-import-avatar">
                      <Stethoscope size={23} />
                    </div>

                    <span
                      className={`admin-doctor-import-status ${status}`}
                    >
                      {status === "available" && "Available"}
                      {status === "duplicate" && "Possible duplicate"}
                      {status === "imported" && "Imported"}
                    </span>
                  </div>

                  <h3>{doctor.full_name}</h3>

                  <p className="admin-doctor-import-specialty">
                    {doctor.specialization}
                  </p>

                  {doctor.qualifications && (
                    <p className="admin-doctor-import-qualification">
                      {doctor.qualifications}
                    </p>
                  )}

                  {doctor.experience_years != null && (
                    <p className="admin-doctor-import-experience">
                      {doctor.experience_years}+ years of experience
                      <span> · Published listing; verify before approval</span>
                    </p>
                  )}

                  <div className="admin-doctor-import-meta">
                    <p>
                      <Building2 size={15} />
                      {doctor.source_name}
                    </p>

                    <p>
                      <MapPin size={15} />
                      {doctor.location.city},{" "}
                      {doctor.location.state}
                    </p>
                  </div>

                  <a
                    href={doctor.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-doctor-import-source"
                  >
                    View source
                  </a>

                  <button
                    type="button"
                    className="admin-doctor-import-button"
                    disabled={
                      status !== "available" ||
                      importingId !== null
                    }
                    onClick={() =>
                      importDoctor(doctor, originalIndex)
                    }
                  >
                    {importingId === originalIndex ? (
                      "Importing..."
                    ) : status === "duplicate" ? (
                      "Review Existing Record"
                    ) : status === "imported" ? (
                      "Already Imported"
                    ) : (
                      <>
                        <Download size={16} />
                        Import Doctor
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </section>

          {filteredDoctors.length === 0 && (
            <div className="admin-doctor-import-state">
              No doctors match your search.
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default AdminDoctorImport;
