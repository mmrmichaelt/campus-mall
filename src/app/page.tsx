"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
PlusCircle,
SlidersHorizontal,
MapPin,
} from "lucide-react";
import ListingCard from "@/components/ListingCard";

const categories = [
"Accommodation",
"Beauty & dressing",
"Electronics",
"Food",
"Furniture",
"Jobs",
"Printing & photography",
"Stationery",
"Utensils",
];

export default function HomePage() {
const [items, setItems] = useState<any[]>([]);
const [user, setUser] = useState<any>(null);
const [loading, setLoading] = useState(true);

const [q, setQ] = useState("");
const [category, setCategory] = useState("");

useEffect(() => {
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";

setQ(initialQuery);

}, []);

useEffect(() => {
fetch("/api/me")
.then((response) => response.json())
.then((data) => {
setUser(data.user ?? null);
})
.catch(() => {
setUser(null);
});
}, []);

useEffect(() => {
const controller = new AbortController();

async function loadListings() {
  setLoading(true);

  try {
    const url = new URL(
      "/api/listings",
      window.location.origin
    );

    if (q.trim()) {
      url.searchParams.set("q", q.trim());
    }

    if (category) {
      url.searchParams.set("category", category);
    }

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      setItems([]);
      return;
    }

    setItems(data.listings || []);
  } catch (error: any) {
    if (error?.name !== "AbortError") {
      setItems([]);
    }
  } finally {
    if (!controller.signal.aborted) {
      setLoading(false);
    }
  }
}

loadListings();

return () => {
  controller.abort();
};

}, [q, category]);

async function addToCart(listingId: string) {
if (!user) {
window.location.href = "/join";
return;
}

try {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      listingId,
      quantity: 1,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    window.location.href = "/join";
    return;
  }

  if (!response.ok) {
    window.alert(
      data.error || "Unable to add this item to your trolley."
    );
    return;
  }

  window.alert("Added to trolley.");
} catch {
  window.alert(
    "Unable to connect to Campus Mall. Please try again."
  );
}

}

return (
<>
<section className="hero">
<h1>Campus Mall</h1>

    <p>
      Your campus marketplace for students and
      outsiders. See items posted around{" "}
      <b>
        {user?.university || "your selected university"}
      </b>
      , buy, sell, chat and manage orders in one place.
    </p>

    <div className="hero-actions">
      <Link className="primary-btn" href="/sell">
        <PlusCircle size={18} />
        Add item
      </Link>

      {!user && (
        <Link className="secondary-btn" href="/join">
          Create account
        </Link>
      )}
    </div>
  </section>

  <div className="section-title">
    <h2>Marketplace</h2>

    {user && (
      <span className="note">
        <MapPin size={14} />
        Showing your university
      </span>
    )}
  </div>

  <div className="filterbar">
    <input
      type="search"
      placeholder="Search this campus..."
      value={q}
      onChange={(event) => setQ(event.target.value)}
      aria-label="Search this campus"
    />

    <select
      value={category}
      onChange={(event) =>
        setCategory(event.target.value)
      }
      aria-label="Filter by category"
    >
      <option value="">All categories</option>

      {categories.map((categoryName) => (
        <option
          key={categoryName}
          value={categoryName}
        >
          {categoryName}
        </option>
      ))}
    </select>

    <SlidersHorizontal
      size={20}
      style={{ margin: "10px" }}
      aria-hidden="true"
    />
  </div>

  {loading ? (
    <div className="loading">
      Loading marketplace...
    </div>
  ) : items.length > 0 ? (
    <div className="listing-grid">
      {items.map((item) => (
        <ListingCard
          key={item.id}
          item={item}
          onCart={addToCart}
        />
      ))}
    </div>
  ) : (
    <div className="panel">
      <h3>No active items found</h3>

      <p className="note">
        Try another search or category, or add the first
        item for your university.
      </p>

      <Link className="primary-btn" href="/sell">
        <PlusCircle size={17} />
        Add the first item
      </Link>
    </div>
  )}
</>

);
    }
