import Link from "next/link";

import { getCurrentUser } from "../../lib/auth";
import ProfileForm from "../../components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-mark">CM</div>

          <p className="category">CAMPUS MALL</p>

          <h1>Sign in to edit your profile</h1>

          <p className="note">
            Log in to your Campus Mall account to manage
            your profile information.
          </p>

          <Link
            href="/account"
            className="primary-btn"
          >
            Join or log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">ACCOUNT</p>

          <h1>Your profile</h1>

          <p className="note">
            Update the information other Campus Mall
            users see when they view your profile.
          </p>
        </div>

        <Link
          href="/account"
          className="secondary-btn"
        >
          Back to account
        </Link>
      </div>

      <div className="profile-grid">
        <aside className="panel">
          <div className="avatar-box">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name}
                style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <h2>{user.name}</h2>

            <p className="note">
              {user.university}
            </p>

            <p className="note">
              {user.country}
            </p>

            <span className="category">
              {user.accountType === "STUDENT"
                ? "Student"
                : "Outsider"}
            </span>
          </div>

          <div
            className="profile-verification"
            style={{
              display: "grid",
              gap: "8px",
              marginTop: "18px",
            }}
          >
            <div
              className={
                user.emailVerified
                  ? "success"
                  : "note"
              }
            >
              {user.emailVerified
                ? "✓ Email verified"
                : "Email not verified"}
            </div>

            <div
              className={
                user.phoneVerified
                  ? "success"
                  : "note"
              }
            >
              {user.phoneVerified
                ? "✓ Phone verified"
                : "Phone not verified"}
            </div>
          </div>

          <Link
            href={`/profile/${user.id}`}
            className="secondary-btn"
            style={{
              marginTop: "16px",
              display: "inline-flex",
            }}
          >
            View public profile
          </Link>
        </aside>

        <div className="panel">
          <h2>Edit profile</h2>

          <p className="note">
            Keep your name and university information
            up to date.
          </p>

          <ProfileForm
            initialName={user.name}
            initialUniversity={user.university}
            initialImageUrl={user.imageUrl}
          />
        </div>
      </div>

      <section
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <p className="category">
          PRIVATE ACCOUNT INFORMATION
        </p>

        <h2>Contact information</h2>

        <p className="note">
          Your email address and phone number are
          protected and cannot be changed from this
          profile editor.
        </p>

        <div className="two-col">
          <div>
            <strong>Email</strong>
            <p className="note">{user.email}</p>
          </div>

          <div>
            <strong>Phone</strong>
            <p className="note">{user.phone}</p>
          </div>
        </div>

        <Link
          href="/verify"
          className="text-link"
        >
          Manage verification
        </Link>
      </section>

      <div
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <p className="note">
          Need help updating your account?
        </p>

        <a
          href="mailto:campusmall.support@gmail.com"
          className="text-link"
        >
          campusmall.support@gmail.com
        </a>
      </div>
    </div>
  );
}
