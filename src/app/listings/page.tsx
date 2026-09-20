import Link from "next/link";

import { prisma } from "../../lib/prisma";
import ListingCard from "../../components/ListingCard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  country?: string;
  university?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  location?: string;
  sellerType?: string;
}>;

const categories = [
  "Accommodation",
  "Beauty & dressing",
  "Electronics",
  "Food",
  "Furniture",
  "Jobs",
  "Printing & photography",
  "Services",
  "Stationery",
  "Utensils",
  "Other",
];

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
  const minPrice = Number(params.minPrice);
  const maxPrice = Number(params.maxPrice);
  const sort = params.sort?.trim() || "newest";
  const location = params.location?.trim() || "";
  const sellerType = params.sellerType?.trim() || "";

  const priceFilter = {
    ...(Number.isFinite(minPrice) && minPrice >= 0 ? { gte: minPrice } : {}),
    ...(Number.isFinite(maxPrice) && maxPrice >= 0 ? { lte: maxPrice } : {}),
  };

  const sellerFilters: {
    country?: {
      equals: string;
      mode: "insensitive";
    };
    accountType?: "STUDENT" | "OUTSIDER";
    university?: {
      equals: string;
      mode: "insensitive";
    };
  } = {};

  if (country) {
    sellerFilters.country = {
      equals: country,
      mode: "insensitive",
    };
  }

  if (sellerType === "STUDENT" || sellerType === "OUTSIDER") {
    sellerFilters.accountType = sellerType as "STUDENT" | "OUTSIDER";
  }

  if (university) {
    sellerFilters.university = {
      equals: university,
      mode: "insensitive",
    };
  }

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",

      ...(category
        ? {
            category: {
              equals: category,
              mode: "insensitive" as const,
            },
          }
        : {}),

      ...(Object.keys(sellerFilters).length > 0
        ? {
            seller: sellerFilters,
          }
        : {}),

      ...(Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {}),

      ...(location
        ? { location: { contains: location, mode: "insensitive" as const } }
        : {}),

      ...(q
        ? {
            OR: [
              {
                title: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                category: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                location: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },

    orderBy:
      sort === "price-low" ? [{ price: "asc" as const }] :
      sort === "price-high" ? [{ price: "desc" as const }] :
      sort === "title-az" ? [{ title: "asc" as const }] :
      sort === "title-za" ? [{ title: "desc" as const }] :
      sort === "oldest" ? [{ createdAt: "asc" as const }] :
      [{ promoted: "desc" as const }, { createdAt: "desc" as const }],

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
      promoted: true,
      createdAt: true,
      seller: {
        select: {
          id: true,
          name: true,
          university: true,
          country: true,
          emailVerified: true,
          phoneVerified: true,
        },
      },
    },
  });

  const hasFilters =
    Boolean(q) ||
    Boolean(category) ||
    Boolean(country) ||
    Boolean(university) ||
    Boolean(params.minPrice) ||
    Boolean(params.maxPrice) ||
    Boolean(params.sort && params.sort !== "newest") ||
    Boolean(location) ||
    Boolean(sellerType);

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">MARKETPLACE</p>

          <h1>Campus Mall listings</h1>

          <p className="note">
            Discover items, food, jobs and services from
            people around campus.
          </p>
        </div>

        <Link
          href="/sell"
          className="primary-btn"
        >
          Add listing
        </Link>
      </div>

      <form
        action="/listings"
        method="GET"
        className="filterbar"
      >
        <div
          style={{
            flex: 1,
            minWidth: "220px",
          }}
        >
          <label
            htmlFor="listing-search"
            className="note"
          >
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

        <div
          style={{
            minWidth: "190px",
          }}
        >
          <label
            htmlFor="listing-category"
            className="note"
          >
            Category
          </label>

          <select
            id="listing-category"
            name="category"
            defaultValue={category}
          >
            <option value="">
              All categories
            </option>

            {categories.map((itemCategory) => (
              <option
                key={itemCategory}
                value={itemCategory}
              >
                {itemCategory}
              </option>
            ))}
          </select>
        </div>

        {country && (
          <input
            type="hidden"
            name="country"
            value={country}
          />
        )}

        {university && (
          <input
            type="hidden"
            name="university"
            value={university}
          />
        )}

        <button
          type="submit"
          className="primary-btn"
        >
          Search
        </button>

        {hasFilters && (
          <Link
            href="/listings"
            className="secondary-btn"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="section-title">
        <div>
          <p className="category">RESULTS</p>

          <h2>
            {listings.length}{" "}
            {listings.length === 1
              ? "listing"
              : "listings"}{" "}
            available
          </h2>
        </div>

        {hasFilters && (
          <span className="note">
            Showing filtered results
          </span>
        )}
      </div>

      {listings.length === 0 ? (
        <div className="panel">
          <div
            style={{
              textAlign: "center",
              padding: "30px 15px",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "12px",
              }}
            >
              🔎
            </div>

            <h2>No listings found</h2>

            <p className="note">
              Try another search or remove some filters.
            </p>

            <Link
              href="/listings"
              className="secondary-btn"
            >
              View all listings
            </Link>
          </div>
        </div>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              item={{
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: listing.price.toString(),
                currency: listing.currency,
                category: listing.category,
                imageUrl: listing.imageUrl,
                location: listing.location,
                promoted: listing.promoted,
                seller: {
                  id: listing.seller.id,
                  name: listing.seller.name,
                  university:
                    listing.seller.university,
                  emailVerified:
                    listing.seller.emailVerified,
                  phoneVerified:
                    listing.seller.phoneVerified,
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
