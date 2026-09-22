"use client";

import { useEffect } from "react";
import Link from "next/link";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error("Campus Mall application error:", error);
  }, [error]);

  return (
    <main className="page-shell">
      <section className="protected-page">
        <div className="protected-card">
          <p className="eyebrow">CAMPUS MALL</p>

          <h1>Something went wrong</h1>

          <p>
            We could not complete that request right now.
            Your account and marketplace data are still
            protected.
          </p>

          <div className="protected-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => reset()}
            >
              Try again
            </button>

            <Link
              href="/"
              className="secondary-button"
            >
              Go to home
            </Link>
          </div>

          <p className="error-support">
            If the problem continues, contact{" "}
            <a href="mailto:campusmall.support@gmail.com">
              campusmall.support@gmail.com
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
