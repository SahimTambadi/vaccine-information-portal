
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  // Close all menus
  function closeMenus() {
    setMobileOpen(false);
    setExploreOpen(false);
    setProfileOpen(false);
  }

  // Check administrator role
  async function checkAdminRole(userId) {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Admin verification failed:", error.message);
      setIsAdmin(false);
      return;
    }

    setIsAdmin(data?.role === "admin");
  }

  // Authentication and session management
  useEffect(() => {
    let active = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error || !data.session?.user) {
        setUser(null);
        setIsAdmin(false);
        return;
      }

      const currentUser = data.session.user;
      setUser(currentUser);

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (!active) return;

      if (roleError) {
        console.error("Admin verification failed:", roleError.message);
        setIsAdmin(false);
      } else {
        setIsAdmin(roleData?.role === "admin");
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);
      setIsAdmin(false);
      closeMenus();

      if (currentUser) {
        Promise.resolve().then(() => {
          if (active) {
            checkAdminRole(currentUser.id);
          }
        });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Logout
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setUser(null);
    setIsAdmin(false);
    closeMenus();
    navigate("/");
  }

  // Active navigation style
  const navClass = ({ isActive }) =>
    `vc-nav-link${isActive ? " active" : ""}`;

  return (
    <header className="vc-header">
      <nav className="vc-navbar">

        {/* BRAND */}
        <NavLink
          to="/"
          className="vc-brand"
          onClick={closeMenus}
        >
          <span className="vc-brand-icon">
            +
          </span>

          <span className="vc-brand-copy">
            <strong>VaxCare</strong>
            <small>Healthcare, made accessible</small>
          </span>
        </NavLink>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="vc-mobile-toggle"
          onClick={() => setMobileOpen((previous) => !previous)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

        {/* NAVIGATION CONTENT */}
        <div className={`vc-navigation ${mobileOpen ? "open" : ""}`}>

          {/* MAIN NAVIGATION */}
          <div className="vc-nav-links">

            {/* HOME */}
            <NavLink
              to="/"
              end
              className={navClass}
              onClick={closeMenus}
            >
              Home
            </NavLink>

            {/* HEALTHCARE SERVICES */}
            <div className="vc-dropdown">

              <button
                type="button"
                className={`vc-nav-link vc-dropdown-trigger ${
                  exploreOpen ? "active" : ""
                }`}
                onClick={() => {
                  setExploreOpen((previous) => !previous);
                  setProfileOpen(false);
                }}
                aria-expanded={exploreOpen}
              >
                Healthcare Services
                <span>⌄</span>
              </button>

              {exploreOpen && (
                <div className="vc-dropdown-panel">

                  <div className="vc-dropdown-heading">
                    Explore Healthcare
                  </div>

                  <NavLink
                    to="/vaccines"
                    onClick={closeMenus}
                  >
                    <span>💉</span>
                    Vaccines
                  </NavLink>

                  <div className="vc-coming-soon">
                    <span>💊</span>
                    <span>Medicines</span>
                    <small>Coming Soon</small>
                  </div>

                  <div className="vc-coming-soon">
                    <span>🩺</span>
                    <span>Diseases</span>
                    <small>Coming Soon</small>
                  </div>

                  <div className="vc-coming-soon">
                    <span>❤️</span>
                    <span>Treatments</span>
                    <small>Coming Soon</small>
                  </div>

                  <div className="vc-coming-soon">
                    <span>👨‍⚕️</span>
                    <span>Find Doctors</span>
                    <small>Coming Soon</small>
                  </div>

                  <div className="vc-coming-soon">
                    <span>🏥</span>
                    <span>Hospitals</span>
                    <small>Coming Soon</small>
                  </div>

                </div>
              )}
            </div>

            {/* ABOUT - LAST MAIN NAVIGATION ITEM */}
            <NavLink
              to="/about"
              className={navClass}
              onClick={closeMenus}
            >
              About
            </NavLink>

            {/* ADMIN */}
            {user && isAdmin && (
              <NavLink
                to="/admin"
                className={navClass}
                onClick={closeMenus}
              >
                Admin
              </NavLink>
            )}

          </div>

          {/* ACCOUNT SECTION */}
          <div className="vc-account">

            {user ? (

              /* LOGGED-IN USER */
              <div className="vc-profile">

                <button
                  type="button"
                  className="vc-profile-trigger"
                  onClick={() => {
                    setProfileOpen((previous) => !previous);
                    setExploreOpen(false);
                  }}
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                >
                  <span className="vc-avatar">
                    {(user.user_metadata?.full_name || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <span className="vc-profile-label">
                    My Account
                  </span>

                  <span>⌄</span>
                </button>

                {profileOpen && (
                  <div className="vc-profile-panel">

                    <div className="vc-profile-info">
                      <strong>
                        {user.user_metadata?.full_name || "VaxCare User"}
                      </strong>

                      <span>{user.email}</span>
                    </div>

                    <NavLink
                      to="/profile"
                      onClick={closeMenus}
                    >
                      👤 My Profile
                    </NavLink>

                    <NavLink
                      to="/settings"
                      onClick={closeMenus}
                    >
                      ⚙ Account Settings
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                    >
                      ↪ Sign Out
                    </button>

                  </div>
                )}

              </div>

            ) : (

              /* LOGGED-OUT USER */
              <div className="vc-auth-actions">

                <NavLink
                  to="/login"
                  className="vc-login"
                  onClick={closeMenus}
                >
                  Login
                </NavLink>

                <NavLink
                  to="/signup"
                  className="vc-signup"
                  onClick={closeMenus}
                >
                  Get Started
                </NavLink>

              </div>

            )}

          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
