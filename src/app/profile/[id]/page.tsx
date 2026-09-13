import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicProfilePage({
  params,
}: ProfilePageProps) {
  const { id } = await params;

  const profile = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      country: true,
      university: true,
      accountType: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      setting: {
        select: {
          publicProfile: true,
        },
      },
      _count: {
        select: {
          listings: {
            where: {
              status: "ACTIVE",
            },
          },
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  const isOwner = currentUser?.id === profile.id;

  if (
    !isOwner &&
    profile.setting &&
    !profile.setting.publicProfile
  ) {
    return (
      <main className="page-shell">
        <section className="protected-page">
          <div className="protected-card">
            <p className="eyebrow">CAMPUS MALL</p>

            <h1>Profile unavailable</h1>

            <p>
              This user has chosen to keep their
              profile private.
            </p>

            <Link
              href="/listings"
              className="primary-button"
            >
              Browse listings
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const memberSince = new Intl.DateTimeFormat(
    "en",
    {
      year: "numeric",
      month: "long",
    }
  ).format(profile.createdAt);

  return (
    <main className="page-shell">
      <section className="public-profile-page">
        <div className="public-profile-header">
          <div>
            <p className="eyebrow">CAMPUS MALL PROFILE</p>

            <h1>{profile.name}</h1>

            <p>
              View this user's public Campus Mall
              information and active listings.
            </p>
          </div>

          <div className="profile-header-actions">
            <Link
              href="/listings"
              className="secondary-button"
            >
              Browse marketplace
            </Link>

            {isOwner && (
              <Link
                href="/profile"
                className="primary-button"
              >
                Edit profile
              </Link>
            )}
          </div>
        </div>

        <div className="public-profile-layout">
          <section className="public-profile-card">
            <div className="public-profile-avatar">
              {initials || "CM"}
            </div>

            <h2>{profile.name}</h2>

            <span className="profile-account-type">
              {profile.accountType === "STUDENT"
                ? "Student"
                : "Outsider"}
            </span>

            <div className="public-profile-details">
              <div className="public-profile-detail">
                <span>Country</span>
                <strong>{profile.country}</strong>
              </div>

              <div className="public-profile-detail">
                <span>University / College</span>
                <strong>{profile.university}</strong>
              </div>

              <div className="public-profile-detail">
                <span>Member since</span>
                <strong>{memberSince}</strong>
              </div>

              <div className="public-profile-detail">
                <span>Active listings</span>
                <strong>{profile._count.listings}</strong>
              </div>
            </div>

            <div className="profile-verification">
              <span>
                {profile.emailVerified
                  ? "✓ Email verified"
                  : "Email not verified"}
              </span>

              <span>
                {profile.phoneVerified
                  ? "✓ Phone verified"
                  : "Phone not verified"}
              </span>
            </div>

            <p className="public-profile-privacy">
              Email addresses and phone numbers are
              kept private by Campus Mall.
            </p>
          </section>

          <section className="public-profile-listings">
            <div className="public-profile-listings-header">
              <div>
                <p className="eyebrow">MARKETPLACE</p>

                <h2>
                  {isOwner
                    ? "Your active listings"
                    : `${profile.name}'s active listings`}
                </h2>
              </div>

              <span className="listing-count">
                {profile._count.listings}
              </span>
            </div>

            {profile._count.listings === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛍️</div>

                <h3>No active listings</h3>

                <p>
                  This user currently has no active
                  marketplace listings.
                </p>

                {isOwner && (
                  <Link
                    href="/listings/new"
                    className="primary-button"
                  >
                    Add your first listing
                  </Link>
                )}
              </div>
            ) : (
              <PublicProfileListings
                userId={profile.id}
              />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

async function PublicProfileListings({
  userId,
}: {
  userId: string;
}) {
  const listings = await prisma.listing.findMany({
    where: {
      sellerId: userId,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      currency: true,
      category: true,
      imageUrl: true,
      location: true,
    },
  });

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="listing-grid">
      {listings.map((listing) => {
        const numericPrice = Number(listing.price);

        const formattedPrice = Number.isFinite(
          numericPrice
        )
          ? `${listing.currency} ${numericPrice.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }
            )}`
          : `${listing.currency} 0`;

        return (
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
                {formattedPrice}
              </strong>

              <div className="listing-meta">
                <span>
                  📍 {listing.location}
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
        );
      })}
    </div>
  );
                         }
