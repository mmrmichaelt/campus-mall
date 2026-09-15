import Link from "next/link";

import { getCurrentUser } from "../../lib/auth";
import SettingsForm from "../../components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-mark">CM</div>

          <p className="category">CAMPUS MALL</p>

          <h1>Sign in to access settings</h1>

          <p className="note">
            Your Campus Mall settings are private to your
            account. Please log in to continue.
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

          <h1>Settings</h1>

          <p className="note">
            Control your Campus Mall notifications and
            profile visibility.
          </p>
        </div>

        <Link
          href="/account"
          className="secondary-btn"
        >
          Back to account
        </Link>
      </div>

      <div className="panel">
        <p className="category">
          PREFERENCES
        </p>

        <h2>Account settings</h2>

        <p className="note">
          Choose which notifications you receive and
          control whether other Campus Mall users can
          view your public profile.
        </p>

        <SettingsForm />
      </div>

      <section
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <div className="section-title">
          <div>
            <p className="category">ACCOUNT</p>

            <h2>{user.name}</h2>

            <p className="note">
              {user.email}
            </p>

            <p className="note">
              {user.phone}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "10px",
            marginTop: "16px",
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
      </section>

      <section
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <p className="category">ACCOUNT LINKS</p>

        <h2>Manage your account</h2>

        <div className="hero-actions">
          <Link
            href="/profile"
            className="secondary-btn"
          >
            Edit profile
          </Link>

          <Link
            href="/verify"
            className="secondary-btn"
          >
            Verification
          </Link>

          <Link
            href="/chats"
            className="secondary-btn"
          >
            Chats
          </Link>
        </div>
      </section>

      <div
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <p className="note">
          Need help with your account?
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
