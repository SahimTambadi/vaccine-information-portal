
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function AdminVaccineEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    full_name: "",
    category: "",
    purpose: "",
    age: "",
    icon: "💉",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVaccine();
  }, [id]);

  async function fetchVaccine() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("vaccines")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setError("Unable to load vaccine: " + error.message);
      setLoading(false);
      return;
    }

    setFormData({
      name: data.name || "",
      full_name: data.full_name || "",
      category: data.category || "",
      purpose: data.purpose || "",
      age: data.age || "",
      icon: data.icon || "💉",
    });

    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (saving) return;

    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.purpose.trim() ||
      !formData.age.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    const updateData = {
      name: formData.name.trim(),
      full_name: formData.full_name.trim() || null,
      category: formData.category.trim(),
      purpose: formData.purpose.trim(),
      age: formData.age.trim(),
      icon: formData.icon.trim() || "💉",
    };

    const { data, error } = await supabase
      .from("vaccines")
      .update(updateData)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      setError("Unable to update vaccine: " + error.message);
      setSaving(false);
      return;
    }

    if (!data) {
      setError("No vaccine was updated. Check your admin permissions.");
      setSaving(false);
      return;
    }

    navigate(`/admin/vaccines/${id}`);
  }

  return (
    <main className="app admin-vaccine-page">

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">VAXCARE ADMINISTRATION</p>
          <h1>Edit <span>Vaccine.</span></h1>

          <p className="hero-description">
            Update the selected vaccine information.
          </p>

          <Link
            to={`/admin/vaccines/${id}`}
            className="hero-button"
          >
            ← Back to Vaccine Details
          </Link>
        </div>

        <div className="hero-visual">
          <div className="medical-circle">✏️</div>
        </div>
      </section>

      {loading ? (
        <p>Loading vaccine information...</p>
      ) : error && !formData.name ? (
        <p className="auth-error">{error}</p>
      ) : (

        <section className="admin-form-section">

          <div className="admin-form-heading">
            <p className="eyebrow">UPDATE RECORD</p>
            <h2>Edit Vaccine Information</h2>
            <p>Vaccine ID: {id}</p>
          </div>

          <form
            className="admin-vaccine-form"
            onSubmit={handleUpdate}
          >

            <div className="admin-form-group">
              <label htmlFor="name">Vaccine Name *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="category">Category *</label>
              <input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="age">Recommended Age *</label>
              <input
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group full-width">
              <label htmlFor="purpose">Purpose *</label>
              <textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="icon">Vaccine Icon</label>
              <input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
              />
            </div>

            {error && (
              <p className="auth-error full-width">{error}</p>
            )}

            <div className="admin-form-actions">
              <Link
                to={`/admin/vaccines/${id}`}
                className="admin-cancel-button admin-edit-link"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="admin-save-button"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Vaccine"}
              </button>
            </div>

          </form>

        </section>
      )}

    </main>
  );
}

export default AdminVaccineEdit;
