
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const initialForm = {
  name: "",
  generic_name: "",
  brand_names: "",
  category: "",
  active_ingredients: "",
  uses: "",
  available_forms: "",
  prescription_required: true,
  precautions: "",
  contraindications: "",
  side_effects: "",
  storage_information: "",
  additional_information: "",
  source_name: "",
  source_url: "",
  last_reviewed_at: "",
  is_published: false,
};

function splitList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateSourceUrl(value) {
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function AdminMedicineEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMedicine = useCallback(async () => {
    if (!isEditing) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("medicines")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Medicine edit fetch error:", fetchError);
      setError(fetchError.message || "Unable to load medicine.");
      setLoading(false);
      return;
    }

    setFormData({
      name: data.name || "",
      generic_name: data.generic_name || "",
      brand_names: Array.isArray(data.brand_names)
        ? data.brand_names.join(", ")
        : "",
      category: data.category || "",
      active_ingredients: Array.isArray(data.active_ingredients)
        ? data.active_ingredients
            .map((item) =>
              typeof item === "string"
                ? item
                : item?.name || item?.ingredient || JSON.stringify(item)
            )
            .join("\n")
        : "",
      uses: data.uses || "",
      available_forms: Array.isArray(data.available_forms)
        ? data.available_forms.join(", ")
        : "",
      prescription_required: data.prescription_required ?? true,
      precautions: data.precautions || "",
      contraindications: data.contraindications || "",
      side_effects: data.side_effects || "",
      storage_information: data.storage_information || "",
      additional_information: data.additional_information || "",
      source_name: data.source_name || "",
      source_url: data.source_url || "",
      last_reviewed_at: data.last_reviewed_at || "",
      is_published: data.is_published || false,
    });

    setLoading(false);
  }, [id, isEditing]);

  useEffect(() => {
    fetchMedicine();
  }, [fetchMedicine]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return "Medicine name is required.";
    }

    if (formData.is_published) {
      if (!formData.source_name.trim()) {
        return "A source name is required before publishing.";
      }

      if (!formData.source_url.trim()) {
        return "A source URL is required before publishing.";
      }

      if (!validateSourceUrl(formData.source_url)) {
        return "Enter a valid HTTP or HTTPS source URL.";
      }

      if (!formData.last_reviewed_at) {
        return "A last-reviewed date is required before publishing.";
      }

      const reviewDate = new Date(`${formData.last_reviewed_at}T00:00:00`);

      if (
        Number.isNaN(reviewDate.getTime()) ||
        reviewDate > new Date()
      ) {
        return "The last-reviewed date cannot be in the future.";
      }
    }

    if (
      formData.source_url.trim() &&
      !validateSourceUrl(formData.source_url)
    ) {
      return "Enter a valid HTTP or HTTPS source URL.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      generic_name: formData.generic_name.trim() || null,
      brand_names: splitList(formData.brand_names),
      category: formData.category.trim() || null,
      active_ingredients: formData.active_ingredients
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      uses: formData.uses.trim() || null,
      available_forms: splitList(formData.available_forms),
      prescription_required: formData.prescription_required,
      precautions: formData.precautions.trim() || null,
      contraindications: formData.contraindications.trim() || null,
      side_effects: formData.side_effects.trim() || null,
      storage_information: formData.storage_information.trim() || null,
      additional_information:
        formData.additional_information.trim() || null,
      source_name: formData.source_name.trim() || null,
      source_url: formData.source_url.trim() || null,
      last_reviewed_at: formData.last_reviewed_at || null,
      is_published: formData.is_published,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);

    let result;

    if (isEditing) {
      result = await supabase
        .from("medicines")
        .update(payload)
        .eq("id", id)
        .select("id")
        .single();
    } else {
      result = await supabase
        .from("medicines")
        .insert([payload])
        .select("id")
        .single();
    }

    if (result.error) {
      console.error("Medicine save error:", result.error);
      setError(
        result.error.message ||
          "Unable to save medicine. Check your administrator permissions."
      );
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const savedId = result.data.id;

    setSaving(false);

    navigate(`/admin/medicines/${savedId}`, {
      replace: true,
      state: {
        message: isEditing
          ? "Medicine updated successfully."
          : "Medicine created successfully.",
      },
    });
  }

  if (loading) {
    return (
      <main className="admin-medicine-edit-page">
        <div className="admin-medicine-edit-state">
          Loading medicine information...
        </div>
      </main>
    );
  }

  if (error && isEditing && !formData.name && !saving) {
    return (
      <main className="admin-medicine-edit-page">
        <div className="admin-medicine-edit-state">
          <h2>Unable to load medicine</h2>
          <p>{error}</p>
          <button type="button" onClick={fetchMedicine}>
            Try Again
          </button>
          <Link to="/admin/medicines">Back to Medicines</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-medicine-edit-page">
      <div className="admin-medicine-edit-container">
        <Link
          to={isEditing ? `/admin/medicines/${id}` : "/admin/medicines"}
          className="admin-medicine-edit-back"
        >
          ← Back
        </Link>

        <header className="admin-medicine-edit-header">
          <span>VAXCARE ADMINISTRATION</span>

          <h1>{isEditing ? "Edit Medicine" : "Add New Medicine"}</h1>

          <p>
            Enter accurate medicine information and its supporting medical
            reference. New records remain unpublished unless you explicitly
            select publication.
          </p>
        </header>

        {error && (
          <div className="admin-medicine-edit-alert error" role="alert">
            <strong>Unable to save</strong>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="admin-medicine-edit-alert success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* BASIC INFORMATION */}

          <section className="admin-medicine-form-card">
            <div className="admin-medicine-form-heading">
              <span>01</span>
              <div>
                <h2>Basic Information</h2>
                <p>Enter the medicine's identifying information.</p>
              </div>
            </div>

            <div className="admin-medicine-form-grid">
              <div className="admin-medicine-form-group">
                <label htmlFor="name">Medicine Name *</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter medicine name"
                  required
                />
              </div>

              <div className="admin-medicine-form-group">
                <label htmlFor="generic_name">Generic Name</label>
                <input
                  id="generic_name"
                  name="generic_name"
                  value={formData.generic_name}
                  onChange={handleChange}
                  placeholder="Enter generic name"
                />
              </div>

              <div className="admin-medicine-form-group">
                <label htmlFor="category">Category</label>
                <input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter category"
                />
              </div>

              <div className="admin-medicine-form-group">
                <label htmlFor="brand_names">Brand Names</label>
                <input
                  id="brand_names"
                  name="brand_names"
                  value={formData.brand_names}
                  onChange={handleChange}
                  placeholder="Separate names with commas"
                />
                <small>Only enter verified brand names.</small>
              </div>
            </div>
          </section>

          {/* INGREDIENTS AND FORMS */}

          <section className="admin-medicine-form-card">
            <div className="admin-medicine-form-heading">
              <span>02</span>
              <div>
                <h2>Ingredients and Available Forms</h2>
                <p>Describe the recorded ingredients and formulations.</p>
              </div>
            </div>

            <div className="admin-medicine-form-grid">
              <div className="admin-medicine-form-group full">
                <label htmlFor="active_ingredients">
                  Active Ingredients
                </label>
                <textarea
                  id="active_ingredients"
                  name="active_ingredients"
                  value={formData.active_ingredients}
                  onChange={handleChange}
                  rows={4}
                  placeholder={"Enter one ingredient per line"}
                />
                <small>
                  Each line is stored as a separate ingredient entry.
                </small>
              </div>

              <div className="admin-medicine-form-group full">
                <label htmlFor="available_forms">Available Forms</label>
                <input
                  id="available_forms"
                  name="available_forms"
                  value={formData.available_forms}
                  onChange={handleChange}
                  placeholder="Separate forms with commas"
                />
                <small>
                  Only include formulations verified by your source.
                </small>
              </div>
            </div>
          </section>

          {/* MEDICAL INFORMATION */}

          <section className="admin-medicine-form-card">
            <div className="admin-medicine-form-heading">
              <span>03</span>
              <div>
                <h2>Medical Information</h2>
                <p>
                  Record source-supported information. Do not add
                  unverified claims or individualized treatment instructions.
                </p>
              </div>
            </div>

            <div className="admin-medicine-form-grid">
              <div className="admin-medicine-form-group full">
                <label htmlFor="uses">Uses</label>
                <textarea
                  id="uses"
                  name="uses"
                  value={formData.uses}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter verified medical uses"
                />
              </div>

              <div className="admin-medicine-form-group full">
                <label htmlFor="precautions">Precautions</label>
                <textarea
                  id="precautions"
                  name="precautions"
                  value={formData.precautions}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter source-supported precautions"
                />
              </div>

              <div className="admin-medicine-form-group full">
                <label htmlFor="contraindications">
                  Contraindications
                </label>
                <textarea
                  id="contraindications"
                  name="contraindications"
                  value={formData.contraindications}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter verified contraindications"
                />
              </div>

              <div className="admin-medicine-form-group full">
                <label htmlFor="side_effects">Possible Side Effects</label>
                <textarea
                  id="side_effects"
                  name="side_effects"
                  value={formData.side_effects}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter documented side effects"
                />
              </div>

              <div className="admin-medicine-form-group full">
                <label htmlFor="storage_information">
                  Storage Information
                </label>
                <textarea
                  id="storage_information"
                  name="storage_information"
                  value={formData.storage_information}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter verified storage guidance"
                />
              </div>

              <div className="admin-medicine-form-group full">
                <label htmlFor="additional_information">
                  Additional Information
                </label>
                <textarea
                  id="additional_information"
                  name="additional_information"
                  value={formData.additional_information}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter other relevant, verified information"
                />
              </div>
            </div>

            <div className="admin-medicine-prescription-control">
              <input
                id="prescription_required"
                name="prescription_required"
                type="checkbox"
                checked={formData.prescription_required}
                onChange={handleChange}
              />

              <label htmlFor="prescription_required">
                Mark as requiring a prescription
              </label>
            </div>

            <p className="admin-medicine-form-hint">
              Leave this checked unless the prescription classification has
              been verified for the relevant medicine and formulation.
            </p>
          </section>

          {/* MEDICAL SOURCE */}

          <section className="admin-medicine-form-card">
            <div className="admin-medicine-form-heading">
              <span>04</span>
              <div>
                <h2>Medical Reference</h2>
                <p>
                  Record the source used to verify the medicine information.
                </p>
              </div>
            </div>

            <div className="admin-medicine-form-grid">
              <div className="admin-medicine-form-group">
                <label htmlFor="source_name">Source Name</label>
                <input
                  id="source_name"
                  name="source_name"
                  value={formData.source_name}
                  onChange={handleChange}
                  placeholder="Official source or publication"
                />
              </div>

              <div className="admin-medicine-form-group">
                <label htmlFor="last_reviewed_at">Last Reviewed Date</label>
                <input
                  id="last_reviewed_at"
                  name="last_reviewed_at"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={formData.last_reviewed_at}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-medicine-form-group full">
                <label htmlFor="source_url">Source URL</label>
                <input
                  id="source_url"
                  name="source_url"
                  type="url"
                  value={formData.source_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <small>
                  Use a genuine, accessible medical reference. A URL alone
                  does not establish that the information is accurate.
                </small>
              </div>
            </div>
          </section>

          {/* PUBLICATION */}

          <section className="admin-medicine-form-card">
            <div className="admin-medicine-form-heading">
              <span>05</span>
              <div>
                <h2>Publication Settings</h2>
                <p>Choose whether this record should appear publicly.</p>
              </div>
            </div>

            <label className="admin-medicine-publish-toggle">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
              />

              <span>
                <strong>Publish this medicine</strong>
                <small>
                  Published records become visible in the public Medicines
                  directory.
                </small>
              </span>
            </label>

            <p className="admin-medicine-form-hint">
              Publishing requires a source name, valid HTTP/HTTPS source URL
              and a last-reviewed date. Verify the medical content before
              making it public.
            </p>
          </section>

          {/* FORM ACTIONS */}

          <div className="admin-medicine-form-actions">
            <Link
              to={isEditing ? `/admin/medicines/${id}` : "/admin/medicines"}
              className="admin-medicine-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-medicine-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Medicine"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminMedicineEdit;
