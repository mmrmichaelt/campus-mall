import Link from "next/link";

import { getCurrentUser } from "../../lib/auth";
import AccountForms from "../../components/AccountForms";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">CAMPUS MALL</p>

          <h1>
            {user
              ? "Your Campus Mall account"
              : "Join campus mall"}
          </h1>

          <p className="note">
            {user
              ? "Manage your account, verification and marketplace activity."
              : "Create an account as a student or outsider and select the campus you want to use."}
          </p>
        </div>
      </div>

      {user ? (
        <div className="profile-grid">
          <section className="panel">
            <div className="avatar-box">
              <div className="avatar-circle">
                {user.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h2>{user.name}</h2>

              <p className="note">
                {user.university}
              </p>

              <p className="note">
                {user.country} ·{" "}
                {user.accountType === "STUDENT"
                  ? "Student"
                  : "Outsider"}
              </p>
            </div>
          </section>

          <section className="panel">
            <p className="category">
              ACCOUNT VERIFICATION
            </p>

            <h2>Verification status</h2>

            <div
              style={{
                display: "grid",
                gap: "12px",
                margin: "18px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  alignItems: "center",
                }}
              >
                <span>Email</span>

                <strong
                  className={
                    user.emailVerified
                      ? "success"
                      : "note"
                  }
                >
                  {user.emailVerified
                    ? "✓ Verified"
                    : "Not verified"}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  alignItems: "center",
                }}
              >
                <span>Phone</span>

                <strong
                  className={
                    user.phoneVerified
                      ? "success"
                      : "note"
                  }
                >
                  {user.phoneVerified
                    ? "✓ Verified"
                    : "Not verified"}
                </strong>
              </div>
            </div>

            {!user.emailVerified ||
            !user.phoneVerified ? (
              <Link
                href="/verify"
                className="primary-btn"
              >
                Verify account
              </Link>
            ) : (
              <div className="success">
                Your account is fully verified. You
                can use Campus Mall chats and
                marketplace features.
              </div>
            )}
          </section>

          <section
            className="panel"
            style={{
              gridColumn: "1 / -1",
            }}
          >
            <p className="category">
              MARKETPLACE
            </p>

            <h2>Account actions</h2>

            <div className="hero-actions">
              <Link
                href="/sell"
                className="primary-btn"
              >
                Add listing
              </Link>

              <Link
                href="/chats"
                className="secondary-btn"
              >
                Chats
              </Link>

              <Link
                href="/settings"
                className="secondary-btn"
              >
                Settings
              </Link>

              <Link
                href="/profile"
                className="secondary-btn"
              >
                Edit profile
              </Link>
            </div>
          </section>
        </div>
      ) : (
        <div className="auth-card">
          <AccountForms />
        </div>
      )}

      <div
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <p className="note">
          Need help?
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
