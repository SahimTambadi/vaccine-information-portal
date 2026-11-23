
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function checkAdminRole(userId) {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Admin role verification failed:", error.message);
      setIsAdmin(false);
      return;
    }

    setIsAdmin(data?.role === "admin");
  }

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
        console.error("Admin role verification failed:", roleError.message);
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
      setMenuOpen(false);

      // Check the role after the authentication callback completes.
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

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setUser(null);
    setIsAdmin(false);
    setMenuOpen(false);
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="logo" onClick={closeMenu}>
        <span>✚</span> VaxCare
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" onClick={closeMenu}>
          Home
        </NavLink>

        <NavLink to="/vaccines" onClick={closeMenu}>
          Vaccines
        </NavLink>

        <NavLink to="/about" onClick={closeMenu}>
          About
        </NavLink>

        {user && isAdmin && (
          <NavLink to="/admin" onClick={closeMenu}>
            Admin Dashboard
          </NavLink>
        )}
      </div>

      <div className="nav-auth">
        {user ? (
          <div className="profile-menu">
            <button
              type="button"
              className="profile-icon-button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label="Open profile menu"
              aria-expanded={menuOpen}
            >
              👤
            </button>

            {menuOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-user">
                  <strong>
                    {user.user_metadata?.full_name || "VaxCare User"}
                  </strong>

                  <span>{user.email}</span>
                </div>

                <NavLink to="/profile" onClick={closeMenu}>
                  <span>👤</span> My Profile
                </NavLink>

                <NavLink to="/settings" onClick={closeMenu}>
                  <span>⚙️</span> Settings
                </NavLink>

                <button type="button" onClick={handleLogout}>
                  <span>↪</span> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login" className="nav-button">
              Login
            </NavLink>

            <NavLink to="/signup" className="nav-button">
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
