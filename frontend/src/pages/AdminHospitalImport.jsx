
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  MapPin,
  Building2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./AdminHospitalImport.css";

const GOVERNMENT_SOURCE =
  "https://belagavi.nic.in/en/public-utility-category/hospitals/";

const KLE_SOURCE = "https://www.klehospital.org/hospitals";

const CANTONMENT_SOURCE =
  "https://belgaum.cantt.gov.in/hospital-2/";

const hospitalImportCatalogue = [
  {
    id: "kle-prabhakar-kore",
    name: "KLES Dr. Prabhakar Kore Hospital & Medical Research Centre",
    hospital_type: "Multispeciality Hospital",
    phone: "0831-2473777",
    website_url: "https://www.klehospital.org/",
    address:
      "KLE Society's Dr. Prabhakar Kore Hospital & Medical Research Centre, Nehru Nagar",
    locality: "Nehru Nagar",
    city: "Belagavi",
    state: "Karnataka",
    pincode: "590010",
    source_name: "KLE Hospitals Official Website",
    source_type: "Hospital",
    source_url: KLE_SOURCE,
    evidence_note:
      "Hospital name, location and contact details listed by KLE Society.",
  },
  {
    id: "kle-cancer",
    name: "KLE Society's Belgaum Cancer Hospital",
    hospital_type: "Speciality Hospital",
    phone: "0831-2472770",
    website_url: "https://www.klehospital.org/",
    address:
      "9666-A-2/D, Ashok Nagar, Behind BUDA Office, Belagavi",
    locality: "Ashok Nagar",
    city: "Belagavi",
    state: "Karnataka",
    pincode: "590016",
    source_name: "KLE Society Official Healthcare Directory",
    source_type: "Hospital",
    source_url: "https://klesociety.org/health-care-institutions/",
    evidence_note:
      "Hospital name, address and contact details listed by KLE Society.",
  },
  {
    id: "kle-centenary",
    name: "KLE Centenary Charitable Hospital & Medical Research Centre",
    hospital_type: "General Hospital",
    phone: "0831-2413777",
    website_url: "https://www.klecchospital.org/",
    address:
      "Near Annapurneshwari Temple, Vadgoan, Yellur Road, Belagavi",
    locality: "Vadgoan",
    city: "Belagavi",
    state: "Karnataka",
    pincode: "590005",
    source_name: "KLE Society Official Healthcare Directory",
    source_type: "Hospital",
    source_url: "https://klesociety.org/health-care-institutions/",
    evidence_note:
      "Hospital name, address and contact details listed by KLE Society.",
  },
  {
    id: "lakeview-hospital",
    name: "Lakeview Hospital",
    hospital_type: "Multispeciality Hospital",
    phone: "",
    website_url: "https://lakeviewhospitals.in/",
    address:
      "R.S. No. 73/7, C.T.S. No. 11888, Opposite Fort Lake, Belagavi",
    locality: "Fort Lake",
    city: "Belagavi",
    state: "Karnataka",
    pincode: "590016",
    source_name: "Belagavi District Government Directory",
    source_type: "Government",
    source_url: GOVERNMENT_SOURCE,
    evidence_note:
      "Hospital name and address listed in the district government directory.",
  },
  {
    id: "vijaya-ortho",
    name: "Vijaya Ortho & Trauma Centre Hospital",
    hospital_type: "Speciality Hospital",
    phone: "7022120090",
    website_url: "",
    address:
      "Ayodhya Nagar, Sadashiv Nagar, Belagavi",
    locality: "Sadashiv Nagar",
    city: "Belagavi",
    state: "Karnataka",
    pincode: "590019",
    source_name: "Belagavi District Government Directory",
    source_type: "Government",
    source_url: GOVERNMENT_SOURCE,
    evidence_note:
      "Hospital name, address and phone listed in the district government directory.",
  },
  {
    id: "cantonment-general",
    name: "Belagavi Cantonment Board General Hospital",
    hospital_type: "General Hospital",
    phone: "0831-2424401",
    website_url: "https://belgaum.cantt.gov.in/hospital-2/",
    address: "Khanapur Road, Camp Belagavi",
    locality: "Camp",
    city: "Belagavi",
    state: "Karnataka",
    pincode: "590001",
    source_name: "Belagavi Cantonment Board Official Website",
    source_type: "Government",
    source_url: CANTONMENT_SOURCE,
    evidence_note:
      "Hospital name, address and contact information listed by the Cantonment Board.",
  },
];

