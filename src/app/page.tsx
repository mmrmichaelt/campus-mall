"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [institutionOnly, setInstitutionOnly] = useState(false);
  const [guestInstitution, setGuestInstitution] = useState("");
  const [guestRedirecting, setGuestRedirecting] = useState(false);
  const router = useRouter();
  const restoreScrollRef = useRef<number | null>(null);
  const listingsCacheRef = useRef<Record<string, any[]>>({});

  useEffect(() => {
    try {
      setInstitutionOnly(localStorage.getItem("campus_mall_institution_filter") === "1");
      setGuestInstitution(
        localStorage.getItem("campus_mall_active_institution")?.trim() ||
        localStorage.getItem("campus_mall_guest_university")?.trim() ||
        localStorage.getItem("campus_mall_guest_institution")?.trim() ||
        ""
      );
    } catch {}
    fetch("/api/me", { cache: "no-store" })
      .then(r => r.json())
      .then(data => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthResolved(true));
  }, []);

  useEffect(() => {
    if (!authResolved) return;
    if (!user) {
      try {
        const guestInstitution =
          localStorage.getItem("campus_mall_active_institution")?.trim() ||
          localStorage.getItem("campus_mall_guest_university")?.trim() ||
          localStorage.getItem("campus_mall_guest_institution")?.trim() ||
          "";
        if (!guestInstitution) {
          setGuestRedirecting(true);
          router.replace("/guest");
          return;
        }
      } catch {
        setGuestRedirecting(true);
        router.replace("/guest");
        return;
      }
    }

    setGuestRedirecting(false);
    const controller = new AbortController();
    const selectedInstitution = user?.university?.trim() || guestInstitution;
    const stateKey = JSON.stringify({
      q: q.trim(),
      category: category || "",
      institutionOnly,
      institution: selectedInstitution,
    });

    try {
      const cached = sessionStorage.getItem("campus_mall_home_cache_" + btoa(unescape(encodeURIComponent(stateKey))));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.items)) {
          listingsCacheRef.current[stateKey] = parsed.items;
          setItems(parsed.items);
          setLoading(false);
        }
      }
      const savedScroll = sessionStorage.getItem("campus_mall_home_scroll_" + btoa(unescape(encodeURIComponent(stateKey))));
      if (savedScroll) restoreScrollRef.current = Number(savedScroll);
    } catch {}

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
        if (institutionOnly && selectedInstitution) {
          url.searchParams.set("institution", selectedInstitution);
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
        listingsCacheRef.current[stateKey] = listings;
        try {
          const encodedKey = btoa(unescape(encodeURIComponent(stateKey)));
          sessionStorage.setItem("campus_mall_home_cache_" + encodedKey, JSON.stringify({ items: listings }));
        } catch {}
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          if (restoreScrollRef.current !== null) {
            const y = restoreScrollRef.current;
            restoreScrollRef.current = null;
            requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
          }
        }
      }
    }

    loadListings();

    function syncInstitutionFilter(event: Event) {
      const custom = event as CustomEvent<{ active?: boolean; previousActive?: boolean; scrollY?: number; institution?: string; source?: string }>;
      const eventInstitution = custom.detail?.institution || selectedInstitution;
      const previousKey = JSON.stringify({
        q: q.trim(),
        category: category || "",
        institutionOnly: Boolean(custom.detail?.previousActive),
        institution: eventInstitution,
      });
      try {
        const encodedKey = btoa(unescape(encodeURIComponent(previousKey)));
        sessionStorage.setItem("campus_mall_home_scroll_" + encodedKey, String(custom.detail?.scrollY ?? window.scrollY));
      } catch {}
      if (custom.detail?.source === "guest" && custom.detail?.institution) {
        setGuestInstitution(custom.detail.institution);
      }
      setInstitutionOnly(Boolean(custom.detail?.active));
    }
    window.addEventListener("campus-mall-institution-filter-change", syncInstitutionFilter);
    return () => {
      controller.abort();
      window.removeEventListener("campus-mall-institution-filter-change", syncInstitutionFilter);
    };
  }, [
    authResolved,
    q,
    category,
    institutionOnly,
    user?.university,
    guestInstitution,
    router,
  ]);

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

  if (!authResolved || guestRedirecting) {
    return <div className="compact-loading" style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>Loading Campus Mall...</div>;
  }

  return (
    <>
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
