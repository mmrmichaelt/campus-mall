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
            href="/join?next=/chats&action=chat"
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
