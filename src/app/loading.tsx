export default function Loading() {
  return (
    <main className="page-shell">
      <section className="loading-page" aria-live="polite" aria-busy="true">
        <div className="loading-card">
          <div className="loading-logo" aria-hidden="true">
            CM
          </div>

          <div className="loading-spinner" aria-hidden="true" />

          <h1>Loading Campus Mall</h1>

          <p>
            Please wait while we prepare your Campus Mall experience.
          </p>
        </div>
      </section>
    </main>
  );
}
