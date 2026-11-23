
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const initialForm = {
  name: "",
  full_name: "",
  category: "",
  purpose: "",
  age: "",
  icon: "💉",
};

function AdminVaccineEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchVaccine = useCallback(async () => {
    if (!isEditing) {
      setFormData(initialForm);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("vaccines")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Vaccine fetch error:", fetchError);
      setError("Unable to load vaccine: " + fetchError.message);
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
  }, [id, isEditing]);

  useEffect(() => {
    fetchVaccine();
  }, [fetchVaccine]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.purpose.trim() ||
      !formData.age.trim()
    ) {
      setError("Please complete all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setError("");

    const vaccineData = {
      name: formData.name.trim(),
      full_name: formData.full_name.trim() || null,
      category: formData.category.trim(),
      purpose: formData.purpose.trim(),
      age: formData.age.trim(),
      icon: formData.icon.trim() || "💉",
    };

    let result;

    if (isEditing) {
      result = await supabase
        .from("vaccines")
        .update(vaccineData)
        .eq("id", id)
        .select("id")
        .maybeSingle();
    } else {
      result = await supabase
        .from("vaccines")
        .insert([vaccineData])
        .select("id")
        .single();
    }

    if (result.error) {
      console.error("Vaccine save error:", result.error);
      setError(
        `Unable to ${isEditing ? "update" : "create"} vaccine: ${result.error.message}`
      );
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!result.data?.id) {
      setError(
        "No vaccine record was returned. Check your administrator permissions."
      );
      setSaving(false);
      return;
    }

    navigate(`/admin/vaccines/${result.data.id}`, {
      replace: true,
      state: {
        message: isEditing
          ? "Vaccine updated successfully."
          : "Vaccine created successfully.",
      },
    });
  }

  const backLink = isEditing
    ? `/admin/vaccines/${id}`
    : "/admin/vaccines";

  if (loading) {
    return (
      <main className="app admin-vaccine-page">
        <p>Loading vaccine information...</p>
      </main>
    );
  }

  if (error && isEditing && !formData.name) {
    return (
      <main className="app admin-vaccine-page">
        <section className="admin-form-section">
          <div className="admin-form-heading">
            <h2>Unable to load vaccine</h2>
            <p className="auth-error">{error}</p>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-save-button"
              onClick={fetchVaccine}
            >
              Try Again
            </button>

            <Link
              to="/admin/vaccines"
              className="admin-cancel-button admin-edit-link"
            >
              Back to Vaccines
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app admin-vaccine-page">

      {/* PAGE HERO */}

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">VAXCARE ADMINISTRATION</p>

          <h1>
            {isEditing ? (
              <>Edit <span>Vaccine.</span></>
            ) : (
              <>Add <span>Vaccine.</span></>
            )}
          </h1>

          <p className="hero-description">
            {isEditing
              ? "Update the selected vaccine information."
              : "Create a new vaccine information record for VaxCare."}
          </p>

          <Link to={backLink} className="hero-button">
            ← Back to Vaccines
          </Link>
        </div>

        <div className="hero-visual">
          <div className="medical-circle">
            {isEditing ? "✏️" : "💉"}
          </div>
        </div>
      </section>

      {/* FORM */}

      <section className="admin-form-section">

        <div className="admin-form-heading">
          <p className="eyebrow">
            {isEditing ? "UPDATE RECORD" : "NEW RECORD"}
          </p>

          <h2>
            {isEditing
              ? "Edit Vaccine Information"
              : "Create Vaccine Information"}
          </h2>

          <p>
            {isEditing
              ? `Vaccine ID: ${id}`
              : "Complete the required information below."}
          </p>
        </div>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <form
          className="admin-vaccine-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-form-group">
            <label htmlFor="name">Vaccine Name *</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter vaccine name"
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
              placeholder="Enter full vaccine name"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="category">Category *</label>
            <input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Enter vaccine category"
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
              placeholder="Enter source-supported age information"
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
              placeholder="Enter verified vaccine purpose"
              rows={4}
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
              placeholder="💉"
            />
          </div>

          <div className="admin-form-actions">

            <Link
              to={backLink}
              className="admin-cancel-button admin-edit-link"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Vaccine"
                  : "Create Vaccine"}
            </button>

          </div>
        </form>

        <p className="admin-form-note">
          Enter accurate vaccine information supported by reliable
          medical references. Verify all details before making
          information available to users.
        </p>

      </section>
    </main>
  );
}

export default AdminVaccineEdit;
