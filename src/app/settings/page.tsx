import Link from "next/link";

import { getCurrentUser } from "../../lib/auth";
import SettingsForm from "../../components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="page-shell">
        <section className="protected-page">
          <div className="protected-card">
            <p className="eyebrow">CAMPUS MALL</p>

            <h1>Sign in to access settings</h1>

            <p>
              Your Campus Mall settings are private to
              your account. Please log in to continue.
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
      <section className="settings-page">
        <div className="settings-header">
          <div>
            <p className="eyebrow">ACCOUNT</p>

            <h1>Settings</h1>

            <p>
              Control your Campus Mall notifications and
              profile visibility.
            </p>
          </div>

          <Link
            href="/account"
            className="secondary-button"
          >
            Back to account
          </Link>
        </div>

        <SettingsForm />

        <section className="settings-account-card">
          <div>
            <p className="eyebrow">ACCOUNT</p>

            <h2>{user.name}</h2>

            <p>{user.email}</p>

            <p>{user.phone}</p>
          </div>

          <div className="settings-verification">
            <span>
              Email{" "}
              {user.emailVerified
                ? "✓ Verified"
                : "Not verified"}
            </span>

            <span>
              Phone{" "}
              {user.phoneVerified
                ? "✓ Verified"
                : "Not verified"}
            </span>
          </div>
        </section>

        <div className="settings-links">
          <Link href="/profile">
            Edit profile
          </Link>

          <Link href="/verify">
            Verification
          </Link>

          <Link href="/chats">
            Chats
          </Link>
        </div>

        <div className="settings-support">
          <p>
            Need help with your account?
          </p>

          <a href="mailto:campusmallsupport@gmail.com">
            campusmallsupport@gmail.com
          </a>
        </div>
      </section>
    </main>
  );
}
