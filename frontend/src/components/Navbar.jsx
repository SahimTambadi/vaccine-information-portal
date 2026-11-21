
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setMenuOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

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
        <NavLink to="/" onClick={closeMenu}>Home</NavLink>
        <NavLink to="/vaccines" onClick={closeMenu}>Vaccines</NavLink>
        <NavLink to="/about" onClick={closeMenu}>About</NavLink>
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

                <button
                  type="button"
                  onClick={handleLogout}
                >
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
