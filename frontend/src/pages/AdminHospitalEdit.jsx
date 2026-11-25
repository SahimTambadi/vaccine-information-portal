
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AdminHospitalEdit.css";

const HOSPITAL_TYPES = [
  "General Hospital",
  "Multispeciality Hospital",
  "Speciality Hospital",
  "Clinic",
  "Medical College Hospital",
  "Other",
];

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminHospitalEdit() {
  const navigate = useNavigate();

  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);

  const [form, setForm] = useState({
    name: "",
    hospital_type: "",
    description: "",
    logo_url: "",
    phone: "",
    email: "",
    website_url: "",
    established_year: "",
    facilities: "",
    languages: "",
    clinic_name: "",
    address: "",
    locality: "",
    city: "",
    state: "Karnataka",
    pincode: "",
    latitude: "",
    longitude: "",
    source_name: "",
    source_url: "",
    source_note: "",
  });

  const [saving, setSaving] = useState(false);
  const [loadingSpecializations, setLoadingSpecializations] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("specializations")
          .select("id, name")
          .order("name");

        if (fetchError) throw fetchError;

        setSpecializations(data || []);
      } catch (err) {
        console.error("Specialization fetch error:", err);
        setError("Unable to load specializations: " + err.message);
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecializations();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSpecializationChange = (id) => {
    setSelectedSpecializations((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.address.trim() ||
      !form.locality.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      setError("Please complete all required hospital and address fields.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError("Enter a valid 6-digit Indian pincode.");
      return;
    }

    const establishedYear = form.established_year
      ? Number(form.established_year)
      : null;

    if (
      establishedYear !== null &&
      (!Number.isInteger(establishedYear) ||
        establishedYear < 1800 ||
        establishedYear > new Date().getFullYear())
    ) {
      setError("Enter a valid established year.");
      return;
    }

    const latitude = form.latitude.trim()
      ? Number(form.latitude)
      : null;

    const longitude = form.longitude.trim()
      ? Number(form.longitude)
      : null;

    if (
      (latitude === null) !== (longitude === null) ||
      (latitude !== null &&
        (!Number.isFinite(latitude) ||
          latitude < -90 ||
          latitude > 90)) ||
      (longitude !== null &&
        (!Number.isFinite(longitude) ||
          longitude < -180 ||
          longitude > 180))
    ) {
      setError(
        "Enter both valid latitude and longitude, or leave both empty."
      );
      return;
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (form.source_url.trim()) {
      try {
        const sourceUrl = new URL(form.source_url.trim());
        if (!["http:", "https:"].includes(sourceUrl.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        setError("Enter a valid HTTP or HTTPS source URL.");
        return;
      }
    }

    setSaving(true);

    let createdHospitalId = null;

    try {
      const baseSlug = createSlug(form.name);
      const slug = `${baseSlug}-${Date.now().toString(36)}`;

      const hospitalPayload = {
        name: form.name.trim(),
        slug,
        hospital_type: form.hospital_type || null,
        description: form.description.trim() || null,
        logo_url: form.logo_url.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        website_url: form.website_url.trim() || null,
        established_year: establishedYear,
        facilities: form.facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        languages: form.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        review_status: "pending",
      };

      const { data: hospital, error: hospitalError } = await supabase
        .from("hospitals")
        .insert(hospitalPayload)
        .select("id")
        .single();

      if (hospitalError) throw hospitalError;

      createdHospitalId = hospital.id;

      const locationPayload = {
        hospital_id: hospital.id,
        branch_name: form.clinic_name.trim() || null,
        address: form.address.trim(),
        locality: form.locality.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        latitude,
        longitude,
        is_primary: true,
        review_status: "pending",
      };

      const { error: locationError } = await supabase
        .from("hospital_locations")
        .insert(locationPayload);

      if (locationError) throw locationError;

      if (selectedSpecializations.length > 0) {
        const specializationPayload = selectedSpecializations.map(
          (specializationId) => ({
            hospital_id: hospital.id,
            specialization_id: specializationId,
          })
        );

        const { error: specializationError } = await supabase
          .from("hospital_specializations")
          .insert(specializationPayload);

        if (specializationError) throw specializationError;
      }

      if (form.source_name.trim() || form.source_url.trim()) {
        if (!form.source_name.trim() || !form.source_url.trim()) {
          throw new Error(
            "Provide both the source name and source URL, or leave both empty."
          );
        }

        const { error: sourceError } = await supabase
          .from("hospital_sources")
          .insert({
            hospital_id: hospital.id,
            source_name: form.source_name.trim(),
            source_url: form.source_url.trim(),
            evidence_note: form.source_note.trim() || null,
          });

        if (sourceError) throw sourceError;
      }

      window.alert(
        "Hospital added successfully. It is pending admin verification."
      );

      navigate("/admin/hospitals");
    } catch (err) {
      console.error("Hospital creation error:", err);

      // Remove the parent record if any later insert fails.
      // Related rows are removed by ON DELETE CASCADE.
      if (createdHospitalId !== null) {
        const { error: rollbackError } = await supabase
          .from("hospitals")
          .delete()
          .eq("id", createdHospitalId);

        if (rollbackError) {
          console.error("Hospital rollback error:", rollbackError);
        }
      }

      setError(err.message || "Unable to add hospital.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-hospital-edit-page">
      <div className="admin-hospital-edit-container">
        <Link to="/admin/hospitals" className="hospital-edit-back">
          ← Back to Hospitals
        </Link>

        <header className="hospital-edit-header">
          <p className="hospital-edit-eyebrow">VAXCARE ADMIN</p>
          <h1>Add New Hospital</h1>
          <p>
            Add hospital information and its primary practice location.
            Both records will remain pending until verified.
          </p>
        </header>

        {error && (
          <div className="hospital-edit-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="hospital-edit-card">
            <h2>Hospital Information</h2>

            <div className="hospital-edit-grid">
              <div className="hospital-edit-field full">
                <label>Hospital Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              <div className="hospital-edit-field">
                <label>Hospital Type</label>
                <select
                  name="hospital_type"
                  value={form.hospital_type}
                  onChange={handleChange}
                >
                  <option value="">Select hospital type</option>
                  {HOSPITAL_TYPES.map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hospital-edit-field">
                <label>Established Year</label>
                <input
                  type="number"
                  name="established_year"
                  value={form.established_year}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder="e.g. 1995"
                />
              </div>

              <div className="hospital-edit-field full">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the hospital and its services"
                />
              </div>

              <div className="hospital-edit-field">
                <label>Logo/Image URL</label>
                <input
                  name="logo_url"
                  value={form.logo_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="hospital-edit-field">
                <label>Hospital Website</label>
                <input
                  type="url"
                  name="website_url"
                  value={form.website_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          <section className="hospital-edit-card">
            <h2>Contact Information</h2>

            <div className="hospital-edit-grid">
              <div className="hospital-edit-field">
                <label>Contact Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Hospital contact number"
                />
              </div>

              <div className="hospital-edit-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="hospital@example.com"
                />
              </div>

              <div className="hospital-edit-field">
                <label>Languages</label>
                <input
                  name="languages"
                  value={form.languages}
                  onChange={handleChange}
                  placeholder="English, Kannada, Hindi"
                />
                <small>Separate multiple languages with commas.</small>
              </div>

              <div className="hospital-edit-field">
                <label>Facilities</label>
                <input
                  name="facilities"
                  value={form.facilities}
                  onChange={handleChange}
                  placeholder="ICU, Emergency, Pharmacy"
                />
                <small>Separate facilities with commas.</small>
              </div>
            </div>
          </section>

          <section className="hospital-edit-card">
            <h2>Primary Branch Location</h2>

            <div className="hospital-edit-grid">
              <div className="hospital-edit-field full">
                <label>Branch Name</label>
                <input
                  name="clinic_name"
                  value={form.clinic_name}
                  onChange={handleChange}
                  placeholder="Main Branch / City Branch"
                />
              </div>

              <div className="hospital-edit-field full">
                <label>Full Address *</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  required
                  placeholder="Enter complete hospital address"
                />
              </div>

              <div className="hospital-edit-field">
                <label>Locality *</label>
                <input
                  name="locality"
                  value={form.locality}
                  onChange={handleChange}
                  required
                  placeholder="Locality"
                />
              </div>

              <div className="hospital-edit-field">
                <label>City *</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="City"
                />
              </div>

              <div className="hospital-edit-field">
                <label>State *</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="hospital-edit-field">
                <label>Pincode *</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  maxLength="6"
                  inputMode="numeric"
                  placeholder="6-digit pincode"
                />
              </div>

              <div className="hospital-edit-field">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div className="hospital-edit-field">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>

            <p className="hospital-edit-note">
              Coordinates are optional. Add them only when verified, so
              nearby search can use accurate hospital locations.
            </p>
          </section>

          <section className="hospital-edit-card">
            <h2>Medical Specializations</h2>
            <p className="hospital-edit-description">
              Select the specializations offered by this hospital.
            </p>

            {loadingSpecializations ? (
              <p>Loading specializations...</p>
            ) : specializations.length === 0 ? (
              <p>No specializations are available yet.</p>
            ) : (
              <div className="hospital-specialization-options">
                {specializations.map((specialization) => (
                  <label
                    key={specialization.id}
                    className="hospital-specialization-option"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSpecializations.includes(
                        specialization.id
                      )}
                      onChange={() =>
                        handleSpecializationChange(specialization.id)
                      }
                    />
                    <span>{specialization.name}</span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="hospital-edit-card">
            <h2>Supporting Source</h2>
            <p className="hospital-edit-description">
              Add an official hospital website or another reliable
              reference to support the hospital information.
            </p>

            <div className="hospital-edit-grid">
              <div className="hospital-edit-field">
                <label>Source Name</label>
                <input
                  name="source_name"
                  value={form.source_name}
                  onChange={handleChange}
                  placeholder="Official Hospital Website"
                />
              </div>

              <div className="hospital-edit-field">
                <label>Source URL</label>
                <input
                  type="url"
                  name="source_url"
                  value={form.source_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="hospital-edit-field full">
                <label>Evidence Note</label>
                <textarea
                  name="source_note"
                  value={form.source_note}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Explain what this source confirms"
                />
              </div>
            </div>
          </section>

          <div className="hospital-edit-footer">
            <Link to="/admin/hospitals" className="hospital-edit-cancel">
              Cancel
            </Link>

            <button
              type="submit"
              className="hospital-edit-submit"
              disabled={saving}
            >
              {saving ? "Saving Hospital..." : "Save Hospital"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminHospitalEdit;
