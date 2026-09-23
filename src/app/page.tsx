"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { countries } from "@/data/countries";

const categories = ["All", "Accommodation", "Beauty & dressing", "Electronics", "Food", "Furniture", "Jobs", "Printing & photography", "Services", "Stationery", "Utensils", "Other"];

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    const country = window.localStorage.getItem("campus_mall_guest_country");
    const university = window.localStorage.getItem("campus_mall_guest_university");
    if (country) setGuestCountry(country);
    if (university) setGuestUniversity(university);
    if (!country || !university) setGuestSetup(true);
  }, []);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(data => setUser(data.user ?? null)).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user || !guestSetup) return;
    const controller = new AbortController();
    setGuestLoading(true);
    fetch(`/api/institutions?country=${encodeURIComponent(guestCountry)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setGuestInstitutions(Array.isArray(data.institutions) ? data.institutions : []))
      .catch(error => { if (error?.name !== "AbortError") setGuestInstitutions([]); })
      .finally(() => { if (!controller.signal.aborted) setGuestLoading(false); });
    return () => controller.abort();
  }, [guestCountry, user, guestSetup]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadListings() {
      setLoading(true);
      try {
        const url = new URL("/api/listings", window.location.origin);
        if (q.trim()) url.searchParams.set("q", q.trim());
        if (category && category !== "All") url.searchParams.set("category", category);
        if (!user && guestCountry) url.searchParams.set("country", guestCountry);
        if (!user && guestUniversity) url.searchParams.set("university", guestUniversity);
        const response = await fetch(url.toString(), { signal: controller.signal });
        const data = await response.json();
        setItems(response.ok ? (data.listings || []) : []);
      } catch (error: any) {
        if (error?.name !== "AbortError") setItems([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadListings();
    return () => controller.abort();
  }, [q, category, user, guestCountry, guestUniversity]);

  function saveGuestContext() {
    if (!guestCountry || !guestUniversity) return;
    window.localStorage.setItem("campus_mall_guest_country", guestCountry);
    window.localStorage.setItem("campus_mall_guest_university", guestUniversity);
    setGuestSetup(false);
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
      if (response.status === 401) { window.location.href = "/join"; return; }
      if (!response.ok) { window.alert(data.error || "Unable to add this item."); return; }
      window.alert("Added to trolley.");
    } catch { window.alert("Unable to connect to Campus Mall."); }
  }

  const university = user?.university || guestUniversity || "Your university";

  return (
    <>
      {!user && guestSetup && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="guest-setup-title">
          <div className="modal-card compact-modal">
            <p className="category">CAMPUS MALL</p>
            <h2 id="guest-setup-title">Choose your campus</h2>
            <div className="form">
              <label>Country
                <select value={guestCountry} onChange={e => { setGuestCountry(e.target.value); setGuestUniversity(""); }}>
                  {countries.map(country => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}
                </select>
              </label>
              <label>University / College
                <input type="search" value={guestUniversity} onChange={e => setGuestUniversity(e.target.value)} placeholder={guestLoading ? "Loading..." : "Search institution"} autoComplete="off" disabled={guestLoading} required />
                {guestUniversity.trim() && guestInstitutions.filter(i => i.name.toLowerCase().includes(guestUniversity.trim().toLowerCase())).length > 0 && (
                  <div className="guest-institution-options">
                    {guestInstitutions.filter(i => i.name.toLowerCase().includes(guestUniversity.trim().toLowerCase())).slice(0, 10).map((institution, index) => (
                      <button type="button" key={institution.name + index} onClick={() => setGuestUniversity(institution.name)} className="guest-institution-option">{institution.name}</button>
                    ))}
                  </div>
                )}
              </label>
              <button type="button" className="primary-btn" disabled={!guestUniversity} onClick={saveGuestContext}>Continue</button>
              <Link className="secondary-btn" href="/join">Create account</Link>
            </div>
          </div>
        </div>
      )}

      <section className="market-hero" aria-label={university}>
        <div className="market-university-cover" aria-hidden="true">
          <span>{university}</span>
        </div>
      </section>

      <div className="category-strip" aria-label="Marketplace categories">
        {categories.map(name => (
          <button key={name} type="button" className={category === (name === "All" ? "" : name) ? "category-chip active" : "category-chip"} onClick={() => setCategory(name === "All" ? "" : name)}>
            {name}
          </button>
        ))}
      </div>

      <div className="market-section-head">
        <h2>{category && category !== "All" ? category : "Recommended"}</h2>
        <Link href="/listings">View all</Link>
      </div>

      {loading ? (
        <div className="compact-loading">Loading...</div>
      ) : items.length > 0 ? (
        <div className="listing-grid">
          {items.map(item => <ListingCard key={item.id} item={item} onCart={addToCart} />)}
        </div>
      ) : (
        <div className="compact-empty">
          <strong>No items yet</strong>
          <Link href="/sell">Sell the first item</Link>
        </div>
      )}
    </>
  );
}
