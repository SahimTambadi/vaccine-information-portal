
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
} from "react-router-dom";

import "./App.css";

// ==========================================
// PUBLIC PAGES
// ==========================================

import Vaccines from "./pages/Vaccines";
import VaccineDetails from "./pages/VaccineDetails";

import Medicines from "./pages/Medicines";
import MedicineDetails from "./pages/MedicineDetails";

import Diseases from "./pages/Diseases";
import DiseaseDetails from "./pages/DiseaseDetails";

import Doctors from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";

import Treatments from "./pages/Treatments";
import TreatmentDetails from "./pages/TreatmentDetails";

import Hospitals from "./pages/Hospitals";
import HospitalDetails from "./pages/HospitalDetails";

import AdminWHOProducts from "./pages/AdminWHOProducts";
// ==========================================
// ADMIN MEDICINE PAGES
// ==========================================

import AdminMedicines from "./pages/AdminMedicines";
import AdminMedicineDetails from "./pages/AdminMedicineDetails";
import AdminMedicineEdit from "./pages/AdminMedicineEdit";
import AdminMedicineImport from "./pages/AdminMedicineImport";

// ==========================================
// ADMIN DISEASE PAGES
// ==========================================

import AdminDiseases from "./pages/AdminDiseases";
import AdminDiseaseDetails from "./pages/AdminDiseaseDetails";
import AdminDiseaseEdit from "./pages/AdminDiseaseEdit";
import AdminDiseaseImport from "./pages/AdminDiseaseImport";

// ==========================================
// ADMIN DOCTOR PAGES
// ==========================================

import AdminDoctors from "./pages/AdminDoctors";
import AdminDoctorEdit from "./pages/AdminDoctorEdit";
import AdminDoctorImport from "./pages/AdminDoctorImport";
import AdminDoctorDetails from "./pages/AdminDoctorDetails";

// ==========================================
// ADMIN TREATMENT PAGES
// ==========================================

import AdminTreatments from "./pages/AdminTreatments";
import AdminAddTreatment from "./pages/AdminAddTreatment";
import AdminTreatmentDetails from "./pages/AdminTreatmentDetails";
import AdminTreatmentImport from "./pages/AdminTreatmentImport";
// ==========================================
// ADMIN VACCINE PAGES
// ==========================================

import AdminVaccineImport from "./pages/AdminVaccineImport";
import AdminVaccines from "./pages/AdminVaccines";
import AdminVaccineDetails from "./pages/AdminVaccineDetails";
import AdminVaccineEdit from "./pages/AdminVaccineEdit";

// ==========================================
// ADMIN HOSPITAL PAGES
// ==========================================

import AdminHospitals from "./pages/AdminHospitals";
import AdminHospitalEdit from "./pages/AdminHospitalEdit";
import AdminHospitalDetails from "./pages/AdminHospitalDetails";
import AdminHospitalImport from "./pages/AdminHospitalImport";

// ==========================================
// SHARED COMPONENTS
// ==========================================

import MainLayout from "./components/MainLayout";
import GlobalSearch from "./components/GlobalSearch";

import About from "./pages/About";
import { supabase } from "./lib/supabaseClient";

// ==========================================
// AUTHENTICATION PAGES
// ==========================================

import Login from "./pages/login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// ==========================================
// ADMIN ROUTE PROTECTION
// ==========================================

function AdminRoute({ children }) {
  const [status, setStatus] = useState("checking");
  const [diagnostic, setDiagnostic] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      try {
        const {
          data: userData,
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Admin authentication error:", userError);

          if (active) {
            setDiagnostic(userError.message);
            setStatus("denied");
          }

          return;
        }

        if (!userData.user) {
          if (active) {
            setDiagnostic("No authenticated user found. Please log in.");
            setStatus("denied");
          }

          return;
        }

        const {
          data: roleData,
          error: roleError,
        } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .maybeSingle();

        if (!active) return;

        if (roleError) {
          console.error("Admin role query error:", roleError);

          setDiagnostic(
            `Unable to verify admin role: ${roleError.message}`
          );

          setStatus("denied");
          return;
        }

        if (!roleData) {
          setDiagnostic(
            "No user_roles record was found for your logged-in account."
          );

          setStatus("denied");
          return;
        }

        if (roleData.role !== "admin") {
          setDiagnostic(
            `Your database role is "${roleData.role}", not "admin".`
          );

          setStatus("denied");
          return;
        }

        setStatus("allowed");
      } catch (error) {
        console.error("Admin verification failed:", error);

        if (active) {
          setDiagnostic(
            error.message || "Unexpected verification error."
          );

          setStatus("denied");
        }
      }
    }

    verifyAdmin();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="app">
        <p>Verifying administrator access...</p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="app">
        <h2>Administrator Verification Failed</h2>
        <p>{diagnostic}</p>
        <p>Please share this message so we can fix the correct issue.</p>
      </div>
    );
  }

  return children;
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

