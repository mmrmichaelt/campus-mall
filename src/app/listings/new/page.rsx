import { getCurrentUser } from "../../../lib/auth";
import NewListingForm from "../../../components/NewListingForm";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="page-shell">
        <section className="protected-page">
          <div className="protected-card">
            <p className="eyebrow">CAMPUS MALL</p>

            <h1>Sign in to add a listing</h1>

            <p>
              You need a Campus Mall account before you
              can sell items, offer food, advertise jobs,
              or provide services.
            </p>

            <a
              href="/account"
              className="primary-button"
            >
              Join or log in
            </a>
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
            <p className="eyebrow">VERIFICATION REQUIRED</p>

            <h1>Verify your account first</h1>

            <p>
              Please verify both your email address and
              phone number before creating a listing.
            </p>

            <a
              href="/verify"
              className="primary-button"
            >
              Verify my account
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="new-listing-page">
        <div className="new-listing-header">
          <p className="eyebrow">SELL ON CAMPUS MALL</p>

          <h1>Add a listing</h1>

          <p>
            Create a listing for an item, food, job or
            service. You can mark it sold later and it
            will immediately stop appearing in the
            marketplace.
          </p>
        </div>

        <NewListingForm
          sellerName={user.name}
          sellerCountry={user.country}
          sellerUniversity={user.university}
        />
      </section>
    </main>
  );
}
