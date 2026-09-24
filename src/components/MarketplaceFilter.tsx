"use client";

import { FormEvent, useEffect, useState } from "react";
import { countries } from "@/data/countries";

const categories = [
  "Accommodation",
  "Beauty & dressing",
  "Electronics",
  "Food",
  "Furniture",
  "Jobs",
  "Printing & photography",
  "Services",
  "Stationery",
  "Utensils",
  "Other",
];

export default function MarketplaceFilter() {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [institutions, setInstitutions] = useState<{ name: string }[]>([]);
  const [institutionLoading, setInstitutionLoading] = useState(false);

  useEffect(() => {
    if (!open) { setInstitutions([]); return; }
    const controller = new AbortController();
    setInstitutionLoading(true);
    fetch(country ? `/api/institutions?country=${encodeURIComponent(country)}` : "/api/institutions", { signal: controller.signal, cache: "no-store" })
      .then(r => r.json())
      .then(data => setInstitutions(Array.isArray(data.institutions) ? data.institutions : []))
      .catch(error => { if (error?.name !== "AbortError") setInstitutions([]); })
      .finally(() => { if (!controller.signal.aborted) setInstitutionLoading(false); });
    return () => controller.abort();
  }, [open, country]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of form.entries()) {
      const v = String(value).trim();
      if (v) params.set(key, v);
    }

    window.location.href = `/listings?${params.toString()}`;
  }

  return (
    <div className="marketplace-filter">
      <button
        type="button"
        className="filter-button"
        aria-expanded={open}
        aria-controls="marketplace-filter-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          className="camera-filter-icon"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="9" cy="6" r="2" fill="currentColor"/>
          <circle cx="15" cy="12" r="2" fill="currentColor"/>
          <circle cx="10" cy="18" r="2" fill="currentColor"/>
        </svg>
      </button>

      {open && (
        <div id="marketplace-filter-panel" className="marketplace-filter-panel">
          <div className="filter-panel-header">
            <strong>Marketplace filters</strong>
            <button type="button" className="filter-close" onClick={() => setOpen(false)} aria-label="Close filters">×</button>
          </div>

          <form onSubmit={submit}>
            <label>
              Country
              <select name="country" value={country} onChange={e => setCountry(e.target.value)}>
                <option value="">All countries</option>
                {countries.map(item => <option key={item.code} value={item.code}>{item.flag} {item.name}</option>)}
              </select>
            </label>

            <label>
              Institution
              <select name="institution" defaultValue="" disabled={institutionLoading}>
                <option value="">{institutionLoading ? "Loading institutions..." : "All institutions"}</option>
                {institutions.map((item, index) => <option key={item.name + index} value={item.name}>{item.name}</option>)}
              </select>
            </label>

            <label>
              Category
              <select name="category" defaultValue="">
                <option value="">All categories</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>

            <div className="filter-row">
              <label>
                Minimum price
                <input name="minPrice" type="number" min="0" step="0.01" placeholder="KES 0" />
              </label>
              <label>
                Maximum price
                <input name="maxPrice" type="number" min="0" step="0.01" placeholder="No limit" />
              </label>
            </div>

            <label>
              Sort by
              <select name="sort" defaultValue="newest">
                <option value="newest">Newest added</option>
                <option value="oldest">Oldest added</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="title-az">Alphabetical: A to Z</option>
                <option value="title-za">Alphabetical: Z to A</option>
              </select>
            </label>

            <label>
              Location
              <input name="location" type="search" placeholder="County, town or campus" />
            </label>

            <label>
              Seller type
              <select name="sellerType" defaultValue="">
                <option value="">All sellers</option>
                <option value="STUDENT">Students</option>
                <option value="OUTSIDER">Outsiders</option>
              </select>
            </label>

            <div className="filter-actions">
              <a href="/listings" className="secondary-btn" onClick={() => setOpen(false)}>Clear all</a>
              <button type="submit" className="primary-btn">Apply filters</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