function AdminDashboard() {
  const [totalVaccines, setTotalVaccines] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [totalDiseases, setTotalDiseases] = useState(0);

  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        if (active) {
          setError("Unable to load administrator information.");
          setLoading(false);
        }

        return;
      }

      if (active) {
        setAdminEmail(userData.user.email || "");
      }

      const [
        { count: vaccineCount, error: vaccineError },
        { count: medicineCount, error: medicineError },
        { count: diseaseCount, error: diseaseError },
      ] = await Promise.all([
        supabase
          .from("vaccines")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("medicines")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("diseases")
          .select("*", { count: "exact", head: true }),
      ]);

      if (!active) return;

      if (vaccineError || medicineError || diseaseError) {
        console.error("Dashboard statistics error:", {
          vaccineError,
          medicineError,
          diseaseError,
        });

        setError(
          "Some platform statistics could not be loaded. Check database permissions."
        );
      }

      setTotalVaccines(vaccineCount || 0);
      setTotalMedicines(medicineCount || 0);
      setTotalDiseases(diseaseCount || 0);

      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app admin-dashboard">

      {/* ADMIN HERO */}

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            VAXCARE ADMINISTRATION
          </p>

          <h1>
            Admin <span>Dashboard.</span>
          </h1>

          <p className="hero-description">
            Manage healthcare information and monitor
            your VaxCare platform.
          </p>

          <Link to="/vaccines" className="hero-button">
            View Website →
          </Link>
        </div>

        <div className="hero-visual">
          <div className="medical-circle">⚙️</div>
        </div>
      </section>

      {/* DASHBOARD OVERVIEW */}

      <section className="search-section">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h2>Platform Statistics</h2>
          <p>
            Quick overview of your VaxCare healthcare database.
          </p>
        </div>
      </section>

      {error && (
        <p className="auth-error">{error}</p>
      )}

      {/* STATISTICS CARDS */}

      <section className="vaccine-grid admin-stats">

        <div className="vaccine-card">
          <div className="vaccine-icon">💉</div>

          <span className="category">
            VACCINE DATABASE
          </span>

          <h3>
            {loading ? "Loading..." : totalVaccines}
          </h3>

          <p>
            Total vaccine records in your database.
          </p>
        </div>

        <div className="vaccine-card">
          <div className="vaccine-icon">💊</div>

          <span className="category">
            MEDICINE DATABASE
          </span>

          <h3>
            {loading ? "Loading..." : totalMedicines}
          </h3>

          <p>
            Total medicine records in your database.
          </p>
        </div>

        <div className="vaccine-card">
          <div className="vaccine-icon">🦠</div>

          <span className="category">
            DISEASE DATABASE
          </span>

          <h3>
            {loading ? "Loading..." : totalDiseases}
          </h3>

          <p>
            Total disease records in your database.
          </p>
        </div>

        <div className="vaccine-card">
          <div className="vaccine-icon">👤</div>

          <span className="category">
            ADMINISTRATOR
          </span>

          <h3>Active</h3>

          <p>
            {adminEmail || "Loading account..."}
          </p>
        </div>

      </section>

      {/* QUICK ACTIONS */}

      <section className="search-section">
        <div>
          <p className="eyebrow">QUICK ACTIONS</p>
          <h2>Manage Your Platform</h2>
          <p>
            Select a healthcare module to view and manage its records.
          </p>
        </div>
      </section>

      <section className="vaccine-grid">

        <Link
          to="/admin/vaccines"
          className="vaccine-card admin-module-card"
        >
          <div className="vaccine-icon">💉</div>
          <span className="category">VACCINE DATABASE</span>
          <h3>Vaccine Management</h3>
          <p>
            View vaccine records, add new vaccines, update information
            and manage your vaccine database.
          </p>
          <span className="details-button">View Details →</span>
        </Link>

        <Link
          to="/admin/medicines"
          className="vaccine-card admin-module-card"
        >
          <div className="vaccine-icon">💊</div>
          <span className="category">MEDICINE DATABASE</span>
          <h3>Medicine Management</h3>
          <p>
            View medicine records, add new medicines, update information
            and manage your medicine database.
          </p>
          <span className="details-button">View Details →</span>
        </Link>

        <Link
          to="/admin/diseases"
          className="vaccine-card admin-module-card"
        >
          <div className="vaccine-icon">🦠</div>
          <span className="category">DISEASE DATABASE</span>
          <h3>Disease Management</h3>
          <p>
            View disease records, add disease information, manage
            symptoms and specializations, and review medical references.
          </p>
          <span className="details-button">View Details →</span>
        </Link>

        <Link
          to="/admin/doctors"
          className="vaccine-card admin-module-card"
        >
          <div className="vaccine-icon">🩺</div>
          <span className="category">DOCTOR DIRECTORY</span>
          <h3>Doctor Management</h3>
          <p>
            Add and manage doctor profiles, professional qualifications,
            medical specializations, disease associations and verification.
          </p>
          <span className="details-button">View Details →</span>
        </Link>

        <Link
          to="/admin/treatments"
          className="vaccine-card admin-module-card"
        >
          <div className="vaccine-icon">🩺</div>
          <span className="category">TREATMENT DATABASE</span>
          <h3>Treatment Management</h3>
          <p>
            Add and manage disease treatments, link verified medicines,
            review medical references and publish verified treatment information.
          </p>
          <span className="details-button">View Details →</span>
        </Link>

        <Link
          to="/admin/hospitals"
          className="vaccine-card admin-module-card"
        >
          <div className="vaccine-icon">🏥</div>
          <span className="category">HOSPITAL DIRECTORY</span>
          <h3>Hospital Management</h3>
          <p>
            Add and import hospitals, manage branch locations,
            specializations, associated doctors and verification.
          </p>
          <span className="details-button">View Details →</span>
        </Link>

      </section>

    </main>
  );
}

