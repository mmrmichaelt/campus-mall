"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type SiteHeaderProps = {
  userName?: string | null;
  isVerified?: boolean;
};

export default function SiteHeader({
  userName,
  isVerified = false,
}: SiteHeaderProps) {
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      window.location.href = `/listings?q=${encodeURIComponent(
        trimmedQuery
      )}`;
      return;
    }

    window.location.href = "/listings";
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link
          href="/"
          className="site-brand"
          aria-label="Campus Mall home"
        >
          <span className="site-brand-mark" aria-hidden="true">
            <span>CM</span>
            <span className="site-brand-cart">🛒</span>
          </span>

          <span className="site-brand-text">
            <strong>Campus Mall</strong>
            <small>Your campus marketplace</small>
          </span>
        </Link>

        <form
          className="site-search"
          onSubmit={handleSearch}
          role="search"
        >
          <label
            htmlFor="global-marketplace-search"
            className="sr-only"
          >
            Search Campus Mall
          </label>

          <input
            id="global-marketplace-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search items, food, jobs, services..."
            autoComplete="off"
          />

          <button
            type="submit"
            className="site-search-button"
            aria-label="Search marketplace"
          >
            🔎
          </button>
        </form>

        <nav
          className="site-navigation"
          aria-label="Main navigation"
        >
          <Link href="/listings">
            Marketplace
          </Link>

          {userName ? (
            <>
              {isVerified && (
                <Link href="/chats">
                  Chats
                </Link>
              )}

              <Link href="/account">
                {userName}
              </Link>
            </>
          ) : (
            <Link
              href="/account"
              className="site-join-button"
            >
              Join
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
