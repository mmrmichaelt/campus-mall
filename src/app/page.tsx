"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import MarketplaceFilter from "@/components/MarketplaceFilter";
import { countries } from "@/data/countries";

const categories = ["All", "Accommodation", "Beauty & dressing", "Electronics", "Food", "Furniture", "Jobs", "Printing & photography", "Services", "Stationery", "Utensils", "Other"];

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);
  const [guestContextResolved, setGuestContextResolved] = useState(false);
  const [guestCountry, setGuestCountry] = useState("KE");
  const [guestUniversity, setGuestUniversity] = useState("");
  const [guestInstitutions, setGuestInstitutions] = useState<{ name: string }[]>([]);
  const [guestSetup, setGuestSetup] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQ(params.get("q") || "");

    try {
      const country = window.localStorage.getItem("campus_mall_guest_country");
      const university = window.localStorage.getItem("campus_mall_guest_university");

      if (country) setGuestCountry(country);
      if (university) setGuestUniversity(university);
      if (!country || !university) setGuestSetup(true);
    } finally {
      setGuestContextResolved(true);
    }
  }, []);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then(r => r.json())
      .then(data => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthResolved(true));
  }, []);

  useEffect(() => {
    if (user || !guestSetup) return;
    const controller = new AbortController();
    setGuestLoading(true);
    fetch(`/api/institutions?country=${encodeURIComponent(guestCountry)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(r => r.json())
      .then(data => setGuestInstitutions(Array.isArray(data.institutions) ? data.institutions : []))
      .catch(error => { if (error?.name !== "AbortError") setGuestInstitutions([]); })
      .finally(() => { if (!controller.signal.aborted) setGuestLoading(false); });
    return () => controller.abort();
  }, [guestCountry, user, guestSetup]);

  useEffect(() => {
    if (!authResolved || !guestContextResolved || (!user && guestSetup)) return;

    const controller = new AbortController();

    async function loadListings() {
      setLoading(true);

      try {
        const url = new URL("/api/listings", window.location.origin);

        if (q.trim()) url.searchParams.set("q", q.trim());
        if (category && category !== "All") {
          url.searchParams.set("category", category);
        }

        const selectedUniversity = user?.university?.trim() || guestUniversity.trim();

        if (selectedUniversity) {
          url.searchParams.set("university", selectedUniversity);
        }

        // Load the marketplace itself, not a recommended/restricted subset.
        // The homepage shows every active item matching the confirmed campus.
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
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadListings();

    return () => controller.abort();
  }, [
    authResolved,
    guestContextResolved,
    guestSetup,
    q,
    category,
    user,
    guestUniversity,
  ]);

  function saveGuestContext() {
    const country = guestCountry.trim();
    const university = guestUniversity.trim();

    if (!country || !university) return;

    window.localStorage.setItem("campus_mall_guest_country", country);
    window.localStorage.setItem("campus_mall_guest_university", university);

    setGuestCountry(country);
    setGuestUniversity(university);
    setGuestSetup(false);

    window.location.href = "/";
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
      {!user && guestSetup && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="guest-setup-title">
          <div className="modal-card compact-modal">
            <p className="category">CAMPUS MALL</p>
            <h2 id="guest-setup-title">Choose your campus</h2>

            <div className="form">
              <label>
                Country
                <select
                  value={guestCountry}
                  onChange={e => {
                    setGuestCountry(e.target.value);
                    setGuestUniversity("");
                  }}
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                University / College
                <input
                  type="search"
                  value={guestUniversity}
                  onChange={e => setGuestUniversity(e.target.value)}
                  placeholder={guestLoading ? "Loading..." : "Search institution"}
                  autoComplete="off"
                  disabled={guestLoading}
                  required
                />

                {guestUniversity.trim() &&
                  guestInstitutions
                    .filter(i => i.name.toLowerCase().includes(guestUniversity.trim().toLowerCase()))
                    .length > 0 && (
                    <div className="guest-institution-options">
                      {guestInstitutions
                        .filter(i => i.name.toLowerCase().includes(guestUniversity.trim().toLowerCase()))
                        .slice(0, 10)
                        .map((institution, index) => (
                          <button
                            type="button"
                            key={institution.name + index}
                            onClick={() => setGuestUniversity(institution.name)}
                            className="guest-institution-option"
                          >
                            {institution.name}
                          </button>
                        ))}
                    </div>
                  )}
              </label>

              <button
                type="button"
                className="primary-btn"
                disabled={!guestUniversity.trim()}
                onClick={saveGuestContext}
              >
                Continue
              </button>

              <Link className="secondary-btn" href="/join">
                Create account
              </Link>
            </div>
          </div>
        </div>
      )}

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
        <Link href="/listings">View all</Link>
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
