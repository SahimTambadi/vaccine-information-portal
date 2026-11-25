
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      navigate("/vaccines");
    } else {
      setSuccess(
        "Your account has been created. Please check your email to confirm your account before logging in."
      );
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-container">

        {/* LEFT BRANDING PANEL */}

        <section className="signup-brand-panel">
          <div className="signup-brand-content">

            <Link to="/" className="signup-logo">
              <span className="signup-logo-icon">✚</span>
              <span>VaxCare</span>
            </Link>

            <div className="signup-brand-message">

              <span className="signup-brand-tag">
                START YOUR HEALTH JOURNEY
              </span>

              <h1>
                Take control
                <br />
                of your health
                <br />
                <span>with VaxCare.</span>
              </h1>

              <p>
                Create your account and make it easier to
                access vaccine information, organize your
                health details and stay informed.
              </p>

              <div className="signup-feature-list">

                <div className="signup-feature">
                  <span>✓</span>
                  <p>Explore vaccine information</p>
                </div>

                <div className="signup-feature">
                  <span>✓</span>
                  <p>Keep your health details organized</p>
                </div>

                <div className="signup-feature">
                  <span>✓</span>
                  <p>Stay informed with important updates</p>
                </div>

              </div>
            </div>

            <div className="signup-brand-footer">
              <span>VaxCare Healthcare Portal</span>
              <span>© 2026 VaxCare</span>
            </div>

          </div>

          <div className="signup-decoration signup-decoration-one"></div>
          <div className="signup-decoration signup-decoration-two"></div>
          <div className="signup-decoration signup-decoration-three"></div>
        </section>

        {/* RIGHT SIGNUP PANEL */}

        <section className="signup-form-panel">

          <div className="signup-form-content">

            <div className="signup-mobile-logo">
              <span className="signup-logo-icon">✚</span>
              <span>VaxCare</span>
            </div>

            <div className="signup-heading">

              <span className="signup-eyebrow">
                JOIN VAXCARE
              </span>

              <h2>Create your account</h2>

              <p>
                Enter your details below to get started with VaxCare.
              </p>

            </div>

            {error && (
              <div className="signup-error">
                <span>!</span>
                {error}
              </div>
            )}

            {success && (
              <div className="signup-success">
                <span>✓</span>
                {success}
              </div>
            )}

            <form className="signup-form" onSubmit={handleSignup}>

              <div className="signup-input-group">

                <label htmlFor="signup-name">
                  Full Name
                </label>

                <div className="signup-input-wrapper">

                  <span className="signup-input-icon">♙</span>

                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    required
                  />

                </div>
              </div>

              <div className="signup-input-group">

                <label htmlFor="signup-email">
                  Email Address
                </label>

                <div className="signup-input-wrapper">

                  <span className="signup-input-icon">✉</span>

                  <input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />

                </div>
              </div>

              <div className="signup-input-group">

                <label htmlFor="signup-password">
                  Password
                </label>

                <div className="signup-input-wrapper">

                  <span className="signup-input-icon">♧</span>

                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>
              </div>

              <div className="signup-input-group">

                <label htmlFor="signup-confirm-password">
                  Confirm Password
                </label>

                <div className="signup-input-wrapper">

                  <span className="signup-input-icon">♧</span>

                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>

                </div>
              </div>

              <button
                type="submit"
                className="signup-submit-button"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <span>→</span>}
              </button>

            </form>

            <div className="signup-divider">
              <span>ALREADY REGISTERED?</span>
            </div>

            <p className="signup-login-text">
              Already have an account?
              <Link to="/login"> Sign In</Link>
            </p>

            <p className="signup-security-note">
              <span>♢</span>
              Your account is protected by secure authentication.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Signup;
