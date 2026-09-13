import { getCurrentUser } from "../../lib/auth";
import AccountForms from "../../components/AccountForms";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <main className="page-shell">
      <section className="account-page">
        <div className="account-header">
          <p className="eyebrow">CAMPUS MALL</p>

          <h1>
            {user ? "Your Campus Mall account" : "Join campus mall"}
          </h1>

          <p>
            {user
              ? "Manage your account, verification and marketplace activity."
              : "Create an account as a student or outsider and select the campus you want to use."}
          </p>
        </div>

        {user ? (
          <div className="account-dashboard">
            <div className="account-card">
              <div className="account-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="account-details">
                <h2>{user.name}</h2>

                <p>{user.university}</p>

                <p>
                  {user.country} ·{" "}
                  {user.accountType === "STUDENT"
                    ? "Student"
                    : "Outsider"}
                </p>
              </div>
            </div>

            <div className="verification-card">
              <h2>Account verification</h2>

              <div className="verification-row">
                <span>Email</span>

                <strong
                  className={
                    user.emailVerified
                      ? "verification-success"
                      : "verification-pending"
                  }
                >
                  {user.emailVerified
                    ? "Verified"
                    : "Not verified"}
                </strong>
              </div>

              <div className="verification-row">
                <span>Phone</span>

                <strong
                  className={
                    user.phoneVerified
                      ? "verification-success"
                      : "verification-pending"
                  }
                >
                  {user.phoneVerified
                    ? "Verified"
                    : "Not verified"}
                </strong>
              </div>

              {!user.emailVerified || !user.phoneVerified ? (
                <a
                  href="/verify"
                  className="primary-button"
                >
                  Verify account
                </a>
              ) : (
                <p className="verified-message">
                  Your account is fully verified. You can use Campus
                  Mall chats and marketplace features.
                </p>
              )}
            </div>

            <div className="account-actions">
              <a
                href="/listings/new"
                className="primary-button"
              >
                Add listing
              </a>

              <a
                href="/chats"
                className="secondary-button"
              >
                Chats
              </a>

              <a
                href="/settings"
                className="secondary-button"
              >
                Settings
              </a>

              <a
                href="/profile"
                className="secondary-button"
              >
                Edit profile
              </a>
            </div>
          </div>
        ) : (
          <div className="account-form-card">
            <AccountForms />
          </div>
        )}

        <div className="account-support">
          <p>
            Need help?{" "}
            <a href="mailto:campusmallsupport@gmail.com">
              campusmallsupport@gmail.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
