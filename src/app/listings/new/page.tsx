import Link from "next/link";

import { getCurrentUser } from "../../../lib/auth";
import NewListingForm from "../../../components/NewListingForm";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-mark">CM</div>

          <p className="category">CAMPUS MALL</p>

          <h1>Sign in to add a listing</h1>

          <p className="note">
            You need a Campus Mall account before you
            can sell items, offer food, advertise jobs,
            or provide services.
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

          <h1>Verify your account first</h1>

          <p className="note">
            Please verify both your email address and
            phone number before creating a listing.
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
          <p className="category">
            SELL ON CAMPUS MALL
          </p>

          <h1>Add a listing</h1>

          <p className="note">
            Create a listing for an item, food, job or
            service. You can mark it sold later and it
            will immediately stop appearing in the
            marketplace.
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
        <NewListingForm
          sellerName={user.name}
          sellerCountry={user.country}
        />
      </div>
    </div>
  );
}
