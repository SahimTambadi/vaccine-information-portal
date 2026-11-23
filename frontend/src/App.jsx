
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import "./App.css";

import Vaccines from "./pages/Vaccines";
import VaccineDetails from "./pages/VaccineDetails";
import Medicines from "./pages/Medicines";
import MedicineDetails from "./pages/MedicineDetails";
import AdminMedicines from "./pages/AdminMedicines";
import AdminMedicineDetails from "./pages/AdminMedicineDetails";
import AdminMedicineEdit from "./pages/AdminMedicineEdit";
import AdminVaccineImport from "./pages/AdminVaccineImport";

import MainLayout from "./components/MainLayout";
import About from "./pages/About";
import { supabase } from "./lib/supabaseClient";

import Login from "./pages/login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import AdminVaccines from "./pages/AdminVaccines";
import AdminVaccineDetails from "./pages/AdminVaccineDetails";
import AdminVaccineEdit from "./pages/AdminVaccineEdit";

// ==========================================
// ADMIN ROUTE PROTECTION
// ==========================================

function AdminRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        if (active) setStatus("denied");
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

      if (roleError || roleData?.role !== "admin") {
        setStatus("denied");
        return;
      }

      setStatus("allowed");
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
    return <Navigate to="/vaccines" replace />;
  }

  return children || <AdminDashboard />;
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

function AdminDashboard() {
  const [totalVaccines, setTotalVaccines] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState(0);
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
      ] = await Promise.all([
        supabase
          .from("vaccines")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("medicines")
          .select("*", { count: "exact", head: true }),
      ]);

      if (!active) return;

      if (vaccineError || medicineError) {
        setError(
          "Some platform statistics could not be loaded. Check database permissions."
        );
      }

      setTotalVaccines(vaccineCount || 0);
      setTotalMedicines(medicineCount || 0);
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

    <span className="details-button">
      View Details →
    </span>
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

    <span className="details-button">
      View Details →
    </span>
  </Link>

</section>

    </main>
  );
}

// ==========================================
// HOME PAGE
// ==========================================

function HomePage() {
  const [vaccines, setVaccines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchVaccines() {
      const { data, error } = await supabase
        .from("vaccines")
        .select("*")
        .order("id", { ascending: true });

      if (!active) return;

      if (error) {
        console.error("Error fetching vaccines:", error.message);
        setError("Unable to load vaccines. Please try again later.");
        setLoading(false);
        return;
      }

      const formattedVaccines = (data || []).map((vaccine) => ({
        ...(vaccine.details || {}),
        id: vaccine.id,
        name: vaccine.name,
        fullName: vaccine.full_name,
        category: vaccine.category,
        purpose: vaccine.purpose,
        age: vaccine.age,
        icon: vaccine.icon,
      }));

      setVaccines(formattedVaccines);
      setLoading(false);
    }

    fetchVaccines();

    return () => {
      active = false;
    };
  }, []);

  const filteredVaccines = vaccines.filter((vaccine) => {
    const searchText = search.toLowerCase().trim();

    return [
      vaccine.name,
      vaccine.fullName,
      vaccine.category,
      vaccine.purpose,
      vaccine.age,
      ...(Array.isArray(vaccine.protection?.diseases)
        ? vaccine.protection.diseases
        : []),
    ]
      .filter(Boolean)
      .some((item) =>
        String(item).toLowerCase().includes(searchText)
      );
  });

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
            Explore vaccine and medicine information through
            the available VaxCare directories.
          </p>
        </div>

        <div className="home-search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search vaccines, diseases or age groups..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search vaccines"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* HEALTHCARE CATEGORIES */}

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

            <span className="home-service-link">
              Explore Vaccines →
            </span>
          </Link>

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

            <span className="home-service-link">
              Explore Medicines →
            </span>
          </Link>

          <div className="home-service-card">
            <div className="home-service-icon">🦠</div>

            <h3>Diseases</h3>

            <p>
              Understand diseases, symptoms and evidence-based
              treatment information.
            </p>

            <span className="home-coming-soon">
              Coming Soon
            </span>
          </div>

          <div className="home-service-card">
            <div className="home-service-icon">🩺</div>

            <h3>Doctors</h3>

            <p>
              Discover doctors and healthcare specialists.
            </p>

            <span className="home-coming-soon">
              Coming Soon
            </span>
          </div>

          <div className="home-service-card">
            <div className="home-service-icon">🏥</div>

            <h3>Hospitals</h3>

            <p>
              Find hospitals and explore healthcare services.
            </p>

            <span className="home-coming-soon">
              Coming Soon
            </span>
          </div>

        </div>
      </section>

      {/* VACCINE DIRECTORY */}

      <section
        className="home-vaccine-section"
        id="vaccines"
      >
        <div className="home-section-heading">
          <div>
            <span className="home-section-label">
              AVAILABLE DIRECTORY
            </span>

            <h2>Explore Vaccines</h2>

            <p>
              Discover information about vaccines and the
              diseases they help prevent.
            </p>
          </div>

          <Link
            to="/vaccines"
            className="home-view-all"
          >
            View All Vaccines →
          </Link>
        </div>

        {loading ? (
          <p className="home-message">
            Loading vaccines...
          </p>
        ) : error ? (
          <p className="home-message home-error">
            {error}
          </p>
        ) : (
          <>
            <p className="home-results-count">
              {search
                ? `${filteredVaccines.length} matching vaccines`
                : `${vaccines.length} vaccines available`}
            </p>

            {filteredVaccines.length > 0 ? (
              <div className="home-vaccine-grid">
                {filteredVaccines.slice(0, 8).map((vaccine) => (
                  <article
                    className="home-vaccine-card"
                    key={vaccine.id}
                  >
                    <div className="home-vaccine-icon">
                      {vaccine.icon || "💉"}
                    </div>

                    <span className="home-vaccine-category">
                      {vaccine.category}
                    </span>

                    <h3>{vaccine.name}</h3>

                    <p>{vaccine.purpose}</p>

                    <div className="home-vaccine-age">
                      Age group: {vaccine.age || "Not specified"}
                    </div>

                    <Link
                      to={`/vaccines/${vaccine.id}`}
                      className="home-vaccine-link"
                    >
                      View Details →
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="home-message">
                No matching vaccines found. Try another search.
              </p>
            )}

            {!search && vaccines.length > 8 && (
              <div className="home-vaccine-more">
                <Link
                  to="/vaccines"
                  className="home-primary-button"
                >
                  Discover All Vaccines →
                </Link>
              </div>
            )}
          </>
        )}
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

        <Route path="/vaccines/:id" element={<VaccineDetails />} />

        <Route path="/medicines" element={<Medicines />} />

        <Route
          path="/medicines/:id"
          element={<MedicineDetails />}
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
          path="/admin/vaccines/:id"
          element={
            <AdminRoute>
              <AdminVaccineDetails />
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
  path="/admin/medicines/:id"
  element={
    <AdminRoute>
      <AdminMedicineDetails />
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
  path="/admin/vaccines/new"
  element={
    <AdminRoute>
      <AdminVaccineEdit />
    </AdminRoute>
  }
/>


      </Route>
    </Routes>
  );
}

export default App;
