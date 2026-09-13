import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import ListingActions from "../../../components/ListingActions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export default async function ListingPage({
  params,
}: PageProps) {
  const { id } = await params;

  const [user, listing] = await Promise.all([
    getCurrentUser(),

    prisma.listing.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        sellerId: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        category: true,
        imageUrl: true,
        location: true,
        status: true,
        soldAt: true,
        createdAt: true,
        updatedAt: true,
        seller: {
          select: {
            id: true,
            name: true,
            university: true,
            country: true,
            accountType: true,
            emailVerified: true,
            phoneVerified: true,
          },
        },
      },
    }),
  ]);

  if (!listing) {
    notFound();
  }

  const isSeller = user?.id === listing.sellerId;

  if (
    !isSeller &&
    listing.status !== "ACTIVE"
  ) {
    notFound();
  }

  const sellerFullyVerified =
    listing.seller.emailVerified &&
    listing.seller.phoneVerified;

  const currentUserFullyVerified =
    user?.emailVerified &&
    user?.phoneVerified;

  return (
    <main className="page-shell">
      <section className="listing-detail-page">
        <div className="listing-detail-top">
          <Link
            href="/listings"
            className="back-link"
          >
            ← Back to listings
          </Link>

          <span className="listing-detail-category">
            {listing.category}
          </span>
        </div>

        <div className="listing-detail-layout">
          <div className="listing-detail-media">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="listing-detail-image"
              />
            ) : (
              <div
                className="listing-detail-placeholder"
                aria-label="No listing image"
              >
                🛍️
              </div>
            )}
          </div>

          <div className="listing-detail-content">
            {listing.status === "SOLD" && (
              <div className="sold-banner">
                This listing has been sold.
              </div>
            )}

            {listing.status === "EXPIRED" && (
              <div className="sold-banner">
                This listing is no longer available.
              </div>
            )}

            <p className="eyebrow">
              {listing.category}
            </p>

            <h1>{listing.title}</h1>

            <strong className="listing-detail-price">
              {formatPrice(
                listing.price,
                listing.currency
              )}
            </strong>

            <div className="listing-detail-meta">
              <span>
                📍 {listing.location}
              </span>

              <span>
                Listed{" "}
                {listing.createdAt.toLocaleDateString()}
              </span>
            </div>

            <div className="listing-description-full">
              <h2>Description</h2>

              <p>
                {listing.description}
              </p>
            </div>

            <div className="seller-card">
              <div className="seller-card-avatar">
                {listing.seller.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="seller-card-info">
                <p className="eyebrow">SELLER</p>

                <h2>
                  {listing.seller.name}
                </h2>

                <p>
                  {listing.seller.university}
                </p>

                <p>
                  {listing.seller.country} ·{" "}
                  {listing.seller.accountType ===
                  "STUDENT"
                    ? "Student"
                    : "Outsider"}
                </p>

                <div className="seller-verification">
                  <span>
                    {sellerFullyVerified
                      ? "✓ Verified account"
                      : "Verification incomplete"}
                  </span>
                </div>
              </div>

              <Link
                href={`/profile/${listing.seller.id}`}
                className="secondary-button"
              >
                View profile
              </Link>
            </div>

            {isSeller ? (
              <ListingActions
                listingId={listing.id}
                status={listing.status}
              />
            ) : listing.status === "ACTIVE" ? (
              <div className="listing-contact-area">
                {!user ? (
                  <div className="contact-notice">
                    <h3>Want to contact the seller?</h3>

                    <p>
                      Join Campus Mall and verify your
                      email and phone number to start a
                      conversation.
                    </p>

                    <Link
                      href="/account"
                      className="primary-button"
                    >
                      Join Campus Mall
                    </Link>
                  </div>
                ) : !currentUserFullyVerified ? (
                  <div className="contact-notice">
                    <h3>Verification required</h3>

                    <p>
                      Your email and phone number must both
                      be verified before you can contact
                      sellers.
                    </p>

                    <Link
                      href="/verify"
                      className="primary-button"
                    >
                      Verify my account
                    </Link>
                  </div>
                ) : !sellerFullyVerified ? (
                  <div className="contact-notice">
                    <h3>Seller verification incomplete</h3>

                    <p>
                      This seller cannot receive marketplace
                      messages until their account is fully
                      verified.
                    </p>
                  </div>
                ) : (
                  <div className="contact-notice">
                    <h3>Interested in this listing?</h3>

                    <p>
                      Start a private conversation with the
                      seller through Campus Mall Chats.
                    </p>

                    <Link
                      href={`/chats?listingId=${listing.id}&withUserId=${listing.seller.id}`}
                      className="primary-button"
                    >
                      Message seller
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
