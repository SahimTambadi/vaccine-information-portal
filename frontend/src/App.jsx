
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
        if (active) {
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
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setError("Unable to load administrator information.");
        setLoading(false);
        return;
      }

      setAdminEmail(userData.user.email || "");

      const {
        count,
        error: vaccineError,
      } = await supabase
        .from("vaccines")
        .select("*", {
          count: "exact",
          head: true,
        });

      if (vaccineError) {
        setError("Unable to load vaccine statistics.");
      } else {
        setTotalVaccines(count || 0);
      }

      setLoading(false);
    }

    loadDashboard();
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
            Manage vaccine information and monitor
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
            Quick overview of your VaxCare platform.
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
            Total vaccines stored in your database.
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

        <div className="vaccine-card">
          <div className="vaccine-icon">🛡️</div>

          <span className="category">
            ACCESS CONTROL
          </span>

          <h3>Verified</h3>

          <p>
            Your administrator access is verified.
          </p>
        </div>

      </section>

      {/* QUICK ACTIONS */}

      <section className="search-section">
        <div>
          <p className="eyebrow">QUICK ACTIONS</p>
          <h2>Manage Your Platform</h2>
          <p>
            Access the main areas of VaxCare.
          </p>
        </div>
      </section>

      <section className="vaccine-grid">

        <div className="vaccine-card">
          <div className="vaccine-icon">💉</div>

          <h3>Vaccine Management</h3>

          <p>
            View and manage the existing vaccine information.
          </p>

          <Link
            to="/admin/vaccines"
            className="details-button"
          >
            Manage Vaccines →
          </Link>
        </div>

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
    async function fetchVaccines() {
      const { data, error } = await supabase
        .from("vaccines")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error(
          "Error fetching vaccines:",
          error.message
        );

        setError(
          "Unable to load vaccines. Please try again later."
        );

        setLoading(false);
        return;
      }

      const formattedVaccines = data.map((vaccine) => ({
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
  }, []);

  const filteredVaccines = vaccines.filter((vaccine) => {
    const searchText = search.toLowerCase();

    return [
      vaccine.name,
      vaccine.fullName,
      vaccine.category,
      vaccine.purpose,
      vaccine.age,
      ...(Array.isArray(
        vaccine.protection?.diseases
      )
        ? vaccine.protection.diseases
        : []),
    ]
      .filter(Boolean)
      .some((item) =>
        String(item)
          .toLowerCase()
          .includes(searchText)
      );
  });

  return (
    <div className="app">

      {/* HERO SECTION */}

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            YOUR HEALTH, OUR PRIORITY
          </p>

          <h1>
            Making Vaccine
            <br />
            Information <span>Accessible.</span>
          </h1>

          <p className="hero-description">
            Explore vaccine information, understand
            vaccination schedules and discover
            vaccination centres in your area.
          </p>

          <Link
            to="/vaccines"
            className="hero-button"
          >
            Explore Vaccines →
          </Link>
        </div>

        <div className="hero-visual">
          <div className="medical-circle">💉</div>

          <div className="floating-card">
            <span>✓</span> Stay informed. Stay protected.
          </div>
        </div>
      </section>

      {/* VACCINE SEARCH */}

      <section className="search-section" id="vaccines">
        <div>
          <p className="eyebrow">
            VACCINE DIRECTORY
          </p>

          <h2>Explore Vaccines</h2>

          <p>
            Find information about different vaccines.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by vaccine, disease or age group..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </section>

      {/* VACCINE CARDS */}

      <section className="vaccine-grid">

        {loading ? (
          <p>Loading vaccines...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredVaccines.length > 0 ? (
          filteredVaccines.map((vaccine) => (
            <div
              className="vaccine-card"
              key={vaccine.id}
            >
              <div className="vaccine-icon">
                {vaccine.icon}
              </div>

              <span className="category">
                {vaccine.category}
              </span>

              <h3>{vaccine.name}</h3>

              <p>{vaccine.purpose}</p>

              <div className="vaccine-age">
                Age group: {vaccine.age}
              </div>

              <Link
                to={`/vaccines/${vaccine.id}`}
                className="details-button"
              >
                View Details →
              </Link>
            </div>
          ))
        ) : (
          <p>No matching vaccines found.</p>
        )}

      </section>

      {/* ABOUT SECTION */}

      <section className="about-section" id="about">
        <h2>
          Reliable Information. Better Awareness.
        </h2>

        <p>
          Our portal helps people access general vaccine
          information and discover vaccination services.
        </p>
      </section>

      {/* FOOTER */}

      <footer>
        <p>
          © 2026 VaxCare | Vaccine Information Portal
        </p>

        <p>
          Educational information only. Consult a
          qualified healthcare professional for medical advice.
        </p>
      </footer>

    </div>
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

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/vaccines"
          element={<Vaccines />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/vaccines/:id"
          element={<VaccineDetails />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

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

        {/* ADMIN VACCINE DETAILS */}

        <Route
          path="/admin/vaccines/:id"
          element={
            <AdminRoute>
              <AdminVaccineDetails />
            </AdminRoute>
          }
        />

        {/* ADMIN VACCINE EDIT PAGE */}

        <Route
          path="/admin/vaccines/:id/edit"
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