function createSlug(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

function AdminHospitalImport() {
  const [search, setSearch] = useState("");
  const [importedIds, setImportedIds] = useState([]);
  const [loadingId, setLoadingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredHospitals = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return hospitalImportCatalogue;

    return hospitalImportCatalogue.filter((hospital) =>
      [
        hospital.name,
        hospital.hospital_type,
        hospital.locality,
        hospital.city,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [search]);

  const handleImport = async (hospital) => {
    if (importedIds.includes(hospital.id)) return;

    try {
      setLoadingId(hospital.id);
      setError("");
      setSuccess("");

      const hospitalPayload = {
        name: hospital.name,
        slug: createSlug(hospital.name),
        hospital_type: hospital.hospital_type,
        phone: hospital.phone || null,
        website_url: hospital.website_url || null,
        review_status: "pending",
      };

      const { data: insertedHospital, error: hospitalError } =
        await supabase
          .from("hospitals")
          .insert(hospitalPayload)
          .select("id")
          .single();

      if (hospitalError) throw hospitalError;

      const hospitalId = insertedHospital.id;

      try {
        const { error: locationError } = await supabase
          .from("hospital_locations")
          .insert({
            hospital_id: hospitalId,
            branch_name: hospital.name,
            address: hospital.address,
            locality: hospital.locality,
            city: hospital.city,
            state: hospital.state,
            pincode: hospital.pincode,
            is_primary: true,
            review_status: "pending",
          });

        if (locationError) throw locationError;

        const { error: sourceError } = await supabase
          .from("hospital_sources")
          .insert({
            hospital_id: hospitalId,
            source_name: hospital.source_name,
            source_type: hospital.source_type,
            source_title: hospital.name,
            source_url: hospital.source_url,
            evidence_note: hospital.evidence_note,
          });

        if (sourceError) throw sourceError;
      } catch (childError) {
        await supabase
          .from("hospitals")
          .delete()
          .eq("id", hospitalId);

        throw childError;
      }

      setImportedIds((previous) => [...previous, hospital.id]);

      setSuccess(
        `${hospital.name} imported successfully as pending review.`
      );
    } catch (err) {
      console.error("Hospital import error:", err);
      setError(err.message || "Unable to import hospital.");
    } finally {
      setLoadingId("");
    }
  };

  return (
    <div className="admin-hospital-import-page">
      <div className="admin-hospital-import-container">
        <Link
          to="/admin/hospitals"
          className="hospital-import-back"
        >
          ← Back to Hospitals
        </Link>

        <header className="hospital-import-header">
          <div>
            <p className="hospital-import-eyebrow">
              HOSPITAL CATALOGUE
            </p>

            <h1>Import Hospitals</h1>

            <p>
              Browse hospital candidates from government and
              institutional directories. Import individual records
              into your hospital catalogue for admin review.
            </p>
          </div>

          <div className="hospital-import-header-icon">
            <Building2 size={32} />
          </div>
        </header>

        <div className="hospital-import-info">
          <strong>Important verification notice</strong>
          <p>
            Imported hospitals and their primary locations are saved
            with pending status. Review the information and supporting
            source before publishing any hospital.
          </p>
        </div>

        {error && (
          <div className="hospital-import-error">
            {error}
          </div>
        )}

        {success && (
          <div className="hospital-import-success">
            {success}
          </div>
        )}

        <div className="hospital-import-toolbar">
          <div className="hospital-import-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search hospital, type or locality..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="hospital-import-refresh"
            onClick={() => {
              setSearch("");
              setError("");
              setSuccess("");
            }}
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>

        <div className="hospital-import-summary">
          <span>
            <strong>{hospitalImportCatalogue.length}</strong>
            Available candidates
          </span>

          <span>
            <strong>{importedIds.length}</strong>
            Imported in this session
          </span>
        </div>

        <div className="hospital-import-grid">
          {filteredHospitals.map((hospital) => {
            const isImported = importedIds.includes(hospital.id);
            const isLoading = loadingId === hospital.id;

            return (
              <article
                className="hospital-import-card"
                key={hospital.id}
              >
                <div className="hospital-import-card-top">
                  <div className="hospital-import-card-icon">
                    <Building2 size={23} />
                  </div>

                  <span className="hospital-import-type">
                    {hospital.hospital_type}
                  </span>
                </div>

                <h2>{hospital.name}</h2>

                <div className="hospital-import-location">
                  <MapPin size={15} />

                  <span>
                    {hospital.locality}, {hospital.city},{" "}
                    {hospital.state} - {hospital.pincode}
                  </span>
                </div>

                {hospital.phone && (
                  <p className="hospital-import-phone">
                    Phone: {hospital.phone}
                  </p>
                )}

                <div className="hospital-import-source">
                  <span>Source</span>

                  <p>{hospital.source_name}</p>

                  <a
                    href={hospital.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div className="hospital-import-card-footer">
                  {isImported ? (
                    <span className="hospital-import-imported">
                      <Download size={15} />
                      Imported · Pending Review
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="hospital-import-button"
                      disabled={Boolean(loadingId)}
                      onClick={() => handleImport(hospital)}
                    >
                      <Download size={16} />
                      {isLoading ? "Importing..." : "Import Hospital"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {filteredHospitals.length === 0 && (
          <div className="hospital-import-empty">
            <Building2 size={35} />

            <h3>No hospitals found</h3>

            <p>Try searching with another hospital name or locality.</p>
          </div>
        )}

        <div className="hospital-import-footer">
          <Link to="/admin/hospitals">
            Return to Hospital Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminHospitalImport;
