
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setError("Unable to load your profile. Please log in again.");
        setLoading(false);
        return;
      }

      setUser(data.user);
      setFullName(data.user.user_metadata?.full_name || "");
      setLoading(false);
    }

    loadProfile();
  }, []);

  async function handleUpdate(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
      },
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setUser(data.user);
    setMessage("Your profile has been updated successfully.");
  }

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="profile-loading">
        Please <Link to="/login">log in</Link> to view your profile.
      </div>
    );
  }

  const initials = (fullName || user.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const createdDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <main className="profile-page">
      <div className="profile-container">

        <div className="profile-heading">
          <p className="eyebrow">MY ACCOUNT</p>
          <h1>My Profile</h1>
          <p>View and manage your VaxCare account information.</p>
        </div>

        <section className="profile-card">
          <div className="profile-banner">
            <div className="profile-avatar">{initials}</div>

            <div className="profile-user-heading">
              <h2>{fullName || "VaxCare User"}</h2>
              <p>{user.email}</p>
            </div>

            <span className="profile-status">Active Account</span>
          </div>

          <div className="profile-content">

            <div className="profile-section-heading">
              <h3>Personal Information</h3>
              <p>Update the personal details associated with your account.</p>
            </div>

            {message && (
              <div className="profile-success">{message}</div>
            )}

            {error && (
              <div className="profile-error">{error}</div>
            )}

            <form onSubmit={handleUpdate} className="profile-form">

              <div className="profile-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                />
                <small>Your registered email address.</small>
              </div>

              <div className="profile-field">
                <label>Account Created</label>
                <input
                  type="text"
                  value={createdDate}
                  readOnly
                />
              </div>

              <div className="profile-field">
                <label>Account Status</label>
                <input
                  type="text"
                  value="Active"
                  readOnly
                />
              </div>

              <button type="submit" disabled={saving}>
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>

            </form>
          </div>
        </section>

        <div className="profile-back">
          <Link to="/">← Back to Home</Link>
        </div>

      </div>
    </main>
  );
}

export default Profile;
