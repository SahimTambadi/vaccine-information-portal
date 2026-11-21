
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const defaultPreferences = {
  vaccine_reminders: true,
  appointment_reminders: true,
  important_updates: true,
  email_notifications: true,
};

function Settings() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("security");

  const [preferences, setPreferences] = useState(defaultPreferences);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [preferencesError, setPreferencesError] = useState("");

  const [userId, setUserId] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setPreferencesError("Please log in to manage your preferences.");
        setPreferencesLoading(false);
        return;
      }

      const user = userData.user;

      setUserId(user.id);

      setAccountInfo({
        email: user.email || "Not available",
        createdAt: user.created_at,
        emailVerified: Boolean(user.email_confirmed_at),
        lastSignIn: user.last_sign_in_at,
      });

      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setPreferencesError(error.message);
      } else if (data) {
        setPreferences({
          vaccine_reminders: data.vaccine_reminders,
          appointment_reminders: data.appointment_reminders,
          important_updates: data.important_updates,
          email_notifications: data.email_notifications,
        });
      }

      setPreferencesLoading(false);
    }

    loadPreferences();
  }, []);

  async function handlePasswordChange(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Your password has been updated successfully.");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  async function handlePreferenceChange(field) {
    if (!userId || preferencesSaving) return;

    setPreferencesMessage("");
    setPreferencesError("");

    const updatedPreferences = {
      ...preferences,
      [field]: !preferences[field],
    };

    setPreferencesSaving(true);

    const { error } = await supabase
      .from("user_notification_preferences")
      .upsert(
        {
          user_id: userId,
          ...updatedPreferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    setPreferencesSaving(false);

    if (error) {
      setPreferencesError(error.message);
      return;
    }

    setPreferences(updatedPreferences);
    setPreferencesMessage("Your preferences have been saved.");
  }

  return (
    <main className="settings-page">
      <div className="settings-layout">

        {/* SIDEBAR */}
        <aside className="settings-sidebar">
          <div className="settings-sidebar-heading">
            <span>ACCOUNT</span>
            <h2>Settings</h2>
          </div>

          <nav className="settings-navigation">
            <Link to="/profile" className="settings-nav-item">
              <span>👤</span>
              Personal Information
            </Link>

            <a
              href="#security"
              onClick={() => setActiveSection("security")}
              className={`settings-nav-item ${
                activeSection === "security" ? "active" : ""
              }`}
            >
              <span>🔐</span>
              Security
            </a>

            <a
              href="#notifications"
              onClick={() => setActiveSection("notifications")}
              className={`settings-nav-item ${
                activeSection === "notifications" ? "active" : ""
              }`}
            >
              <span>🔔</span>
              Notifications
            </a>

            <a
              href="#privacy"
              onClick={() => setActiveSection("privacy")}
              className={`settings-nav-item ${
                activeSection === "privacy" ? "active" : ""
              }`}
            >
              <span>🛡️</span>
              Privacy
            </a>
          </nav>

          <div className="settings-sidebar-footer">
            <span>VaxCare</span>
            <p>Your health information, organized.</p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="settings-main">

          <header className="settings-header">
            <div>
              <p className="settings-eyebrow">ACCOUNT MANAGEMENT</p>
              <h1>Account Settings</h1>
              <p>
                Manage your account, security and preferences.
              </p>
            </div>

            <Link to="/profile" className="settings-profile-link">
              View Profile →
            </Link>
          </header>

          {/* SECURITY SECTION */}
          <section className="settings-section" id="security">
            <div className="settings-section-heading">
              <div className="settings-section-icon">🔐</div>

              <div>
                <h2>Security & Password</h2>
                <p>
                  Keep your VaxCare account secure by updating
                  your password.
                </p>
              </div>
            </div>

            <div className="settings-card">
              <h3>Change Password</h3>

              <p className="settings-card-description">
                Choose a strong password that you do not use
                on other websites.
              </p>

              <form
                className="settings-form"
                onSubmit={handlePasswordChange}
              >
                {/* NEW PASSWORD */}
                <div className="settings-form-group">
                  <label htmlFor="new-password">
                    New Password
                  </label>

                  <div className="password-input-wrapper">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your new password"
                      required
                      minLength={6}
                    />

                    <button
                      type="button"
                      className="password-visibility-button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="settings-form-group">
                  <label htmlFor="confirm-password">
                    Confirm New Password
                  </label>

                  <div className="password-input-wrapper">
                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Re-enter your new password"
                      required
                      minLength={6}
                    />

                    <button
                      type="button"
                      className="password-visibility-button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="settings-error">{error}</p>
                )}

                {message && (
                  <p className="settings-success">{message}</p>
                )}

                <div className="settings-form-actions">
                  <button type="submit" disabled={loading}>
                    {loading
                      ? "Updating Password..."
                      : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* NOTIFICATIONS SECTION */}
          <section
            className="settings-section"
            id="notifications"
          >
            <div className="settings-section-heading">
              <div className="settings-section-icon">🔔</div>

              <div>
                <h2>Notification Preferences</h2>
                <p>
                  Choose which updates you would like to receive.
                </p>
              </div>
            </div>

            <div className="settings-card">
              {preferencesLoading ? (
                <p>Loading your notification preferences...</p>
              ) : (
                <>
                  {[
                    {
                      key: "vaccine_reminders",
                      title: "Vaccine Reminders",
                      description:
                        "Preferences for upcoming vaccination reminders.",
                    },
                    {
                      key: "appointment_reminders",
                      title: "Appointment Reminders",
                      description:
                        "Preferences for vaccination appointment reminders.",
                    },
                    {
                      key: "important_updates",
                      title: "Important VaxCare Updates",
                      description:
                        "Preferences for important platform announcements.",
                    },
                    {
                      key: "email_notifications",
                      title: "Email Notifications",
                      description:
                        "Allow notifications to be sent through email.",
                    },
                  ].map((item) => (
                    <div
                      className="notification-option"
                      key={item.key}
                    >
                      <div className="notification-option-text">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={preferences[item.key]}
                        aria-label={item.title}
                        className={`notification-toggle ${
                          preferences[item.key] ? "enabled" : ""
                        }`}
                        disabled={preferencesSaving}
                        onClick={() =>
                          handlePreferenceChange(item.key)
                        }
                      >
                        <span />
                      </button>
                    </div>
                  ))}

                  {preferencesSaving && (
                    <p className="settings-card-description">
                      Saving your preferences...
                    </p>
                  )}

                  {preferencesError && (
                    <p className="settings-error">
                      {preferencesError}
                    </p>
                  )}

                  {preferencesMessage && (
                    <p className="settings-success">{preferencesMessage}</p>
                  )}
                </>
              )}
            </div>
          </section>

          {/* PRIVACY AND ACCOUNT SECTION */}
          <section className="settings-section" id="privacy">
            <div className="settings-section-heading">
              <div className="settings-section-icon">🛡️</div>

              <div>
                <h2>Privacy & Account</h2>
                <p>
                  Information about the protection of your account.
                </p>
              </div>
            </div>

            <div className="settings-card">
              <h3>Your Account Information</h3>

              <p className="settings-card-description">
                Review the basic information associated with
                your VaxCare account.
              </p>

              {accountInfo ? (
                <div className="account-info-list">

                  <div className="account-info-item">
                    <span>Email Address</span>
                    <strong>{accountInfo.email}</strong>
                  </div>

                  <div className="account-info-item">
                    <span>Account Created</span>
                    <strong>
                      {accountInfo.createdAt
                        ? new Date(
                            accountInfo.createdAt
                          ).toLocaleDateString()
                        : "Not available"}
                    </strong>
                  </div>

                  <div className="account-info-item">
                    <span>Authentication Status</span>

                    <strong className="account-status">
                      <span className="account-status-dot"></span>
                      Authenticated
                    </strong>
                  </div>

                  <div className="account-info-item">
                    <span>Email Verification</span>

                    <strong className="account-status">
                      <span
                        className="account-status-dot"
                        style={{
                          background: accountInfo.emailVerified
                            ? "#22b879"
                            : "#e69b32",
                        }}
                      ></span>

                      {accountInfo.emailVerified
                        ? "Verified"
                        : "Not Verified"}
                    </strong>
                  </div>

                  <div className="account-info-item">
                    <span>Last Sign-in</span>

                    <strong>
                      {accountInfo.lastSignIn
                        ? new Date(
                            accountInfo.lastSignIn
                          ).toLocaleString()
                        : "Not available"}
                    </strong>
                  </div>

                </div>
              ) : (
                <p>Loading account information...</p>
              )}

              <p className="settings-card-description">
                VaxCare uses Supabase authentication and database
                security policies to help protect your account
                information.
              </p>
            </div>
          </section>

        </section>
      </div>
    </main>
  );
}

export default Settings;
