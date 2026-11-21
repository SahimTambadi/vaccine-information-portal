
import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { supabase } from "../lib/supabaseClient";

function MainLayout() {
  const [user, setUser] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setUser(data.session?.user ?? null);
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setShowLoginPrompt(false);
  }, [location.pathname]);

  function handleProtectedClick(event) {
    if (user || isAuthPage) {
      return;
    }

    const target = event.target;

    // Allow Login and Sign Up navigation.
    if (
      target.closest?.(
        'a[href="/login"], a[href="/signup"], .auth-required-modal'
      )
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setShowLoginPrompt(true);
  }

  return (
    <div onClickCapture={handleProtectedClick}>
      <Navbar />
      <Outlet />

      {showLoginPrompt && (
        <div className="auth-required-overlay">
          <div className="auth-required-modal">
            <div className="auth-required-icon">🔒</div>

            <h2>Login Required</h2>

            <p>
              Please log in or create an account to interact
              with VaxCare and access its features.
            </p>

            <div className="auth-required-buttons">
              <Link to="/login" className="nav-button">
                Login
              </Link>

              <Link to="/signup" className="auth-signup-button">
                Sign Up
              </Link>
            </div>

            <button
              className="auth-close-button"
              onClick={() => setShowLoginPrompt(false)}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainLayout;
