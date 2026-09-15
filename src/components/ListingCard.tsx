"use client";

import {
  ShoppingCart,
  MapPin,
  BadgeCheck,
  Tag,
} from "lucide-react";

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

export default function ListingCard({
  item,
  onCart,
}: ListingCardProps) {
  const price = Number(item.price);

  const verified =
    item.seller?.emailVerified || item.seller?.phoneVerified;

  return (
    <article
      className={`listing-card ${
        item.promoted ? "promoted" : ""
      }`}
    >
      <div className="listing-photo">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
          />
        ) : (
          <div className="photo-placeholder">
            <Tag size={30} />
            <span>Campus Mall</span>
          </div>
        )}

        {item.promoted && (
          <span className="promoted-label">
            PROMOTED
          </span>
        )}
      </div>

      <div className="listing-body">
        <div className="listing-top">
          <span className="category">
            {item.category}
          </span>

          <strong>
            {item.currency || "KES"}{" "}
            {Number.isFinite(price)
              ? price.toLocaleString()
              : "0"}
          </strong>
        </div>

        <h3>{item.title}</h3>

        <p>{item.description}</p>

        <div className="meta">
          <span>
            <MapPin size={14} />
            {item.location}
          </span>
        </div>

        <div className="seller">
          <span>
            {item.seller?.name || "Seller"}
          </span>

          {verified && (
            <BadgeCheck
              size={15}
              aria-label="Verified seller"
            />
          )}

          {item.seller?.university && (
            <small>
              {item.seller.university}
            </small>
          )}
        </div>

        {onCart && (
          <button
            type="button"
            className="primary-btn"
            onClick={() => onCart(item.id)}
          >
            <ShoppingCart size={17} />
            Add to trolley
          </button>
        )}
      </div>
    </article>
  );
}
