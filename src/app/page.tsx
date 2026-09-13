import Link from "next/link";

import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";

export const dynamic = "force-dynamic";

function formatPrice(
  price: unknown,
  currency: string
) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return `${currency} 0`;
  }

  return `${currency} ${numericPrice.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}

export default async function HomePage() {
  const [user, listings] = await Promise.all([
    getCurrentUser(),

    prisma.listing.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 24,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        category: true,
        imageUrl: true,
        location: true,
        createdAt: true,
        seller: {
          select: {
            id: true,
            name: true,
            university: true,
            country: true,
          },
        },
      },
    }),
  ]);

  return (
    <>
      <div className="splash-screen" aria-hidden="true">
        <div className="splash-content">
          <div className="campus-logo splash-logo">
            <span>CM</span>
            <span className="cart-icon">🛒</span>
          </div>

          <h1>Welcome to campus mall</h1>

          <p className="splash-tagline">
            Your space. Your identity. Your future.
          </p>

          <p className="splash-copyright">
            © 2026 Campus Mall
          </p>
        </div>
      </div>

      <main className="site-shell">
        <header className="site-header">
          <Link
            href="/"
            className="brand"
            aria-label="Campus Mall home"
          >
            <span className="campus-logo">
              <span>CM</span>
              <span className="cart-icon">🛒</span>
            </span>

            <span className="brand-name">
              Campus Mall
            </span>
          </Link>

          <nav className="main-nav">
            <Link href="/">Home</Link>
            <Link href="/listings/new">
              Add item
            </Link>
            <Link href="/chats">
              Chats
            </Link>

            {user ? (
              <Link href="/account">
                Account
              </Link>
            ) : (
              <Link href="/account">
                Join
              </Link>
            )}
          </nav>
        </header>

        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">
              YOUR CAMPUS. YOUR MARKETPLACE.
            </p>

            <h1>
              Buy, sell and connect around campus.
            </h1>

            <p>
              Find items, food, jobs and services from
              students and people around your campus.
            </p>
          </div>

          <form
            action="/"
            method="GET"
            className="search-form"
          >
            <label
              htmlFor="home-search"
              className="sr-only"
            >
              Search Campus Mall
            </label>

            <input
              id="home-search"
              name="q"
              type="search"
              placeholder="Search items, food, jobs, services..."
              autoComplete="off"
            />

            <button type="submit">
              Search
            </button>
          </form>
        </section>

        <section className="category-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                EXPLORE
              </p>

              <h2>
                What are you looking for?
              </h2>
            </div>
          </div>

          <div className="category-grid">
            <Link
              href="/?category=items"
              className="category-card"
            >
              <span>🛍️</span>
              <strong>Items</strong>
              <small>
                Electronics, clothes, books and more
              </small>
            </Link>

            <Link
              href="/?category=food"
              className="category-card"
            >
              <span>🍔</span>
              <strong>Food</strong>
              <small>
                Meals, snacks and campus food
              </small>
            </Link>

            <Link
              href="/?category=jobs"
              className="category-card"
            >
              <span>💼</span>
              <strong>Jobs</strong>
              <small>
                Part-time work and opportunities
              </small>
            </Link>

            <Link
              href="/?category=services"
              className="category-card"
            >
              <span>🛠️</span>
              <strong>Services</strong>
              <small>
                Skills and services around campus
              </small>
            </Link>
          </div>
        </section>

        <section className="marketplace-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                MARKETPLACE
              </p>

              <h2>
                Latest listings
              </h2>
            </div>

            <Link
              href="/listings"
              className="text-link"
            >
              View all
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                🛒
              </div>

              <h3>
                No listings yet
              </h3>

              <p>
                Be the first person to add something
                to Campus Mall.
              </p>

              <Link
                href="/listings/new"
                className="primary-button"
              >
                Add your first listing
              </Link>
            </div>
          ) : (
            <div className="listing-grid">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="listing-card"
                >
                  <Link
                    href={`/listings/${listing.id}`}
                    className="listing-image-link"
                  >
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="listing-image"
                      />
                    ) : (
                      <div
                        className="listing-image-placeholder"
                        aria-label="No listing image"
                      >
                        🛍️
                      </div>
                    )}
                  </Link>

                  <div className="listing-card-body">
                    <div className="listing-category">
                      {listing.category}
                    </div>

                    <h3>
                      <Link
                        href={`/listings/${listing.id}`}
                      >
                        {listing.title}
                      </Link>
                    </h3>

                    <p className="listing-description">
                      {listing.description.length > 110
                        ? `${listing.description.slice(
                            0,
                            110
                          )}...`
                        : listing.description}
                    </p>

                    <strong className="listing-price">
                      {formatPrice(
                        listing.price,
                        listing.currency
                      )}
                    </strong>

                    <div className="listing-meta">
                      <span>
                        📍 {listing.location}
                      </span>

                      <span>
                        {listing.seller.university}
                      </span>
                    </div>

                    <div className="listing-seller">
                      <span>
                        Seller: {listing.seller.name}
                      </span>

                      <span>
                        {listing.seller.country}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="join-section">
          <div>
            <p className="eyebrow">
              CAMPUS MALL
            </p>

            <h2>
              Have something to sell?
            </h2>

            <p>
              Create your account and reach people
              looking for what you offer.
            </p>
          </div>

          <div className="join-actions">
            <Link
              href={
                user
                  ? "/listings/new"
                  : "/account"
              }
              className="primary-button"
            >
              {user
                ? "Add a listing"
                : "Join Campus Mall"}
            </Link>
          </div>
        </section>

        <footer className="site-footer">
          <div>
            <strong>
              Campus Mall
            </strong>

            <p>
              Your space. Your identity. Your future.
            </p>
          </div>

          <div className="footer-links">
            <Link href="/account">
              Account
            </Link>

            <Link href="/settings">
              Settings
            </Link>

            <Link href="/chats">
              Chats
            </Link>

            <a href="mailto:campusmallsupport@gmail.com">
              Support
            </a>
          </div>

          <p>
            © 2026 Campus Mall
          </p>
        </footer>
      </main>
    </>
  );
}
