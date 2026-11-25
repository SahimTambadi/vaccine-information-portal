import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { supabase } from "../lib/supabaseClient";
import "./AuthRequiredModal.css";

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

    // Allow login, signup, popup and global search interactions.
    if (
      target.closest?.(
        'a[href="/login"], a[href="/signup"], .auth-required-modal, .global-search'
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
        <div
          className="auth-required-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowLoginPrompt(false);
            }
          }}
        >
          <div className="auth-required-modal">
            <button
              className="auth-modal-close"
              onClick={() => setShowLoginPrompt(false)}
              aria-label="Close popup"
            >
              ×
            </button>

            <div className="auth-modal-visual">
              <div className="auth-visual-circle">
                <span>✚</span>
              </div>

              <div className="auth-visual-shield">
                <span>✓</span>
              </div>
            </div>

            <div className="auth-modal-content">
              <span className="auth-modal-tag">
                WELCOME TO VAXCARE
              </span>

              <h2>
                Your Health Journey
                <span> Starts Here.</span>
              </h2>

              <p>
                Create your account or log in to explore
                VaxCare's healthcare information and
                personalized features.
              </p>

              <div className="auth-required-buttons">
                <Link
                  to="/login"
                  className="auth-login-button"
                >
                  Login
                  <span>→</span>
                </Link>

                <Link
                  to="/signup"
                  className="auth-signup-button"
                >
                  Create Account
                </Link>
              </div>

              <button
                className="auth-maybe-later"
                onClick={() => setShowLoginPrompt(false)}
              >
                Maybe Later
              </button>

              <div className="auth-modal-footer">
                <span>✚</span>
                Your health information, made accessible.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainLayout;