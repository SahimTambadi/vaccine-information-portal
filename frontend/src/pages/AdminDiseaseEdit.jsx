
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "./AdminDiseaseEdit.css";

// ==========================================
// GENERATE URL-FRIENDLY SLUG
// ==========================================

function generateSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ==========================================
// ADMIN DISEASE EDIT COMPONENT
// ==========================================

function AdminDiseaseEdit() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    overview: "",
    causes: "",
    risk_factors: "",
    complications: "",
    prevention: "",
    diagnosis: "",
    when_to_seek_help: "",
    source_name: "",
    source_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  // ==========================================
  // VALIDATE FORM
  // ==========================================

  function validateForm() {
    if (!formData.name.trim()) {
      return "Please enter the disease name.";
    }

    if (!formData.description.trim()) {
      return "Please enter a disease description.";
    }

    if (!formData.overview.trim()) {
      return "Please enter the disease overview.";
    }

    if (!formData.source_name.trim()) {
      return "Please enter the medical source name.";
    }

    if (!formData.source_url.trim()) {
      return "Please enter the medical source URL.";
    }

    try {
      const sourceUrl = new URL(formData.source_url.trim());

      if (!["http:", "https:"].includes(sourceUrl.protocol)) {
        return "Source URL must use HTTP or HTTPS.";
      }
    } catch {
      return "Please enter a valid source URL.";
    }

    if (!generateSlug(formData.name)) {
      return "Please enter a valid disease name.";
    }

    return "";
  }

  // ==========================================
  // SAVE DISEASE
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const slug = generateSlug(formData.name);

      const diseaseData = {
        name: formData.name.trim(),
        slug,

        description: formData.description.trim(),
        overview: formData.overview.trim(),

        causes: formData.causes.trim() || null,
        risk_factors: formData.risk_factors.trim() || null,
        complications: formData.complications.trim() || null,
        prevention: formData.prevention.trim() || null,
        diagnosis: formData.diagnosis.trim() || null,
        when_to_seek_help:
          formData.when_to_seek_help.trim() || null,

        source_name: formData.source_name.trim(),
        source_url: formData.source_url.trim(),

        review_status: "pending",
      };

      const { error: insertError } = await supabase
        .from("diseases")
        .insert([diseaseData]);

      if (insertError) {
        console.error("Disease insertion error:", insertError);

        if (insertError.code === "23505") {
          setError(
            "A disease with this URL slug already exists. Check the disease name."
          );
        } else {
          setError(
            insertError.message ||
              "Unable to save the disease. Please try again."
          );
        }

        return;
      }

      setSuccess(
        "Disease added successfully. It is now waiting for administrator verification."
      );

      setTimeout(() => {
        navigate("/admin/diseases");
      }, 1200);
    } catch (err) {
      console.error("Unexpected disease save error:", err);

      setError(
        "An unexpected error occurred while saving the disease."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // REUSABLE TEXTAREA FIELD
  // ==========================================

  function renderTextarea(name, label, placeholder, required = false) {
    return (
      <div className="admin-disease-form-group">
        <label htmlFor={name}>
          {label}
          {required && <span className="required-star"> *</span>}
        </label>

        <textarea
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          rows={4}
          required={required}
        />
      </div>
    );
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main className="admin-disease-edit-page">

      {/* PAGE HEADER */}

      <section className="admin-disease-edit-hero">
        <div>
          <span className="admin-disease-edit-eyebrow">
            VAXCARE ADMINISTRATION
          </span>

          <h1>
            Add <span>New Disease</span>
          </h1>

          <p>
            Enter accurate, evidence-based disease information
            for the VaxCare healthcare directory.
          </p>
        </div>

        <div className="admin-disease-edit-hero-icon">
          🦠
        </div>
      </section>

      {/* BACK NAVIGATION */}

      <div className="admin-disease-edit-back">
        <Link to="/admin/diseases">
          <ArrowLeft size={18} />
          Back to Disease Management
        </Link>
      </div>

      {/* FORM CONTAINER */}

      <section className="admin-disease-form-container">

        <div className="admin-disease-form-heading">
          <div>
            <span className="admin-disease-edit-eyebrow">
              DISEASE INFORMATION
            </span>

            <h2>Disease Details</h2>

            <p>
              Fill in the available verified information.
              Avoid unsupported medical claims.
            </p>
          </div>

          <div className="admin-disease-pending-label">
            <ShieldCheck size={17} />
            Pending Review
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* BASIC INFORMATION */}

          <div className="admin-disease-form-section">
            <h3>Basic Information</h3>

            <div className="admin-disease-form-group">
  <label htmlFor="name">
    Disease Name <span className="required-star">*</span>
  </label>

  <input
    id="name"
    name="name"
    type="text"
    value={formData.name}
    onChange={handleChange}
    placeholder="Enter the official disease name"
    required
  />
</div>

            {renderTextarea(
              "description",
              "Short Description",
              "Enter a concise, accurate description",
              true
            )}

            {renderTextarea(
              "overview",
              "Disease Overview",
              "Explain the disease and its general characteristics",
              true
            )}
          </div>

          {/* MEDICAL INFORMATION */}

          <div className="admin-disease-form-section">
            <h3>Medical Information</h3>

            {renderTextarea(
              "causes",
              "Causes",
              "Explain established causes of the disease"
            )}

            {renderTextarea(
              "risk_factors",
              "Risk Factors",
              "Describe evidence-supported risk factors"
            )}

            {renderTextarea(
              "complications",
              "Complications",
              "Describe recognized complications"
            )}

            {renderTextarea(
              "prevention",
              "Prevention",
              "Enter evidence-based prevention information"
            )}

            {renderTextarea(
              "diagnosis",
              "Diagnosis",
              "Describe how healthcare professionals diagnose the condition"
            )}

            {renderTextarea(
              "when_to_seek_help",
              "When to Seek Medical Help",
              "Describe appropriate reasons to seek professional medical care"
            )}
          </div>

          {/* SOURCE INFORMATION */}

          <div className="admin-disease-form-section">
            <h3>Medical Source Reference</h3>

            <p className="admin-disease-source-note">
              Provide a trustworthy reference supporting the
              disease information. Examples include WHO, ICMR,
              MoHFW, CDC and recognized medical institutions.
            </p>

            <div className="admin-disease-form-group">
              <label htmlFor="source_name">
                Source Name <span className="required-star">*</span>
              </label>

              <input
                id="source_name"
                name="source_name"
                type="text"
                value={formData.source_name}
                onChange={handleChange}
                placeholder="e.g. World Health Organization"
                required
              />
            </div>

            <div className="admin-disease-form-group">
              <label htmlFor="source_url">
                Source URL <span className="required-star">*</span>
              </label>

              <input
                id="source_url"
                name="source_url"
                type="url"
                value={formData.source_url}
                onChange={handleChange}
                placeholder="https://www.who.int/..."
                required
              />
            </div>
          </div>

          {/* REVIEW NOTICE */}

          <div className="admin-disease-review-notice">
            <ShieldCheck size={22} />

            <div>
              <strong>Medical Verification Required</strong>

              <p>
                This disease will be saved as pending.
                It will not appear in the public disease directory
                until an administrator verifies the information.
              </p>
            </div>
          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <div className="admin-disease-message admin-disease-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* SUCCESS MESSAGE */}

          {success && (
            <div className="admin-disease-message admin-disease-success">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          {/* FORM ACTIONS */}

          <div className="admin-disease-form-actions">

            <Link
              to="/admin/diseases"
              className="admin-disease-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-disease-save-button"
              disabled={loading}
            >
              <Save size={18} />

              {loading ? "Saving..." : "Save Disease"}
            </button>

          </div>

        </form>
      </section>

    </main>
  );
}

export default AdminDiseaseEdit;
