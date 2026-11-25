
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  HeartPulse,
  Info,
  Users,
  ChevronDown,
  ShieldPlus,
  Syringe,
  Pill,
  Menu,
  User,
  Settings,
  LogOut,
  Stethoscope,
  Building2,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import GlobalSearch from "./GlobalSearch";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  // CLOSE ALL MENUS
  function closeMenus() {
    setMobileOpen(false);
    setExploreOpen(false);
    setProfileOpen(false);
  }

  // CHECK ADMIN ROLE
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

  // AUTHENTICATION AND SESSION MANAGEMENT
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

  // LOGOUT
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

  // ACTIVE NAVIGATION STYLE
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
            <ShieldPlus size={37} />
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
          {mobileOpen ? (
            <span>✕</span>
          ) : (
            <Menu size={25} />
          )}
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
              <Home size={22} />
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
                <HeartPulse size={22} />
                Healthcare Services

                <ChevronDown
                  size={15}
                  className={exploreOpen ? "rotated" : ""}
                />
              </button>

              {exploreOpen && (
                <div className="vc-dropdown-panel">

                  <div className="vc-dropdown-heading">
                    Explore Healthcare
                  </div>

                  {/* VACCINES */}

                  <NavLink
                    to="/vaccines"
                    className="vc-dropdown-item"
                    onClick={closeMenus}
                  >
                    <Syringe size={19} />
                    <span>Vaccines</span>
                  </NavLink>

                  {/* MEDICINES */}

                  <NavLink
                    to="/medicines"
                    className="vc-dropdown-item"
                    onClick={closeMenus}
                  >
                    <Pill size={19} />
                    <span>Medicines</span>
                  </NavLink>

                  {/* DISEASES */}

                  <NavLink
                    to="/diseases"
                    className="vc-dropdown-item"
                    onClick={closeMenus}
                  >
                    <HeartPulse size={19} />
                    <span>Diseases</span>
                  </NavLink>

                  {/* TREATMENTS */}

                  <NavLink
                    to="/treatments"
                    className="vc-dropdown-item"
                    onClick={closeMenus}
                  >
                    <ShieldPlus size={19} />
                    <span>Treatments</span>
                  </NavLink>


                  {/* FIND DOCTORS */}

                  <NavLink
                    to="/doctors"
                    className="vc-dropdown-item"
                    onClick={closeMenus}
                  >
                    <Stethoscope size={19} />
                    <span>Find Doctors</span>
                  </NavLink>

                  {/* HOSPITALS */}

                  <NavLink
                    to="/hospitals"
                    className="vc-dropdown-item"
                    onClick={closeMenus}
                  >
                    <Building2 size={19} />
                    <span>Hospitals</span>
                  </NavLink>

                </div>
              )}
            </div>

            {/* ABOUT */}

            <NavLink
              to="/about"
              className={navClass}
              onClick={closeMenus}
            >
              <Info size={22} />
              About
            </NavLink>

            {/* ADMIN */}

            {user && isAdmin && (
              <NavLink
                to="/admin"
                className={navClass}
                onClick={closeMenus}
              >
                <Users size={22} />
                Admin
              </NavLink>
            )}

          </div>

          {/* GLOBAL SEARCH */}

          <div className="vc-navbar-search">
            <GlobalSearch variant="navbar" />
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

                  <ChevronDown
                    size={16}
                    className={profileOpen ? "rotated" : ""}
                  />
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
                      <User size={18} />
                      My Profile
                    </NavLink>

                    <NavLink
                      to="/settings"
                      onClick={closeMenus}
                    >
                      <Settings size={18} />
                      Account Settings
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      Sign Out
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
