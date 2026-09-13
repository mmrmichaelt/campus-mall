import Link from "next/link";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  country?: string;
  university?: string;
}>;

function formatPrice(price: unknown, currency: string) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return `${currency} 0`;
  }

  return `${currency} ${numericPrice.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const country = params.country?.trim() || "";
  const university = params.university?.trim() || "";

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",

      ...(category
        ? {
            category: {
              equals: category,
              mode: "insensitive",
            },
          }
        : {}),

      ...(country
        ? {
            seller: {
              country: {
                equals: country,
                mode: "insensitive",
              },
            },
          }
        : {}),

      ...(university
        ? {
            seller: {
              university: {
                equals: university,
                mode: "insensitive",
              },
            },
          }
        : {}),

      ...(q
        ? {
            OR: [
              {
                title: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                category: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                location: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 60,

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
  });

  const hasFilters =
    Boolean(q) ||
    Boolean(category) ||
    Boolean(country) ||
    Boolean(university);

  return (
    <main className="page-shell">
      <section className="listings-page">
        <div className="listings-header">
          <div>
            <p className="eyebrow">MARKETPLACE</p>

            <h1>Campus Mall listings</h1>

            <p>
              Discover items, food, jobs and services from
              people around campus.
            </p>
          </div>

          <Link
            href="/listings/new"
            className="primary-button"
          >
            Add listing
          </Link>
        </div>

        <form
          action="/listings"
          method="GET"
          className="listing-search-form"
        >
          <div className="search-field">
            <label htmlFor="listing-search">
              Search
            </label>

            <input
              id="listing-search"
              name="q"
              type="search"
              placeholder="Search items, food, jobs, services..."
              defaultValue={q}
            />
          </div>

          <div className="search-field">
            <label htmlFor="listing-category">
              Category
            </label>

            <select
              id="listing-category"
              name="category"
              defaultValue={category}
            >
              <option value="">All categories</option>
              <option value="items">Items</option>
              <option value="food">Food</option>
              <option value="jobs">Jobs</option>
              <option value="services">Services</option>
            </select>
          </div>

          <button
            type="submit"
            className="primary-button"
          >
            Search
          </button>

          {hasFilters && (
            <Link
              href="/listings"
              className="secondary-button"
            >
              Clear filters
            </Link>
          )}
        </form>

        <div className="listing-results-header">
          <div>
            <p className="eyebrow">RESULTS</p>

            <h2>
              {listings.length}{" "}
              {listings.length === 1
                ? "listing"
                : "listings"}{" "}
              available
            </h2>
          </div>

          {hasFilters && (
            <p className="filter-summary">
              Showing filtered results
            </p>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>

            <h2>No listings found</h2>

            <p>
              Try another search or remove some filters.
            </p>

            <Link
              href="/listings"
              className="secondary-button"
            >
              View all listings
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

                  <Link
                    href={`/listings/${listing.id}`}
                    className="listing-view-link"
                  >
                    View listing →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
              }
