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

  const [user, listing] = await Promise.all([
    getCurrentUser(),
    prisma.listing.findUnique({
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
    }),
  ]);

  if (!listing) notFound();

  const isSeller = user?.id === listing.sellerId;

  if (!isSeller && listing.status !== "ACTIVE") notFound();

  const imageUrls = getImageUrls(listing.imageUrl);

  return (
    <div className="panel">
      <div className="section-title" style={{ marginBottom: "20px" }}>
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
          <h1>{listing.title}</h1>

          <div style={{ fontSize: "1.35rem", fontWeight: 800, margin: "12px 0" }}>
            {formatPrice(listing.price, listing.currency)}
          </div>

          <div className="meta">
            <span>📍 {listing.location}</span>
            <span>Listed {listing.createdAt.toLocaleDateString()}</span>
          </div>

          {listing.details && typeof listing.details === "object" && !Array.isArray(listing.details) && Object.values(listing.details).some(Boolean) && (
            <section className="panel" style={{ marginTop: "20px", padding: "18px" }}>
              <h2>Item details</h2>
              <div className="details-grid">
                {Object.entries(listing.details as Record<string, unknown>).map(([key, value]) => {
                  if (value === undefined || value === null || value === "" || value === false) return null;
                  const labels: Record<string, string> = {
                    brand: "Brand", model: "Model", condition: "Condition", conditionNotes: "Condition details",
                    color: "Color", size: "Size", material: "Material", quantity: "Quantity", year: "Year",
                    warranty: "Warranty", negotiable: "Negotiable", delivery: "Delivery", tags: "Tags",
                  };
                  return <div key={key}><strong>{labels[key] || key}</strong><span>{value === true ? "Yes" : String(value)}</span></div>;
                })}
              </div>
            </section>
          )}

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

          <div style={{ marginTop: "20px" }}>
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
