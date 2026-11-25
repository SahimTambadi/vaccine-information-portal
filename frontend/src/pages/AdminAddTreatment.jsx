
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Info } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./AdminAddTreatment.css";

const initialForm = {
  disease_id: "",
  treatment_name: "",
  treatment_type: "medication",
  description: "",
  benefits: "",
  precautions: "",
  source_name: "",
  source_title: "",
  source_url: "",
  source_published_on: "",
  evidence_note: "",
};

function AdminAddTreatment() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [diseases, setDiseases] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoading(true);
    setError("");

    const [diseaseResult, medicineResult] = await Promise.all([
      supabase
        .from("diseases")
        .select("id, name")
        .order("name"),

      supabase
        .from("medicines")
        .select("id, name, generic_name, review_status")
        .eq("review_status", "verified")
        .order("name"),
    ]);

    if (diseaseResult.error) {
      setError(diseaseResult.error.message);
    } else {
      setDiseases(diseaseResult.data || []);
    }

    if (medicineResult.error) {
      setError((previous) =>
        previous
          ? `${previous}; ${medicineResult.error.message}`
          : medicineResult.error.message
      );
    } else {
      setMedicines(medicineResult.data || []);
    }

    setLoading(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleMedicineChange = (event) => {
    const values = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );

    setSelectedMedicines(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.disease_id ||
      !form.treatment_name.trim() ||
      !form.source_name.trim() ||
      !form.source_url.trim()
    ) {
      setError(
        "Please provide a disease, treatment name and medical source."
      );
      return;
    }

    try {
      setSaving(true);

      const treatmentPayload = {
        ...form,
        disease_id: Number(form.disease_id),
        treatment_name: form.treatment_name.trim(),
        description: form.description.trim() || null,
        benefits: form.benefits.trim() || null,
        precautions: form.precautions.trim() || null,
        source_name: form.source_name.trim(),
        source_title: form.source_title.trim() || null,
        source_url: form.source_url.trim(),
        source_published_on: form.source_published_on || null,
        evidence_note: form.evidence_note.trim() || null,
        review_status: "pending",
        is_published: false,
      };

      const { data: treatment, error: treatmentError } = await supabase
        .from("disease_treatments")
        .insert([treatmentPayload])
        .select("id")
        .single();

      if (treatmentError) throw treatmentError;

      if (selectedMedicines.length > 0) {
        const medicineRows = selectedMedicines.map((medicineId) => ({
          treatment_id: treatment.id,
          medicine_id: Number(medicineId),
        }));

        const { error: medicineError } = await supabase
          .from("treatment_medicines")
          .insert(medicineRows);

        if (medicineError) {
          // Roll back the treatment if its medicine associations fail.
          const { error: rollbackError } = await supabase
            .from("disease_treatments")
            .delete()
            .eq("id", treatment.id);

          if (rollbackError) {
            console.error("Treatment rollback failed:", rollbackError);
          }

          throw medicineError;
        }
      }

      setSuccess("Treatment saved successfully as pending review.");

      setTimeout(() => {
        navigate("/admin/treatments");
      }, 1200);
    } catch (submitError) {
      console.error("Treatment save error:", submitError);
      setError(submitError.message || "Unable to save treatment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-add-treatment-page">
        <div className="admin-add-treatment-loading">
          Loading diseases and medicines...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-add-treatment-page">
      <div className="admin-add-treatment-container">

        <Link
          to="/admin/treatments"
          className="admin-add-treatment-back"
        >
          <ArrowLeft size={18} />
          Back to Treatments
        </Link>

        <div className="admin-add-treatment-header">
          <span>CONTENT MANAGEMENT</span>
          <h1>Add New Treatment</h1>
          <p>
            Add evidence-supported treatment information and submit it
            for admin verification.
          </p>
        </div>

        <div className="admin-add-treatment-notice">
          <Info size={20} />
          <div>
            <strong>Medical content review required</strong>
            <p>
              New treatment records remain unpublished until they have
              been reviewed and verified.
            </p>
          </div>
        </div>

        {error && (
          <div className="admin-add-treatment-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-add-treatment-success">
            {success}
          </div>
        )}

        <form
          className="admin-add-treatment-form"
          onSubmit={handleSubmit}
        >

          <section className="admin-add-treatment-section">
            <h2>Basic Treatment Information</h2>

            <div className="admin-add-treatment-grid">

              <div className="admin-add-treatment-field full">
                <label htmlFor="treatment_name">
                  Treatment Name *
                </label>
                <input
                  id="treatment_name"
                  name="treatment_name"
                  value={form.treatment_name}
                  onChange={handleChange}
                  placeholder="Enter treatment name"
                  required
                />
              </div>

              <div className="admin-add-treatment-field">
                <label htmlFor="disease_id">
                  Related Disease *
                </label>

                <select
                  id="disease_id"
                  name="disease_id"
                  value={form.disease_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a disease</option>
                  {diseases.map((disease) => (
                    <option key={disease.id} value={disease.id}>
                      {disease.name}
                    </option>
                  ))}
                </select>

                {diseases.length === 0 && (
                  <small>No disease records are available.</small>
                )}
              </div>

              <div className="admin-add-treatment-field">
                <label htmlFor="treatment_type">
                  Treatment Category *
                </label>

                <select
                  id="treatment_type"
                  name="treatment_type"
                  value={form.treatment_type}
                  onChange={handleChange}
                  required
                >
                  <option value="medication">Medication</option>
                  <option value="surgery">Surgery</option>
                  <option value="therapy">Therapy</option>
                  <option value="physiotherapy">Physiotherapy</option>
                  <option value="lifestyle">Lifestyle Management</option>
                  <option value="procedure">Medical Procedure</option>
                  <option value="other">Other</option>
                </select>
              </div>

            </div>
          </section>

          <section className="admin-add-treatment-section">
            <h2>Treatment Details</h2>

            <div className="admin-add-treatment-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the treatment using a reliable medical source..."
              />
            </div>

            <div className="admin-add-treatment-field">
              <label htmlFor="benefits">
                Potential Benefits
              </label>
              <textarea
                id="benefits"
                name="benefits"
                rows="3"
                value={form.benefits}
                onChange={handleChange}
                placeholder="Enter evidence-supported information..."
              />
            </div>

            <div className="admin-add-treatment-field">
              <label htmlFor="precautions">
                Precautions and Considerations
              </label>
              <textarea
                id="precautions"
                name="precautions"
                rows="3"
                value={form.precautions}
                onChange={handleChange}
                placeholder="Enter relevant precautions..."
              />
            </div>
          </section>

          <section className="admin-add-treatment-section">
            <h2>Associated Medicines</h2>

            <div className="admin-add-treatment-field">
              <label htmlFor="medicines">
                Select Existing Verified Medicines
              </label>

              <select
                id="medicines"
                multiple
                value={selectedMedicines}
                onChange={handleMedicineChange}
                className="admin-add-treatment-medicine-select"
              >
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name}
                    {medicine.generic_name
                      ? ` (${medicine.generic_name})`
                      : ""}
                  </option>
                ))}
              </select>

              <small>
                Hold Ctrl (Windows) or Command (Mac) to select multiple
                medicines. Only verified existing medicine records are
                available here. Association does not mean every medicine
                is appropriate for every patient.
              </small>
            </div>
          </section>

          <section className="admin-add-treatment-section">
            <h2>Medical Evidence and References</h2>

            <div className="admin-add-treatment-grid">

              <div className="admin-add-treatment-field">
                <label htmlFor="source_name">
                  Source Organization *
                </label>
                <input
                  id="source_name"
                  name="source_name"
                  value={form.source_name}
                  onChange={handleChange}
                  placeholder="e.g. WHO, ICMR, MoHFW"
                  required
                />
              </div>

              <div className="admin-add-treatment-field">
                <label htmlFor="source_title">
                  Reference Title
                </label>
                <input
                  id="source_title"
                  name="source_title"
                  value={form.source_title}
                  onChange={handleChange}
                  placeholder="Enter publication or guideline title"
                />
              </div>

              <div className="admin-add-treatment-field full">
                <label htmlFor="source_url">
                  Source URL *
                </label>
                <input
                  id="source_url"
                  name="source_url"
                  type="url"
                  value={form.source_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="admin-add-treatment-field">
                <label htmlFor="source_published_on">
                  Source Publication Date
                </label>
                <input
                  id="source_published_on"
                  name="source_published_on"
                  type="date"
                  value={form.source_published_on}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-add-treatment-field full">
                <label htmlFor="evidence_note">
                  Evidence Notes
                </label>
                <textarea
                  id="evidence_note"
                  name="evidence_note"
                  rows="4"
                  value={form.evidence_note}
                  onChange={handleChange}
                  placeholder="Explain which statements this source supports and any limitations..."
                />
              </div>

            </div>
          </section>

          <div className="admin-add-treatment-footer">
            <Link
              to="/admin/treatments"
              className="admin-add-treatment-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-add-treatment-submit"
              disabled={saving || diseases.length === 0}
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save as Pending Review"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AdminAddTreatment;