// ==========================================
// HOME PAGE
// ==========================================

function HomePage() {
  return (
    <main className="app home-page">

      {/* HERO SECTION */}

      <section className="home-hero">
        <div className="home-hero-content">

          <span className="home-hero-badge">
            ✚ YOUR HEALTHCARE INFORMATION PLATFORM
          </span>

          <h1>
            Your Health.
            <br />
            Your Care.
            <br />
            <span>All in One Place.</span>
          </h1>

          <p>
            Discover healthcare information, explore vaccines
            and medicines, understand diseases and connect
            with healthcare services.
          </p>

          <div className="home-hero-actions">
            <Link
              to="/vaccines"
              className="home-primary-button"
            >
              Explore Vaccines →
            </Link>

            <Link
              to="/medicines"
              className="home-secondary-button"
            >
              Explore Medicines
            </Link>
          </div>

          <div className="home-trust-note">
            ✓ Healthcare awareness &nbsp; ✓ Accessible information
          </div>

        </div>

        <div className="home-hero-visual">
          <div className="home-medical-orbit">
            <div className="home-medical-icon">✚</div>
            <span className="orbit-icon orbit-one">💊</span>
            <span className="orbit-icon orbit-two">🩺</span>
            <span className="orbit-icon orbit-three">💉</span>
            <span className="orbit-icon orbit-four">🏥</span>
          </div>

          <div className="home-floating-info">
            <span>✓</span>
            Healthcare information in one place
          </div>
        </div>
      </section>

      {/* HEALTHCARE SEARCH */}

      <section className="home-search-section">
        <div className="home-search-heading">
          <span className="home-section-label">
            HEALTHCARE SEARCH
          </span>

          <h2>What are you looking for?</h2>

          <p>
            Search verified vaccine and medicine information
            available in the VaxCare directory.
          </p>
        </div>

        <GlobalSearch variant="home" />
      </section>

      {/* HEALTHCARE SERVICES */}

      <section
        className="home-services-section"
        id="healthcare-services"
      >
        <div className="home-section-heading">
          <div>
            <span className="home-section-label">
              EXPLORE HEALTHCARE
            </span>

            <h2>Healthcare Services</h2>

            <p>
              Explore different areas of healthcare through
              one platform.
            </p>
          </div>
        </div>

        <div className="home-services-grid">

          {/* VACCINES */}

          <Link
            to="/vaccines"
            className="home-service-card home-service-active"
          >
            <div className="home-service-icon">💉</div>

            <h3>Vaccines</h3>

            <p>
              Explore vaccine information, purposes and
              vaccination details.
            </p>

            <span className="home-service-button">
              Explore Vaccines →
            </span>
          </Link>

          {/* MEDICINES */}

          <Link
            to="/medicines"
            className="home-service-card home-service-active"
          >
            <div className="home-service-icon">💊</div>

            <h3>Medicines</h3>

            <p>
              Explore medicine information, active ingredients,
              uses and safety information.
            </p>

            <span className="home-service-button">
              Explore Medicines →
            </span>
          </Link>

          {/* DISEASES */}

          <Link
            to="/diseases"
            className="home-service-card home-service-active"
          >
            <div className="home-service-icon">🦠</div>

            <h3>Diseases</h3>

            <p>
              Explore disease information, symptoms, causes,
              prevention and related medical specialties.
            </p>

            <span className="home-service-button">
              Explore Diseases →
            </span>
          </Link>

          {/* TREATMENTS */}

          <Link
            to="/treatments"
            className="home-service-card home-service-active"
          >
            <div className="home-service-icon">💊</div>

            <h3>Treatments</h3>

            <p>
              Explore verified treatment information and related
              medicines for different health conditions.
            </p>

            <span className="home-service-button">
              Explore Treatments →
            </span>
          </Link>

          {/* DOCTORS */}

          <Link
            to="/doctors"
            className="home-service-card home-service-active"
          >
            <div className="home-service-icon">🩺</div>

            <h3>Doctors</h3>

            <p>
              Discover doctors and healthcare specialists.
            </p>

            <span className="home-service-button">
              Explore Doctors →
            </span>
          </Link>

          {/* HOSPITALS */}

          <Link
            to="/hospitals"
            className="home-service-card home-service-active"
          >
            <div className="home-service-icon">🏥</div>

            <h3>Hospitals</h3>

            <p>
              Find hospitals, explore their branches,
              facilities and associated doctors.
            </p>

            <span className="home-service-button">
              Explore Hospitals →
            </span>
          </Link>

        </div>
      </section>

      {/* MEDICINE PROMOTION */}

      <section className="home-awareness-section">
        <div>
          <span className="home-section-label">
            MEDICINE INFORMATION
          </span>

          <h2>Understand Medicines. Make Informed Decisions.</h2>

          <p>
            Explore published medicine information, including
            active ingredients, medical uses, precautions and
            available reference sources.
          </p>

          <Link
            to="/medicines"
            className="home-awareness-link"
          >
            Explore Medicines →
          </Link>
        </div>

        <div className="home-awareness-icon">💊</div>
      </section>

      {/* ABOUT VAXCARE */}

      <section className="home-awareness-section">
        <div>
          <span className="home-section-label">
            OUR PURPOSE
          </span>

          <h2>Better Healthcare Awareness Starts Here.</h2>

          <p>
            VaxCare aims to make healthcare information easier
            to discover and understand. Our goal is to bring
            essential health information and healthcare discovery
            services together in one accessible platform.
          </p>

          <Link
            to="/about"
            className="home-awareness-link"
          >
            Learn About VaxCare →
          </Link>
        </div>

        <div className="home-awareness-icon">♡</div>
      </section>

      {/* FOOTER */}

      <footer className="home-footer">
        <h3>✚ VaxCare</h3>

        <p>Your Health. Your Care. All in One Place.</p>

        <p>
          © 2026 VaxCare | Healthcare Information Platform
        </p>

        <p>
          Educational information only. Always consult a qualified
          healthcare professional for medical advice and treatment.
        </p>
      </footer>

    </main>
  );
}

