import Link from "next/link";

import { getCurrentUser } from "../../lib/auth";
import ChatsClient from "../../components/ChatsClient";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="page-shell">
        <section className="protected-page">
          <div className="protected-card">
            <p className="eyebrow">CAMPUS MALL</p>

            <h1>Sign in to view your chats</h1>

            <p>
              Log in to your Campus Mall account to
              communicate with sellers and buyers.
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

  const fullyVerified =
    user.emailVerified &&
    user.phoneVerified;

  if (!fullyVerified) {
    return (
      <main className="page-shell">
        <section className="protected-page">
          <div className="protected-card">
            <p className="eyebrow">
              VERIFICATION REQUIRED
            </p>

            <h1>Verify your account to use chats</h1>

            <p>
              Both your email address and phone number
              must be verified before you can send or
              receive marketplace messages.
            </p>

            <Link
              href="/verify"
              className="primary-button"
            >
              Verify my account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="chats-page">
        <div className="chats-header">
          <div>
            <p className="eyebrow">CAMPUS MALL</p>

            <h1>Your chats</h1>

            <p>
              Communicate directly with buyers and
              sellers about active listings.
            </p>
          </div>

          <Link
            href="/listings"
            className="secondary-button"
          >
            Browse listings
          </Link>
        </div>

        <ChatsClient />
      </section>
    </main>
  );
}
