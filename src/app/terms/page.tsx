import Link from "next/link";

export const metadata = {
  title: "Terms of Use",
  description: "Campus Mall Terms of Use.",
};

export default function TermsPage() {
  return (
    <main className="page-shell">
      <section className="legal-page">
        <div className="legal-header">
          <p className="eyebrow">CAMPUS MALL</p>

          <h1>Terms of Use</h1>

          <p>
            These terms explain the basic rules for using
            Campus Mall.
          </p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Using Campus Mall</h2>

            <p>
              Campus Mall provides a marketplace where users
              can discover and advertise items, food, jobs and
              services.
            </p>

            <p>
              By creating an account or using the marketplace,
              you agree to use Campus Mall lawfully and
              responsibly.
            </p>
          </section>

          <section>
            <h2>2. Your account</h2>

            <p>
              You are responsible for keeping your account
              credentials secure and for providing accurate
              information.
            </p>

            <p>
              Email and phone verification may be required
              before certain account features, including
              messaging, become available.
            </p>
          </section>

          <section>
            <h2>3. Marketplace listings</h2>

            <p>
              You must only publish listings for legitimate
              items, food, jobs or services that you are
              permitted to offer.
            </p>

            <p>
              Listings must contain truthful information.
              Do not use Campus Mall to advertise illegal,
              fraudulent, stolen, dangerous or prohibited
              goods or services.
            </p>
          </section>

          <section>
            <h2>4. Transactions</h2>

            <p>
              Campus Mall is a marketplace platform. Unless
              explicitly stated otherwise, transactions,
              payments, delivery arrangements and agreements
              are made directly between the users involved.
            </p>

            <p>
              Users should independently verify the identity,
              condition, price and legitimacy of anything they
              intend to purchase or accept.
            </p>
          </section>

          <section>
            <h2>5. Messages and communication</h2>

            <p>
              Messaging must be used for legitimate
              marketplace communication. Do not use Campus
              Mall messages for harassment, threats, spam,
              impersonation, fraud or other unlawful activity.
            </p>
          </section>

          <section>
            <h2>6. Sold listings</h2>

            <p>
              When a seller marks a listing as sold, the
              listing is removed from the active public
              marketplace.
            </p>

            <p>
              Sellers should mark listings as sold promptly
              when they are no longer available.
            </p>
          </section>

          <section>
            <h2>7. Account restrictions</h2>

            <p>
              Campus Mall may restrict or suspend access to
              accounts or listings when necessary to protect
              users, maintain platform security or respond to
              violations of these terms.
            </p>
          </section>

          <section>
            <h2>8. Contact</h2>

            <p>
              For questions about these terms or problems with
              the platform, contact Campus Mall support at:
            </p>

            <p>
              <a href="mailto:campusmall.support@gmail.com">
                campusmall.support@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="legal-footer">
          <Link
            href="/"
            className="secondary-button"
          >
            Back to Campus Mall
          </Link>

          <Link
            href="/privacy"
            className="text-link"
          >
            Privacy Policy
          </Link>
        </div>
      </section>
    </main>
  );
}
