"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Tag, ChevronDown, ExternalLink } from "lucide-react";

type ListingCardProps = {
  item: {
    id: string;
    title: string;
    description: string;
    price: number | string;
    currency?: string;
    category: string;
    imageUrl?: string | null;
    location: string;
    promoted?: boolean;
    seller?: {
      id?: string;
      name?: string;
      university?: string;
      emailVerified?: boolean;
      phoneVerified?: boolean;
    };
    details?: Record<string, unknown> | null;
  };
  onCart?: (id: string) => void;
};

function getImageUrl(value?: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
  } catch {}
  return value;
}

function detail(item: ListingCardProps["item"], key: string) {
  const value = item.details?.[key];
  return value === undefined || value === null || value === "" || value === false ? "—" : String(value);
}

export default function ListingCard({ item, onCart }: ListingCardProps) {
  const [more, setMore] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const price = Number(item.price);
  const verified = item.seller?.emailVerified || item.seller?.phoneVerified;
  const imageUrl = getImageUrl(item.imageUrl);

  async function handleCart() {
    if (onCart) {
      onCart(item.id);
      return;
    }

    setCartLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: item.id, quantity: 1 }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.href = "/join";
        return;
      }

      if (!response.ok) {
        window.alert(data.error || "Unable to add this item to your cart.");
        return;
      }

      window.alert("Added to cart.");
    } catch {
      window.alert("Unable to connect to Campus Mall.");
    } finally {
      setCartLoading(false);
    }
  }

  return (
    <article className={`listing-card compact-product-card ${item.promoted ? "promoted" : ""}`}>
      <Link href={`/listings/${item.id}`} className="listing-photo listing-photo-link" aria-label={`View details for ${item.title}`}>
        {imageUrl ? <img src={imageUrl} alt={item.title} loading="lazy" /> : <div className="photo-placeholder"><Tag size={26} /></div>}
        {item.promoted && <span className="promoted-label">PROMOTED</span>}
      </Link>

      <div className="listing-body">
        <div className="listing-card-columns listing-card-summary">
          <div className="listing-card-column">
            <div><strong>Title</strong><Link href={`/listings/${item.id}`} className="listing-title-link">{item.title}</Link></div>
            <div><strong>Condition</strong><span>{detail(item, "condition")}</span></div>
          </div>
          <div className="listing-card-column">
            <div><strong>Brand</strong><span>{detail(item, "brand")}</span></div>
            <div><strong>Price</strong><span>{item.currency || "KES"} {Number.isFinite(price) ? price.toLocaleString() : "0"}</span></div>
          </div>
        </div>

        {more && (
          <div className="listing-expanded-details">
            <div><strong>Category</strong><span>{item.category}</span></div>
            <div><strong>Model</strong><span>{detail(item, "model")}</span></div>
            <div><strong>Year</strong><span>{detail(item, "year")}</span></div>
            <div><strong>Warranty</strong><span>{detail(item, "warranty")}</span></div>
            <div><strong>Currency</strong><span>{item.currency || "KES"}</span></div>
            <div><strong>Location</strong><span>{item.location || "—"}</span></div>
            <div><strong>Seller information</strong><span>{item.seller?.name || "Seller"}{verified ? " · Verified" : ""}{item.seller?.university ? ` · ${item.seller.university}` : ""}</span></div>
            <div><strong>Colour</strong><span>{detail(item, "color")}</span></div>
            <div><strong>Delivery</strong><span>{detail(item, "delivery")}</span></div>
          </div>
        )}

        <button type="button" className="listing-more-btn" onClick={() => setMore(v => !v)} aria-expanded={more}>
          <span>{more ? "Show less" : "More"}</span><ChevronDown size={15} className={more ? "rotated" : ""} />
        </button>

        <div className="listing-card-actions">
          <Link href={`/listings/${item.id}`} className="secondary-btn listing-details-btn">
            <ExternalLink size={16} /> View details
          </Link>
          <button type="button" className="product-cart-btn" onClick={handleCart} disabled={cartLoading}>
            <ShoppingCart size={16} /> {cartLoading ? "Adding..." : "Add to cart"}
          </button>
        </div>

        <button type="button" className="product-like" aria-label={`Save ${item.title}`} title="Save">
          <Heart size={17} />
        </button>
      </div>
    </article>
  );
}
