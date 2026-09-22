"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Campus Mall profile page error:", error);
  }, [error]);

  return (
    <main className="page-shell">
      <section className="protected-page">
        <div className="protected-card">
          <p className="eyebrow">CAMPUS MALL</p>
          <h1>We couldn't open your profile</h1>
          <p>
            Your account has not been changed. Please try opening the profile
            editor again.
          </p>
          <div className="protected-actions">
            <button type="button" className="primary-button" onClick={reset}>
              Try again
            </button>
            <Link href="/account" className="secondary-button">
              Back to account
            </Link>
          </div>
          <p className="error-support">
            Need help?{" "}
            <a href="mailto:campusmall.support@gmail.com">
              campusmall.support@gmail.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
