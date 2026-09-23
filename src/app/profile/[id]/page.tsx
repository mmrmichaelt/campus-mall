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
      imageUrl: true,
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
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-mark">CM</div>

          <p className="category">CAMPUS MALL</p>

          <h1>Profile unavailable</h1>

          <p className="note">
            This user has chosen to keep their profile
            private.
          </p>

          <Link
            href="/listings"
            className="primary-btn"
          >
            Browse listings
          </Link>
        </div>
      </div>
    );
  }

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  const memberSince = new Intl.DateTimeFormat(
    "en",
    {
      year: "numeric",
      month: "long",
    }
  ).format(profile.createdAt);

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">
            CAMPUS MALL PROFILE
          </p>

          <h1>{profile.name}</h1>

          <p className="note">
            View this user's public Campus Mall
            information and active listings.
          </p>
        </div>

        <div
          className="hero-actions"
          style={{ marginTop: 0 }}
        >
          <Link
            href="/"
            className="secondary-btn"
          >
            Browse marketplace
          </Link>

          {isOwner && (
            <Link
              href="/profile"
              className="primary-btn"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      <div className="profile-grid">
        <section className="panel">
          <div className="avatar-box">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt={profile.name} style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "50%" }} />
            ) : (
              <div className="avatar-circle">
                {initials || "CM"}
              </div>
            )}

            <h2>{profile.name}</h2>

            <span className="category">
              {profile.accountType === "STUDENT"
                ? "Student"
                : "Outsider"}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gap: "14px",
              marginTop: "20px",
            }}
          >
            <div>
              <span className="note">
                Country
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "3px",
                }}
              >
                {profile.country}
              </strong>
            </div>

            <div>
              <span className="note">
                University / College
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "3px",
                }}
              >
                {profile.university}
              </strong>
            </div>

            <div>
              <span className="note">
                Member since
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "3px",
                }}
              >
                {memberSince}
              </strong>
            </div>

            <div>
              <span className="note">
                Active listings
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "3px",
                }}
              >
                {profile._count.listings}
              </strong>
            </div>
          </div>

          <p
            className="note"
            style={{ marginTop: "18px" }}
          >
            Email addresses and phone numbers are kept
            private by Campus Mall.
          </p>
        </section>

        <section>
          <div className="section-title">
            <div>
              <p className="category">
                MARKETPLACE
              </p>

              <h2>
                {isOwner
                  ? "Your active listings"
                  : `${profile.name}'s active listings`}
              </h2>
            </div>

            <span className="category">
              {profile._count.listings} listing
              {profile._count.listings === 1
                ? ""
                : "s"}
            </span>
          </div>

          {profile._count.listings === 0 ? (
            <div className="panel">
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    marginBottom: "10px",
                  }}
                >
                  🛍️
                </div>

                <h3>No active listings</h3>

                <p className="note">
                  This user currently has no active
                  marketplace listings.
                </p>

                {isOwner && (
                  <Link
                    href="/sell"
                    className="primary-btn"
                  >
                    Add your first listing
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <PublicProfileListings
              userId={profile.id}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function getImageUrl(value?: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
  } catch {}
  return value;
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
        const imageUrl = getImageUrl(listing.imageUrl);
        const numericPrice = Number(
          listing.price
        );

        const formattedPrice =
          Number.isFinite(numericPrice)
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
              className="listing-photo"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={listing.title}
                  loading="lazy"
                />
              ) : (
                <div className="photo-placeholder">
                  <span
                    style={{
                      fontSize: "30px",
                    }}
                  >
                    🛍️
                  </span>

                  <span>
                    Campus Mall
                  </span>
                </div>
              )}
            </Link>

            <div className="listing-body">
              <div className="listing-top">
                <span className="category">
                  {listing.category}
                </span>

                <strong>
                  {formattedPrice}
                </strong>
              </div>

              <h3>
                <Link
                  href={`/listings/${listing.id}`}
                >
                  {listing.title}
                </Link>
              </h3>

              <p>
                {listing.description.length > 110
                  ? `${listing.description.slice(
                      0,
                      110
                    )}...`
                  : listing.description}
              </p>

              <div className="meta">
                <span>
                  📍 {listing.location}
                </span>
              </div>

              <Link
                href={`/listings/${listing.id}`}
                className="text-link"
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
