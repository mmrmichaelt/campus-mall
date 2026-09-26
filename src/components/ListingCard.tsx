"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart, Tag, ExternalLink } from "lucide-react";

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
  const [cartLoading, setCartLoading] = useState(false);
  const price = Number(item.price);
  const imageUrl = getImageUrl(item.imageUrl);
  const brand = detail(item, "brand");
  const condition = detail(item, "condition");

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
        <Link href={`/listings/${item.id}`} className="listing-summary-link" aria-label={`View ${item.title} details`}>
          <div className="listing-summary-line">
            <span className="listing-summary-title">{item.title}</span>
            <span className="listing-summary-separator">/</span>
            <span>{brand}</span>
            <span className="listing-summary-separator">/</span>
            <span>{item.currency || "KES"} {Number.isFinite(price) ? price.toLocaleString() : "0"}</span>
            <span className="listing-summary-separator">/</span>
            <span>{condition}</span>
          </div>
        </Link>

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
