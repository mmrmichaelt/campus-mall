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

  return `${currency} ${numericPrice.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
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
    <div className="panel">
      <div
        className="section-title"
        style={{ marginBottom: "20px" }}
      >
        <Link
          href="/"
          className="text-link"
        >
          ← Back to marketplace
        </Link>

        <span className="category">
          {listing.category}
        </span>
      </div>

      <div className="two-col">
        <div>
          <div className="listing-photo">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
              />
            ) : (
              <div className="photo-placeholder">
                <span
                  style={{
                    fontSize: "48px",
                  }}
                >
                  🛍️
                </span>

                <span>
                  Campus Mall
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          {listing.status === "SOLD" && (
            <div
              className="error"
              style={{ marginBottom: "14px" }}
            >
              This listing has been sold.
            </div>
          )}

          {listing.status === "EXPIRED" && (
            <div
              className="error"
              style={{ marginBottom: "14px" }}
            >
              This listing is no longer available.
            </div>
          )}

          <p className="category">
            {listing.category}
          </p>

          <h1>{listing.title}</h1>

          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              margin: "12px 0",
            }}
          >
            {formatPrice(
              listing.price,
              listing.currency
            )}
          </div>

          <div className="meta">
            <span>
              📍 {listing.location}
            </span>

            <span>
              Listed{" "}
              {listing.createdAt.toLocaleDateString()}
            </span>
          </div>

          <section
            className="panel"
            style={{
              marginTop: "20px",
              padding: "18px",
            }}
          >
            <h2>Description</h2>

            <p>
              {listing.description}
            </p>
          </section>

          <section
            className="panel"
            style={{
              marginTop: "20px",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <div className="avatar-circle">
                {listing.seller.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <p className="category">
                  SELLER
                </p>

                <h2>
                  {listing.seller.name}
                </h2>

                <p className="note">
                  {listing.seller.university}
                </p>

                <p className="note">
                  {listing.seller.country} ·{" "}
                  {listing.seller.accountType ===
                  "STUDENT"
                    ? "Student"
                    : "Outsider"}
                </p>
              </div>

              <Link
                href={`/profile/${listing.seller.id}`}
                className="secondary-btn"
              >
                View profile
              </Link>
            </div>

            <div
              style={{
                marginTop: "14px",
              }}
            >
              <span
                className={
                  sellerFullyVerified
                    ? "success"
                    : "note"
                }
              >
                {sellerFullyVerified
                  ? "✓ Verified account"
                  : "Verification incomplete"}
              </span>
            </div>
          </section>

          <div style={{ marginTop: "20px" }}>
            {isSeller ? (
              <ListingActions
                listingId={listing.id}
                status={listing.status}
              />
            ) : listing.status === "ACTIVE" ? (
              <div className="panel">
                {!user ? (
                  <>
                    <h3>
                      Want to contact the seller?
                    </h3>

                    <p className="note">
                      Join Campus Mall and verify
                      your email and phone number
                      to start a conversation.
                    </p>

                    <Link
                      href="/join"
                      className="primary-btn"
                    >
                      Join Campus Mall
                    </Link>
                  </>
                ) : !currentUserFullyVerified ? (
                  <>
                    <h3>
                      Verification required
                    </h3>

                    <p className="note">
                      Your email and phone number
                      must both be verified before
                      you can contact sellers.
                    </p>

                    <Link
                      href="/verify"
                      className="primary-btn"
                    >
                      Verify my account
                    </Link>
                  </>
                ) : !sellerFullyVerified ? (
                  <>
                    <h3>
                      Seller verification incomplete
                    </h3>

                    <p className="note">
                      This seller cannot receive
                      marketplace messages until
                      their account is fully verified.
                    </p>
                  </>
                ) : (
                  <>
                    <h3>
                      Interested in this listing?
                    </h3>

                    <p className="note">
                      Start a private conversation
                      with the seller through Campus
                      Mall Chats.
                    </p>

                    <Link
                      href={`/chats?listingId=${listing.id}&withUserId=${listing.seller.id}`}
                      className="primary-btn"
                    >
                      Message seller
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