// ==========================================
// MAIN APP ROUTES
// ==========================================

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        {/* PUBLIC ROUTES */}

        <Route path="/" element={<HomePage />} />

        <Route path="/vaccines" element={<Vaccines />} />

        <Route
          path="/vaccines/:id"
          element={<VaccineDetails />}
        />

        <Route path="/medicines" element={<Medicines />} />

        <Route
          path="/medicines/:id"
          element={<MedicineDetails />}
        />

        <Route path="/diseases" element={<Diseases />} />

        <Route
          path="/diseases/:id"
          element={<DiseaseDetails />}
        />

        {/* DOCTOR ROUTES */}

        <Route
          path="/doctors"
          element={<Doctors />}
        />

        <Route
          path="/doctors/:id"
          element={<DoctorDetails />}
        />

        {/* TREATMENT ROUTES */}

        <Route
          path="/treatments"
          element={<Treatments />}
        />

        <Route
          path="/treatments/:id"
          element={<TreatmentDetails />}
        />

        {/* HOSPITAL ROUTES */}

        <Route
          path="/hospitals"
          element={<Hospitals />}
        />

        <Route
          path="/hospitals/:slug"
          element={<HospitalDetails />}
        />

        <Route path="/about" element={<About />} />

        {/* AUTHENTICATION */}

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* ADMIN DASHBOARD */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* ADMIN VACCINE MANAGEMENT */}

        <Route
          path="/admin/vaccines"
          element={
            <AdminRoute>
              <AdminVaccines />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/vaccines/import"
          element={
            <AdminRoute>
              <AdminVaccineImport />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/vaccines/new"
          element={
            <AdminRoute>
              <AdminVaccineEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/vaccines/:id/edit"
          element={
            <AdminRoute>
              <AdminVaccineEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/vaccines/:id"
          element={
            <AdminRoute>
              <AdminVaccineDetails />
            </AdminRoute>
          }
        />

        {/* ADMIN MEDICINE MANAGEMENT */}

        <Route
          path="/admin/medicines"
          element={
            <AdminRoute>
              <AdminMedicines />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/medicines/import"
          element={
            <AdminRoute>
              <AdminMedicineImport />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/medicines/new"
          element={
            <AdminRoute>
              <AdminMedicineEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/medicines/:id/edit"
          element={
            <AdminRoute>
              <AdminMedicineEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/medicines/:id"
          element={
            <AdminRoute>
              <AdminMedicineDetails />
            </AdminRoute>
          }
        />

        {/* ADMIN DISEASE MANAGEMENT */}

        <Route
          path="/admin/diseases"
          element={
            <AdminRoute>
              <AdminDiseases />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/diseases/import"
          element={
            <AdminRoute>
              <AdminDiseaseImport />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/diseases/new"
          element={
            <AdminRoute>
              <AdminDiseaseEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/diseases/:id"
          element={
            <AdminRoute>
              <AdminDiseaseDetails />
            </AdminRoute>
          }
        />

        {/* ADMIN DOCTOR MANAGEMENT */}

        <Route
          path="/admin/doctors"
          element={
            <AdminRoute>
              <AdminDoctors />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/doctors/new"
          element={
            <AdminRoute>
              <AdminDoctorEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/doctors/import"
          element={
            <AdminRoute>
              <AdminDoctorImport />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/doctors/:id"
          element={
            <AdminRoute>
              <AdminDoctorDetails />
            </AdminRoute>
          }
        />

        {/* ADMIN TREATMENT MANAGEMENT */}

        <Route
          path="/admin/treatments"
          element={
            <AdminRoute>
              <AdminTreatments />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/treatments/new"
          element={
            <AdminRoute>
              <AdminAddTreatment />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/treatments/:id"
          element={
            <AdminRoute>
              <AdminTreatmentDetails />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/treatments/import"
          element={
            <AdminRoute>
              <AdminTreatmentImport />
            </AdminRoute>
          }
        />

        {/* ADMIN HOSPITAL MANAGEMENT */}

        <Route
          path="/admin/hospitals"
          element={
            <AdminRoute>
              <AdminHospitals />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/hospitals/new"
          element={
            <AdminRoute>
              <AdminHospitalEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/hospitals/import"
          element={
            <AdminRoute>
              <AdminHospitalImport />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/hospitals/:id"
          element={
            <AdminRoute>
              <AdminHospitalDetails />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/vaccines/who-products"
          element={
            <AdminRoute>
              <AdminWHOProducts />
            </AdminRoute>
          }
        />

      </Route>
    </Routes>
  );
}

export default App;
