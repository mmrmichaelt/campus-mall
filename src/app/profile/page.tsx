import Link from "next/link";

import { getCurrentUser } from "../../lib/auth";
import ProfileForm from "../../components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="page-shell">
        <section className="protected-page">
          <div className="protected-card">
            <p className="eyebrow">CAMPUS MALL</p>

            <h1>Sign in to edit your profile</h1>

            <p>
              Log in to your Campus Mall account to
              manage your profile information.
            </p>

            <Link
              href="/account"
              className="primary-button"
            >
              Join or log in
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="profile-page">
        <div className="profile-header">
          <div>
            <p className="eyebrow">ACCOUNT</p>

            <h1>Your profile</h1>

            <p>
              Update the information other Campus Mall
              users see when they view your profile.
            </p>
          </div>

          <Link
            href="/account"
            className="secondary-button"
          >
            Back to account
          </Link>
        </div>

        <div className="profile-layout">
          <aside className="profile-summary-card">
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <h2>{user.name}</h2>

            <p>{user.university}</p>

            <p>{user.country}</p>

            <span className="profile-account-type">
              {user.accountType === "STUDENT"
                ? "Student"
                : "Outsider"}
            </span>

            <div className="profile-verification">
              <span>
                {user.emailVerified
                  ? "✓ Email verified"
                  : "Email not verified"}
              </span>

              <span>
                {user.phoneVerified
                  ? "✓ Phone verified"
                  : "Phone not verified"}
              </span>
            </div>

            <Link
              href={`/profile/${user.id}`}
              className="secondary-button"
            >
              View public profile
            </Link>
          </aside>

          <ProfileForm
            initialName={user.name}
            initialUniversity={user.university}
          />
        </div>

        <section className="profile-private-info">
          <p className="eyebrow">
            PRIVATE ACCOUNT INFORMATION
          </p>

          <h2>Contact information</h2>

          <p>
            Your email address and phone number are
            protected and cannot be changed from this
            profile editor.
          </p>

          <div className="private-contact-grid">
            <div>
              <strong>Email</strong>
              <span>{user.email}</span>
            </div>

            <div>
              <strong>Phone</strong>
              <span>{user.phone}</span>
            </div>
          </div>

          <Link
            href="/verify"
            className="text-link"
          >
            Manage verification
          </Link>
        </section>

        <div className="profile-support">
          <p>
            Need help updating your account?
          </p>

          <a href="mailto:campusmallsupport@gmail.com">
            campusmallsupport@gmail.com
          </a>
        </div>
      </section>
    </main>
  );
}
