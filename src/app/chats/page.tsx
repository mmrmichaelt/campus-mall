import Link from "next/link";

import { getCurrentUser } from "../../lib/auth";
import ChatsClient from "../../components/ChatsClient";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-mark">CM</div>

          <p className="category">CAMPUS MALL</p>

          <h1>Sign in to view your chats</h1>

          <p className="note">
            Log in to your Campus Mall account to
            communicate with sellers and buyers.
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

  const fullyVerified =
    user.emailVerified &&
    user.phoneVerified;

  if (!fullyVerified) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-mark">CM</div>

          <p className="category">
            VERIFICATION REQUIRED
          </p>

          <h1>
            Verify your account to use chats
          </h1>

          <p className="note">
            Both your email address and phone number
            must be verified before you can send or
            receive marketplace messages.
          </p>

          <Link
            href="/verify"
            className="primary-btn"
          >
            Verify my account
          </Link>

          <Link
            href="/"
            className="text-link"
          >
            ← Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">CAMPUS MALL</p>

          <h1>Your chats</h1>

          <p className="note">
            Communicate directly with buyers and
            sellers about active listings.
          </p>
        </div>

        <Link
          href="/listings"
          className="secondary-btn"
        >
          Browse listings
        </Link>
      </div>

      <div className="panel">
        <ChatsClient />
      </div>
    </div>
  );
}
