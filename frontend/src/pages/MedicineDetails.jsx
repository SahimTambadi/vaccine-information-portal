
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function MedicineDetails() {
  const { id } = useParams();

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchMedicine() {
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("medicines")
          .select(`
            id,
            name,
            generic_name,
            brand_names,
            category,
            active_ingredients,
            uses,
            available_forms,
            prescription_required,
            precautions,
            contraindications,
            side_effects,
            storage_information,
            additional_information,
            source_name,
            source_url,
            last_reviewed_at
          `)
          .eq("id", id)
          .eq("is_published", true)
          .single();

        if (error) throw error;

        if (active) setMedicine(data);
      } catch (err) {
        console.error("Error fetching medicine:", err);

        if (active) {
          setError(
            "Medicine information could not be found or is currently unavailable."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchMedicine();

    return () => {
      active = false;
    };
  }, [id]);

  function DetailSection({ title, children }) {
    return (
      <section className="medicine-detail-section">
        <h2>{title}</h2>
        {children}
      </section>
    );
  }

  function Information({ value }) {
    return (
      <p>
        {value || "Verified information is not currently available."}
      </p>
    );
  }

  function ItemList({ items }) {
    if (!Array.isArray(items) || items.length === 0) {
      return <p>Information is not currently available.</p>;
    }

    return (
      <ul className="medicine-detail-list">
        {items.map((item, index) => (
          <li key={`${index}-${typeof item === "string" ? item : item?.name || "item"}`}>
            {typeof item === "string"
              ? item
              : item?.name || JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (loading) {
    return (
      <main className="app medicine-detail-page">
        <div className="medicine-state">
          <div className="medicine-loader" />
          <h3>Loading medicine information...</h3>
        </div>
      </main>
    );
  }

  if (error || !medicine) {
    return (
      <main className="app medicine-detail-page">
        <div className="medicine-state medicine-error">
          <h2>Medicine unavailable</h2>
          <p>{error || "This medicine is not available."}</p>
          <Link to="/medicines" className="medicine-details-button">
            Back to Medicines
          </Link>
        </div>
      </main>
    );
  }

  const ingredients = Array.isArray(medicine.active_ingredients)
    ? medicine.active_ingredients
    : [];

  return (
    <main className="app medicine-detail-page">

      {/* HERO */}

      <section className="medicine-detail-hero">
        <div>
          <span className="medicine-eyebrow">
            VAXCARE MEDICINE INFORMATION
          </span>

          <h1>{medicine.name}</h1>

          {medicine.generic_name && (
            <p className="medicine-detail-generic">
              Generic name: {medicine.generic_name}
            </p>
          )}

          <p>
            {medicine.category || "Medicine information"}
          </p>

          <Link to="/medicines" className="medicine-back-link">
            ← Back to Medicines
          </Link>
        </div>

        <div className="medicine-detail-hero-icon" aria-hidden="true">
          💊
        </div>
      </section>

      {/* PRESCRIPTION INFORMATION */}

      <section className="medicine-prescription-notice">
        <strong>
          {medicine.prescription_required
            ? "Prescription required"
            : "Prescription requirement not marked"}
        </strong>

        <p>
          Always confirm medicine suitability and prescription requirements
          with a qualified healthcare professional.
        </p>
      </section>

      {/* BASIC INFORMATION */}

      <DetailSection title="Medicine Overview">
        <div className="medicine-detail-grid">

          <div>
            <span>Medicine name</span>
            <strong>{medicine.name}</strong>
          </div>

          <div>
            <span>Generic name</span>
            <strong>{medicine.generic_name || "Not provided"}</strong>
          </div>

          <div>
            <span>Category</span>
            <strong>{medicine.category || "Not provided"}</strong>
          </div>

          <div>
            <span>Prescription status</span>
            <strong>
              {medicine.prescription_required
                ? "Prescription required"
                : "Not marked as prescription-required"}
            </strong>
          </div>

        </div>
      </DetailSection>

      {/* BRAND NAMES */}

      {medicine.brand_names?.length > 0 && (
        <DetailSection title="Brand Names">
          <ItemList items={medicine.brand_names} />
          <p className="medicine-small-note">
            Brand availability and formulations can vary. Verify the
            specific product and its approved information.
          </p>
        </DetailSection>
      )}

      {/* INGREDIENTS */}

      <DetailSection title="Active Ingredients">
        <ItemList items={ingredients} />
      </DetailSection>

      {/* FORMS */}

      <DetailSection title="Available Forms">
        <ItemList items={medicine.available_forms} />
      </DetailSection>

      {/* USES */}

      <DetailSection title="Medical Uses">
        <Information value={medicine.uses} />
      </DetailSection>

      {/* PRECAUTIONS */}

      <DetailSection title="Precautions">
        <Information value={medicine.precautions} />
      </DetailSection>

      {/* CONTRAINDICATIONS */}

      <DetailSection title="Contraindications">
        <Information value={medicine.contraindications} />
      </DetailSection>

      {/* SIDE EFFECTS */}

      <DetailSection title="Possible Side Effects">
        <Information value={medicine.side_effects} />
      </DetailSection>

      {/* STORAGE */}

      <DetailSection title="Storage Information">
        <Information value={medicine.storage_information} />
      </DetailSection>

      {/* ADDITIONAL INFORMATION */}

      {medicine.additional_information && (
        <DetailSection title="Additional Information">
          <Information value={medicine.additional_information} />
        </DetailSection>
      )}

      {/* SOURCE */}

      <DetailSection title="Medical References">
        {medicine.source_name && (
          <p>
            <strong>Source:</strong> {medicine.source_name}
          </p>
        )}

        {medicine.source_url && (
          <a
            href={medicine.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="medicine-source-link"
          >
            View Reference Source ↗
          </a>
        )}

        {medicine.last_reviewed_at && (
          <p>
            <strong>Last reviewed:</strong>{" "}
            {new Date(`${medicine.last_reviewed_at}T00:00:00`).toLocaleDateString("en-IN")}
          </p>
        )}

        {!medicine.source_name && !medicine.source_url && (
          <p>Reference information is not available.</p>
        )}
      </DetailSection>

      {/* DISCLAIMER */}

      <section className="medicine-disclaimer">
        <span>ⓘ</span>
        <p>
          <strong>Medical disclaimer:</strong> This page provides
          educational information, not a diagnosis or prescription.
          Never change medication or treatment without consulting
          an appropriately qualified healthcare professional.
          Seek urgent medical attention for a suspected severe
          allergic reaction or other serious adverse event.
        </p>
      </section>

    </main>
  );
}

export default MedicineDetails;
