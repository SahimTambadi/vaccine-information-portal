
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (roleError) {
      await supabase.auth.signOut();
      setError("Unable to verify your account role. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);

    if (roleData?.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/vaccines", { replace: true });
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">

        {/* LEFT BRANDING PANEL */}
        <section className="auth-brand-panel">
          <div className="auth-brand-content">

            <Link to="/" className="auth-logo">
              <span className="auth-logo-icon">✚</span>
              <span>VaxCare</span>
            </Link>

            <div className="auth-brand-message">
              <span className="auth-brand-tag">
                YOUR HEALTH, OUR PRIORITY
              </span>

              <h1>
                Better health
                <br />
                starts with
                <br />
                <span>protection.</span>
              </h1>

              <p>
                Stay informed, manage your vaccination journey
                and keep your health information organized
                with VaxCare.
              </p>

              <div className="auth-feature-list">
                <div className="auth-feature">
                  <span>✓</span>
                  <p>Access trusted vaccine information</p>
                </div>

                <div className="auth-feature">
                  <span>✓</span>
                  <p>Manage your health information</p>
                </div>

                <div className="auth-feature">
                  <span>✓</span>
                  <p>Stay updated with important reminders</p>
                </div>
              </div>
            </div>

            <div className="auth-brand-footer">
              <span>VaxCare Healthcare Portal</span>
              <span>© 2026 VaxCare</span>
            </div>
          </div>

          <div className="auth-decoration auth-decoration-one"></div>
          <div className="auth-decoration auth-decoration-two"></div>
          <div className="auth-decoration auth-decoration-three"></div>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="auth-form-panel">
          <div className="auth-form-content">

            <div className="auth-mobile-logo">
              <span className="auth-logo-icon">✚</span>
              <span>VaxCare</span>
            </div>

            <div className="auth-heading">
              <span className="auth-eyebrow">WELCOME BACK</span>

              <h2>Sign in to your account</h2>

              <p>
                Enter your details below to access your VaxCare account.
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span>!</span>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleLogin}>

              <div className="auth-input-group">
                <label htmlFor="login-email">Email Address</label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">✉</span>

                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="login-password">Password</label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">♧</span>

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <span>→</span>}
              </button>

            </form>

            <div className="auth-divider">
              <span>NEW TO VAXCARE?</span>
            </div>

            <p className="auth-signup-text">
              Don't have an account?
              <Link to="/signup"> Create an account</Link>
            </p>

            <p className="auth-security-note">
              <span>♢</span>
              Your account is protected by secure authentication.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
