
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminDoctorEdit.css";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminDoctorEdit() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    qualifications: "",
    registration_number: "",
    registration_council: "",
    registration_state: "",
    experience_years: "",
    bio: "",
    phone: "",
    email: "",
    website_url: "",
    profile_image_url: "",
    consultation_fee: "",
    consultation_mode: "",
    languages: "",
    availability_notes: "",
    source_name: "",
    source_type: "Other",
    source_title: "",
    source_url: "",
    evidence_note: "",
  });

  const [specializations, setSpecializations] = useState([]);
  const [diseases, setDiseases] = useState([]);

  const [selectedSpecializations, setSelectedSpecializations] =
    useState([]);

  const [selectedDiseases, setSelectedDiseases] =
    useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setLoadingOptions(true);

      const [
        { data: specializationData, error: specializationError },
        { data: diseaseData, error: diseaseError },
      ] = await Promise.all([
        supabase
          .from("specializations")
          .select("id, name")
          .order("name"),

        supabase
          .from("diseases")
          .select("id, name, review_status")
          .order("name"),
      ]);

      if (!active) return;

      if (specializationError || diseaseError) {
        console.error("Doctor form options error:", {
          specializationError,
          diseaseError,
        });

        setError(
          "Unable to load specializations or diseases. Please check database permissions."
        );
      } else {
        setSpecializations(specializationData || []);
        setDiseases(diseaseData || []);
      }

      setLoadingOptions(false);
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleMultiSelect(event, setter) {
    const values = Array.from(
      event.target.selectedOptions,
      (option) => Number(option.value)
    );

    setter(values);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.full_name.trim()) {
      setError("Doctor's full name is required.");
      return;
    }

    if (!form.source_name.trim() || !form.source_url.trim()) {
      setError(
        "At least one verification source name and source URL are required."
      );
      return;
    }

    try {
      new URL(form.source_url.trim());
    } catch {
      setError("Please enter a valid verification source URL.");
      return;
    }

    if (form.website_url.trim()) {
      try {
        new URL(form.website_url.trim());
      } catch {
        setError("Please enter a valid website URL.");
        return;
      }
    }

    if (form.profile_image_url.trim()) {
      try {
        new URL(form.profile_image_url.trim());
      } catch {
        setError("Please enter a valid profile image URL.");
        return;
      }
    }

    const experience = form.experience_years.trim()
      ? Number(form.experience_years)
      : null;

    const fee = form.consultation_fee.trim()
      ? Number(form.consultation_fee)
      : null;

    if (
      experience !== null &&
      (!Number.isInteger(experience) || experience < 0)
    ) {
      setError("Experience must be a non-negative whole number.");
      return;
    }

    if (fee !== null && (!Number.isFinite(fee) || fee < 0)) {
      setError("Consultation fee must be a valid non-negative amount.");
      return;
    }

    const slug = createSlug(form.full_name);

    if (!slug) {
      setError("Please enter a valid doctor's name.");
      return;
    }

    setLoading(true);

    try {
      const doctorPayload = {
        full_name: form.full_name.trim(),
        slug,
        qualifications: form.qualifications.trim() || null,
        registration_number:
          form.registration_number.trim() || null,
        registration_council:
          form.registration_council.trim() || null,
        registration_state:
          form.registration_state.trim() || null,
        experience_years: experience,
        bio: form.bio.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        website_url: form.website_url.trim() || null,
        profile_image_url:
          form.profile_image_url.trim() || null,
        consultation_fee: fee,
        consultation_mode: form.consultation_mode || null,
        languages: form.languages
          .split(",")
          .map((language) => language.trim())
          .filter(Boolean),
        availability_notes:
          form.availability_notes.trim() || null,
        review_status: "pending",
      };

      const { data: doctor, error: doctorError } = await supabase
        .from("doctors")
        .insert([doctorPayload])
        .select("id")
        .single();

      if (doctorError) throw doctorError;

      const doctorId = doctor.id;

      // Save selected specializations.

      if (selectedSpecializations.length > 0) {
        const specializationRows = selectedSpecializations.map(
          (specializationId) => ({
            doctor_id: doctorId,
            specialization_id: specializationId,
          })
        );

        const { error: specializationInsertError } = await supabase
          .from("doctor_specializations")
          .insert(specializationRows);

        if (specializationInsertError) {
          throw new Error(
            `Doctor saved, but specializations could not be saved: ${specializationInsertError.message}`
          );
        }
      }

      // Save selected diseases.

      if (selectedDiseases.length > 0) {
        const diseaseRows = selectedDiseases.map((diseaseId) => ({
          doctor_id: doctorId,
          disease_id: diseaseId,
        }));

        const { error: diseaseInsertError } = await supabase
          .from("doctor_diseases")
          .insert(diseaseRows);

        if (diseaseInsertError) {
          throw new Error(
            `Doctor saved, but disease associations could not be saved: ${diseaseInsertError.message}`
          );
        }
      }

      // Save the verification source.

      const { error: sourceError } = await supabase
        .from("doctor_sources")
        .insert([
          {
            doctor_id: doctorId,
            source_name: form.source_name.trim(),
            source_type: form.source_type,
            source_title: form.source_title.trim() || null,
            source_url: form.source_url.trim(),
            evidence_note: form.evidence_note.trim() || null,
          },
        ]);

      if (sourceError) {
        throw new Error(
          `Doctor saved, but the verification source could not be saved: ${sourceError.message}`
        );
      }

      navigate(`/admin/doctors/${doctorId}`);
    } catch (submitError) {
      console.error("Doctor creation error:", submitError);

      setError(
        submitError.message || "Unable to save doctor information."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-doctor-edit-page">

      {/* HEADER */}

      <section className="admin-doctor-edit-hero">
        <span>VAXCARE ADMINISTRATION</span>

        <h1>Add Doctor</h1>

        <p>
          Add professional information, healthcare specializations
          and reliable verification references.
        </p>
      </section>

      <div className="admin-doctor-edit-content">

        <div className="admin-doctor-edit-breadcrumb">
          <Link to="/admin">Dashboard</Link>
          <span>/</span>
          <Link to="/admin/doctors">Doctor Management</Link>
          <span>/</span>
          <strong>Add Doctor</strong>
        </div>

        {error && (
          <div className="admin-doctor-edit-error">
            {error}
          </div>
        )}

        <form
          className="admin-doctor-edit-form"
          onSubmit={handleSubmit}
        >

          {/* PROFESSIONAL DETAILS */}

          <section className="admin-doctor-edit-section">
            <div className="admin-doctor-edit-section-heading">
              <span>01</span>
              <div>
                <h2>Professional Information</h2>
                <p>Basic details about the medical professional.</p>
              </div>
            </div>

            <div className="admin-doctor-edit-grid">

              <label className="admin-doctor-edit-field full">
                Doctor's Full Name *
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter doctor's full name"
                  required
                />
              </label>

              <label className="admin-doctor-edit-field">
                Qualifications
                <input
                  name="qualifications"
                  value={form.qualifications}
                  onChange={handleChange}
                  placeholder="Example: MBBS, MD"
                />
              </label>

              <label className="admin-doctor-edit-field">
                Years of Experience
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="experience_years"
                  value={form.experience_years}
                  onChange={handleChange}
                  placeholder="Enter years"
                />
              </label>

              <label className="admin-doctor-edit-field">
                Registration Number
                <input
                  name="registration_number"
                  value={form.registration_number}
                  onChange={handleChange}
                  placeholder="Medical registration number"
                />
              </label>

              <label className="admin-doctor-edit-field">
                Registration Council
                <input
                  name="registration_council"
                  value={form.registration_council}
                  onChange={handleChange}
                  placeholder="Example: Karnataka Medical Council"
                />
              </label>

              <label className="admin-doctor-edit-field">
                Registration State
                <input
                  name="registration_state"
                  value={form.registration_state}
                  onChange={handleChange}
                  placeholder="Example: Karnataka"
                />
              </label>

              <label className="admin-doctor-edit-field full">
                Professional Biography
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter a factual professional biography"
                />
              </label>

            </div>
          </section>

          {/* SPECIALIZATIONS */}

          <section className="admin-doctor-edit-section">
            <div className="admin-doctor-edit-section-heading">
              <span>02</span>
              <div>
                <h2>Medical Specializations</h2>
                <p>
                  Select the doctor's verified medical specialties.
                </p>
              </div>
            </div>

            {loadingOptions ? (
              <p>Loading specializations...</p>
            ) : (
              <label className="admin-doctor-edit-field full">
                Select Specializations
                <select
                  multiple
                  value={selectedSpecializations.map(String)}
                  onChange={(event) =>
                    handleMultiSelect(
                      event,
                      setSelectedSpecializations
                    )
                  }
                  size={Math.min(
                    Math.max(specializations.length, 3),
                    7
                  )}
                >
                  {specializations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <small>
                  Hold Ctrl (Windows) or Command (Mac) to select
                  multiple options.
                </small>
              </label>
            )}

            {!loadingOptions && specializations.length === 0 && (
              <p className="admin-doctor-edit-hint">
                No specializations are available yet. Add them to
                the specializations catalogue first.
              </p>
            )}
          </section>

          {/* DISEASE ASSOCIATIONS */}

          <section className="admin-doctor-edit-section">
            <div className="admin-doctor-edit-section-heading">
              <span>03</span>
              <div>
                <h2>Related Diseases</h2>
                <p>
                  Associate diseases the doctor is qualified to manage.
                </p>
              </div>
            </div>

            {loadingOptions ? (
              <p>Loading diseases...</p>
            ) : (
              <>
                <label className="admin-doctor-edit-field full">
                  Select Diseases
                  <select
                    multiple
                    value={selectedDiseases.map(String)}
                    onChange={(event) =>
                      handleMultiSelect(event, setSelectedDiseases)
                    }
                    size={Math.min(
                      Math.max(diseases.length, 3),
                      8
                    )}
                  >
                    {diseases.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.review_status})
                      </option>
                    ))}
                  </select>
                  <small>
                    Only associations with verified diseases will
                    appear in the public doctor directory.
                  </small>
                </label>
              </>
            )}
          </section>

          {/* CONTACT DETAILS */}

          <section className="admin-doctor-edit-section">
            <div className="admin-doctor-edit-section-heading">
              <span>04</span>
              <div>
                <h2>Contact Information</h2>
                <p>Professional contact and consultation details.</p>
              </div>
            </div>

            <div className="admin-doctor-edit-grid">

              <label className="admin-doctor-edit-field">
                Mobile Number
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Doctor's professional contact number"
                />
              </label>

              <label className="admin-doctor-edit-field">
                Professional Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="doctor@example.com"
                />
              </label>

              <label className="admin-doctor-edit-field">
                Website
                <input
                  type="url"
                  name="website_url"
                  value={form.website_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </label>

              <label className="admin-doctor-edit-field">
                Profile Image URL
                <input
                  type="url"
                  name="profile_image_url"
                  value={form.profile_image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </label>

              <label className="admin-doctor-edit-field">
                Consultation Fee (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="consultation_fee"
                  value={form.consultation_fee}
                  onChange={handleChange}
                  placeholder="Enter fee if confirmed"
                />
              </label>

              <label className="admin-doctor-edit-field">
                Consultation Mode
                <select
                  name="consultation_mode"
                  value={form.consultation_mode}
                  onChange={handleChange}
                >
                  <option value="">Not specified</option>
                  <option value="in_person">In person</option>
                  <option value="online">Online</option>
                  <option value="both">Both</option>
                </select>
              </label>

              <label className="admin-doctor-edit-field full">
                Languages
                <input
                  name="languages"
                  value={form.languages}
                  onChange={handleChange}
                  placeholder="Example: Kannada, English, Hindi"
                />
                <small>Separate languages using commas.</small>
              </label>

              <label className="admin-doctor-edit-field full">
                Availability Notes
                <textarea
                  name="availability_notes"
                  value={form.availability_notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter confirmed consultation availability"
                />
              </label>

            </div>
          </section>

          {/* VERIFICATION SOURCE */}

          <section className="admin-doctor-edit-section">
            <div className="admin-doctor-edit-section-heading">
              <span>05</span>
              <div>
                <h2>Verification Reference</h2>
                <p>
                  Record the source used to verify this professional's
                  information.
                </p>
              </div>
            </div>

            <div className="admin-doctor-edit-grid">

              <label className="admin-doctor-edit-field">
                Source Name *
                <input
                  name="source_name"
                  value={form.source_name}
                  onChange={handleChange}
                  placeholder="Example: Karnataka Medical Council"
                  required
                />
              </label>

              <label className="admin-doctor-edit-field">
                Source Type *
                <select
                  name="source_type"
                  value={form.source_type}
                  onChange={handleChange}
                  required
                >
                  <option value="NMC">NMC</option>
                  <option value="State Medical Council">
                    State Medical Council
                  </option>
                  <option value="Hospital">Hospital</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="admin-doctor-edit-field full">
                Source Title
                <input
                  name="source_title"
                  value={form.source_title}
                  onChange={handleChange}
                  placeholder="Name of registry entry or reference document"
                />
              </label>

              <label className="admin-doctor-edit-field full">
                Source URL *
                <input
                  type="url"
                  name="source_url"
                  value={form.source_url}
                  onChange={handleChange}
                  placeholder="https://official-source.example"
                  required
                />
              </label>

              <label className="admin-doctor-edit-field full">
                Evidence Notes
                <textarea
                  name="evidence_note"
                  value={form.evidence_note}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Explain which details this source supports"
                />
              </label>

            </div>
          </section>

          {/* REVIEW NOTICE */}

          <div className="admin-doctor-edit-notice">
            <strong>Important: Pending verification</strong>
            <p>
              Saving this form does not verify the doctor. The record
              will remain pending until an administrator checks the
              professional registration and supporting references.
            </p>
          </div>

          {/* ACTIONS */}

          <div className="admin-doctor-edit-actions">
            <Link
              to="/admin/doctors"
              className="admin-doctor-edit-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || loadingOptions}
              className="admin-doctor-edit-submit"
            >
              {loading ? "Saving Doctor..." : "Save Doctor"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

export default AdminDoctorEdit;
