"use client";

import { Heart, MapPin, ShoppingCart, BadgeCheck, Tag } from "lucide-react";

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

export default function ListingCard({ item, onCart }: ListingCardProps) {
  const price = Number(item.price);
  const verified = item.seller?.emailVerified || item.seller?.phoneVerified;
  const imageUrl = getImageUrl(item.imageUrl);

  return (
    <article className={`listing-card compact-product-card ${item.promoted ? "promoted" : ""}`}>
      <div className="listing-photo">
        {imageUrl ? (
          <img src={imageUrl} alt={item.title} loading="lazy" />
        ) : (
          <div className="photo-placeholder"><Tag size={26} /></div>
        )}
        {item.promoted && <span className="promoted-label">PROMOTED</span>}
        <button type="button" className="product-like" aria-label={`Save ${item.title}`} title="Save">
          <Heart size={17} />
        </button>
      </div>

      <div className="listing-body">
        <span className="product-category">{item.category}</span>
        <h3>{item.title}</h3>
        <strong className="product-price">
          {item.currency || "KES"} {Number.isFinite(price) ? price.toLocaleString() : "0"}
        </strong>

        <div className="product-meta">
          <span><MapPin size={13} /> {item.location}</span>
          {item.seller?.university && <span>{item.seller.university}</span>}
        </div>

        <div className="product-seller">
          <span>{item.seller?.name || "Seller"}</span>
          {verified && <BadgeCheck size={14} aria-label="Verified seller" />}
        </div>

        {onCart && (
          <button type="button" className="product-cart-btn" onClick={() => onCart(item.id)}>
            <ShoppingCart size={16} />
            Add to trolley
          </button>
        )}
      </div>
    </article>
  );
}
