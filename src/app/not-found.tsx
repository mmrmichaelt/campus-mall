import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="protected-page">
        <div className="protected-card">
          <p className="eyebrow">CAMPUS MALL</p>

          <h1>Page not found</h1>

          <p>
            Sorry, we could not find the page or listing you
            were looking for. It may have been removed, sold,
            or the address may be incorrect.
          </p>

          <div className="protected-actions">
            <Link
              href="/"
              className="primary-button"
            >
              Go to home
            </Link>

            <Link
              href="/listings"
              className="secondary-button"
            >
              Browse listings
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
