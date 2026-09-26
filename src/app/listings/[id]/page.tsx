import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import ListingActions from "../../../components/ListingActions";
import ListingEngagement from "../../../components/ListingEngagement";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getImageUrls(value?: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
  } catch {}
  return [value];
}

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

export default async function ListingPage({ params }: PageProps) {
  const { id } = await params;

  // Load the listing independently from the optional session. A broken or
  // expired session must never prevent a public listing from opening.
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      sellerId: true,
      title: true,
      description: true,
      price: true,
      currency: true,
      category: true,
      imageUrl: true,
      details: true,
      location: true,
      status: true,
      promoted: true,
      promotedUntil: true,
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
  });

  if (!listing) notFound();

  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Campus Mall listing session lookup failed:", error);
  }

  const isSeller = user?.id === listing.sellerId;

  if (!isSeller && listing.status !== "ACTIVE") notFound();

  const imageUrls = getImageUrls(listing.imageUrl);

  return (
    <div className="panel">
      <div className="section-title" style={{ marginBottom: "10px" }}>
        <Link href="/" className="text-link">← Back to marketplace</Link>
        <span className="category">{listing.category}</span>
      </div>

      <div className="two-col">
        <div>
          {imageUrls.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div className="listing-photo">
                <img src={imageUrls[0]} alt={listing.title} />
              </div>
              {imageUrls.length > 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(80px,1fr))", gap: 8 }}>
                  {imageUrls.slice(1).map((url, index) => (
                    <img
                      key={url}
                      src={url}
                      alt={`${listing.title} photo ${index + 2}`}
                      style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 12 }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="listing-photo">
              <div className="photo-placeholder">
                <span style={{ fontSize: "48px" }}>🛍️</span>
                <span>Campus Mall</span>
              </div>
            </div>
          )}
        </div>

        <div>
          {listing.status === "SOLD" && (
            <div className="error" style={{ marginBottom: "14px" }}>This listing has been sold.</div>
          )}

          {listing.status === "EXPIRED" && (
            <div className="error" style={{ marginBottom: "14px" }}>This listing is no longer available.</div>
          )}

          <p className="category">{listing.category}</p>
          {listing.promoted && listing.promotedUntil && listing.promotedUntil > new Date() && (
            <div className="success" style={{ marginBottom: "10px" }}>📣 Promoted listing — boosted until {listing.promotedUntil.toLocaleDateString()}</div>
          )}
          <div className="listing-detail-title">
            <strong>Title</strong>
            <h1>{listing.title}</h1>
          </div>

          <div className="listing-detail-price">
            <strong>Price</strong>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, margin: "2px 0 0" }}>
              {formatPrice(listing.price, listing.currency)}
            </div>
          </div>

          <div className="meta">
            <span>📍 {listing.location}</span>
            <span>Listed {listing.createdAt.toLocaleDateString()}</span>
          </div>

          {(() => {
            const detailValues: Record<string, unknown> = {
              title: listing.title,
              brand: listing.details && typeof listing.details === "object" && !Array.isArray(listing.details) ? (listing.details as Record<string, unknown>).brand : undefined,
              condition: listing.details && typeof listing.details === "object" && !Array.isArray(listing.details) ? (listing.details as Record<string, unknown>).condition : undefined,
              price: formatPrice(listing.price, listing.currency),
              color: listing.details && typeof listing.details === "object" && !Array.isArray(listing.details) ? (listing.details as Record<string, unknown>).color : undefined,
              delivery: listing.details && typeof listing.details === "object" && !Array.isArray(listing.details) ? (listing.details as Record<string, unknown>).delivery : undefined,
              category: listing.category,
              model: listing.details && typeof listing.details === "object" && !Array.isArray(listing.details) ? (listing.details as Record<string, unknown>).model : undefined,
              year: listing.details && typeof listing.details === "object" && !Array.isArray(listing.details) ? (listing.details as Record<string, unknown>).year : undefined,
              warranty: listing.details && typeof listing.details === "object" && !Array.isArray(listing.details) ? (listing.details as Record<string, unknown>).warranty : undefined,
              currency: listing.currency,
              institution: listing.seller.university,
              location: listing.location,
              description: listing.description,
            };
            const rawDetails = listing.details && typeof listing.details === "object" && !Array.isArray(listing.details)
              ? listing.details as Record<string, unknown>
              : {};
            const labels: Record<string, string> = {
              title: "Title", brand: "Brand", condition: "Condition", price: "Price", color: "Colour",
              delivery: "Delivery", category: "Category", model: "Model", year: "Year", warranty: "Warranty",
              currency: "Currency", institution: "Institution", location: "Location", description: "Description",
              conditionNotes: "Condition details", size: "Size", material: "Material", quantity: "Quantity",
              negotiable: "Negotiable", tags: "Tags",
            };
            const knownKeys = new Set(Object.keys(detailValues));
            const extraEntries = Object.entries(rawDetails).filter(([key]) => !knownKeys.has(key));
            return (
              <section className="panel" style={{ marginTop: "10px", padding: "12px" }}>
                <h2>Item details</h2>
                <div className="details-grid">
                  {[...Object.entries(detailValues), ...extraEntries].map(([key, value], index, entries) => (
                    <div key={key}>
                      <strong>{labels[key] || key}</strong>
                      <span>{value === undefined || value === null || value === "" || value === false ? "—" : value === true ? "Yes" : String(value)}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          <section className="panel" style={{ marginTop: "20px", padding: "18px" }}>
            <h2>Description</h2>
            <p>{listing.description}</p>
          </section>

          <section className="panel" style={{ marginTop: "20px", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              <div className="avatar-circle">{listing.seller.name.charAt(0).toUpperCase()}</div>

              <div style={{ flex: 1 }}>
                <p className="category">SELLER</p>
                <h2>{listing.seller.name}</h2>
                <p className="note">{listing.seller.university}</p>
                <p className="note">
                  {listing.seller.country} · {listing.seller.accountType === "STUDENT" ? "Student" : "Outsider"}
                </p>
              </div>

              <Link href={`/profile/${listing.seller.id}`} className="secondary-btn">
                View profile
              </Link>
            </div>

          </section>

          <ListingEngagement listingId={listing.id} sellerId={listing.seller.id} active={listing.status === "ACTIVE"} />

          <div style={{ marginTop: "10px" }}>
            {isSeller ? (
              <ListingActions listingId={listing.id} status={listing.status} />
            ) : listing.status === "ACTIVE" ? (
              <div className="panel">
                {!user ? (
                  <>
                    <h3>Want to contact the seller?</h3>
                    <p className="note">
                      Create a Campus Mall account to message sellers, save items, comment, share or place orders.
                    </p>
                    <Link href="/join" className="primary-btn">Join Campus Mall</Link>
                  </>
                ) : (
                  <>
                    <h3>Interested in this listing?</h3>
                    <p className="note">
                      Start a private conversation with the seller through Campus Mall Chats.
                    </p>
                    <Link
                      href={{
                        pathname: "/chats",
                        query: {
                          listingId: listing.id,
                          withUserId: listing.seller.id,
                        },
                      }}
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
