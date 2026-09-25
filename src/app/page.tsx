"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import MarketplaceFilter from "@/components/MarketplaceFilter";

const categories = ["All", "Accommodation", "Beauty & dressing", "Electronics", "Food", "Furniture", "Jobs", "Printing & photography", "Services", "Stationery", "Utensils", "Other"];

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [enteredMarketplace, setEnteredMarketplace] = useState(false);
  const [entryLoading, setEntryLoading] = useState(false);
  const [institutionOnly, setInstitutionOnly] = useState(false);

  useEffect(() => {
    try {
      setInstitutionOnly(localStorage.getItem("campus_mall_institution_filter") === "1");
      setEnteredMarketplace(sessionStorage.getItem("campus_mall_marketplace_started") === "1");
    } catch {}
    fetch("/api/me", { cache: "no-store" })
      .then(r => r.json())
      .then(data => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthResolved(true));
  }, []);

  useEffect(() => {
    if (!authResolved || !enteredMarketplace) return;

    const controller = new AbortController();

    async function loadListings() {
      setLoading(true);

      try {
        const url = new URL("/api/listings", window.location.origin);

        if (q.trim()) url.searchParams.set("q", q.trim());
        if (category && category !== "All") {
          url.searchParams.set("category", category);
        }

        // Home starts with every institution. The circular switch is the
        // only control that turns the profile institution into a filter.
        if (institutionOnly && user?.university?.trim()) {
          url.searchParams.set("institution", user.university.trim());
        }
        url.searchParams.set("limit", "60");
        url.searchParams.set("sort", "newest");

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = await response.json().catch(() => ({}));
        const listings =
          response.ok && Array.isArray(data.listings)
            ? data.listings
            : [];

        setItems(listings);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setEntryLoading(false);
        }
      }
    }

    loadListings();

    function syncInstitutionFilter(event: Event) {
      const custom = event as CustomEvent<{ active?: boolean }>;
      setInstitutionOnly(Boolean(custom.detail?.active));
    }
    window.addEventListener("campus-mall-institution-filter-change", syncInstitutionFilter);
    return () => {
      controller.abort();
      window.removeEventListener("campus-mall-institution-filter-change", syncInstitutionFilter);
    };
  }, [
    authResolved,
    enteredMarketplace,
    q,
    category,
    institutionOnly,
    user?.university,
  ]);

  function startMarketplace() {
    try {
      sessionStorage.setItem("campus_mall_marketplace_started", "1");
    } catch {}
    setEntryLoading(true);
    setEnteredMarketplace(true);
  }

  async function addToCart(listingId: string) {
    if (!user) { window.location.href = "/join"; return; }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity: 1 }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.href = "/join";
        return;
      }

      if (!response.ok) {
        window.alert(data.error || "Unable to add this item.");
        return;
      }

      window.alert("Added to trolley.");
    } catch {
      window.alert("Unable to connect to Campus Mall.");
    }
  }

  return (
    <>
      {!enteredMarketplace || entryLoading ? (
        <div className="marketplace-start-overlay" role="dialog" aria-label="Start Campus Mall">
          <div className="marketplace-start-card">
            <div className="brand-mark" aria-hidden="true">CM</div>
            <h1>Campus Mall</h1>
            <p>{entryLoading ? "Loading the marketplace..." : "Your campus marketplace is ready."}</p>
            {!entryLoading && (
              <button
                type="button"
                className="primary-btn marketplace-start-button"
                onClick={startMarketplace}
              >
                START
              </button>
            )}
            {entryLoading && <div className="compact-loading" aria-live="polite">Loading...</div>}
          </div>
        </div>
      ) : null}

      <div className="category-filter-row">
        <div className="category-strip" aria-label="Marketplace categories">
          {categories.map(name => (
            <button
              key={name}
              type="button"
              className={category === (name === "All" ? "" : name) ? "category-chip active" : "category-chip"}
              onClick={() => setCategory(name === "All" ? "" : name)}
            >
              {name}
            </button>
          ))}
        </div>

        <MarketplaceFilter />
      </div>

      <div className="market-section-head">
        <h2>All items</h2>
      </div>

      {loading ? (
        <div className="compact-loading">Loading...</div>
      ) : items.length > 0 ? (
        <div className="listing-grid">
          {items.map(item => (
            <ListingCard key={item.id} item={item} onCart={addToCart} />
          ))}
        </div>
      ) : (
        <div className="compact-empty">
          <strong>No items yet</strong>
        </div>
      )}
    </>
  );
}
