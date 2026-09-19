"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
PlusCircle,
SlidersHorizontal,
MapPin,
} from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { countries } from "@/data/countries";

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
const [guestCountry, setGuestCountry] = useState("KE");
const [guestUniversity, setGuestUniversity] = useState("");
const [guestInstitutions, setGuestInstitutions] = useState<{ name: string }[]>([]);
const [guestSetup, setGuestSetup] = useState(false);
const [guestLoading, setGuestLoading] = useState(false);

const [q, setQ] = useState("");
const [category, setCategory] = useState("");

useEffect(() => {
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";

setQ(initialQuery);
const savedCountry = window.localStorage.getItem("campus_mall_guest_country");
const savedUniversity = window.localStorage.getItem("campus_mall_guest_university");
if (savedCountry) setGuestCountry(savedCountry);
if (savedUniversity) setGuestUniversity(savedUniversity);
if (!savedCountry || !savedUniversity) setGuestSetup(true);
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
if (user || !guestUniversity) return;
const controller = new AbortController();
setGuestLoading(true);
fetch(`/api/institutions?country=${encodeURIComponent(guestCountry)}`)
.then((response) => response.json())
.then((data) => setGuestInstitutions(Array.isArray(data.institutions) ? data.institutions : []))
.catch(() => setGuestInstitutions([]))
.finally(() => setGuestLoading(false));
return () => controller.abort();
}, [guestCountry, user, guestUniversity]);

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

    if (!user && guestCountry) {
      url.searchParams.set("country", guestCountry);
    }

    if (!user && guestUniversity) {
      url.searchParams.set("university", guestUniversity);
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

}, [q, category, user, guestCountry, guestUniversity]);

function saveGuestContext() {
  if (!guestCountry || !guestUniversity) return;
  window.localStorage.setItem("campus_mall_guest_country", guestCountry);
  window.localStorage.setItem("campus_mall_guest_university", guestUniversity);
  setGuestSetup(false);
}

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
{!user && guestSetup && (
  <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="guest-setup-title">
    <div className="modal-card">
      <p className="category">CAMPUS MALL GUEST</p>
      <h2 id="guest-setup-title">Choose your country and university</h2>
      <p className="note">Browse without an account. Create an account only when you want to like, comment, share, chat, order, save items, add items or sell.</p>
      <div className="form">
        <label>Country
          <select value={guestCountry} onChange={(e) => { setGuestCountry(e.target.value); setGuestUniversity(""); }}>
            {countries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}
          </select>
        </label>
        <label>University / College
          <select value={guestUniversity} onChange={(e) => setGuestUniversity(e.target.value)} disabled={guestLoading}>
            <option value="">{guestLoading ? "Loading institutions..." : "Choose your institution"}</option>
            {guestInstitutions.map((institution, index) => <option key={institution.name + index} value={institution.name}>{institution.name}</option>)}
          </select>
        </label>
        <button type="button" className="primary-btn" disabled={!guestUniversity} onClick={saveGuestContext}>Continue as guest</button>
        <Link className="secondary-btn" href="/join" onClick={() => { if (guestCountry && guestUniversity) { window.localStorage.setItem("campus_mall_guest_country", guestCountry); window.localStorage.setItem("campus_mall_guest_university", guestUniversity); } }}>Create account</Link>
      </div>
    </div>
  </div>
)}
<section className="hero">
<h1>Campus Mall</h1>

    <p>
      Your campus marketplace for students and
      outsiders. See items posted around{" "}
      <b>
        {user?.university || guestUniversity || "your selected university"}
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

    {!user && guestUniversity && (
      <span className="note">
        <MapPin size={14} />
        Browsing as guest • {guestUniversity}
      </span>
    )}

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
