"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  price: string | number;
  currency: string;
  status: string;
  createdAt: string;
  seller: { id: string; name: string; email: string | null };
};

type Dashboard = {
  stats: { users: number; listings: number; activeListings: number; orders: number; revenue: number };
  recentListings: Listing[];
};

export default function AdminPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(json.error || "You do not have admin access.");
      return;
    }
    setData(json);
  }

  useEffect(() => { void load(); }, []);

  async function updateListing(id: string, status: "ACTIVE" | "SOLD" | "EXPIRED") {
    setBusy(id);
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Unable to update listing.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update listing.");
    } finally {
      setBusy("");
    }
  }

  async function deleteListing(id: string) {
    if (!window.confirm("Delete this listing permanently?")) return;
    setBusy(id);
    try {
      const response = await fetch("/api/admin/dashboard", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Unable to delete listing.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete listing.");
    } finally {
      setBusy("");
    }
  }

  if (error && !data) {
    return <div className="panel"><h1>Admin</h1><p className="error">{error}</p><Link href="/" className="secondary-btn">Back to marketplace</Link></div>;
  }

  if (!data) return <div className="panel"><h1>Admin dashboard</h1><p className="note">Loading dashboard...</p></div>;

  return (
    <div>
      <div className="section-title">
        <div><p className="category">CAMPUS MALL ADMIN</p><h1>Administration</h1><p className="note">Monitor the marketplace and moderate listings from one place.</p></div>
        <Link href="/" className="secondary-btn">Marketplace</Link>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="listing-grid" style={{ marginBottom: 20 }}>
        {[
          ["Users", data.stats.users],
          ["All listings", data.stats.listings],
          ["Active listings", data.stats.activeListings],
          ["Orders", data.stats.orders],
          ["Settled revenue", `KES ${data.stats.revenue.toLocaleString()}`],
        ].map(([label, value]) => (
          <section className="panel" key={String(label)}>
            <p className="category">{label}</p><h2>{value}</h2>
          </section>
        ))}
      </div>

      <section className="panel">
        <p className="category">MODERATION</p>
        <h2>Recent listings</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {data.recentListings.map((listing) => (
            <div key={listing.id} className="panel" style={{ padding: 14 }}>
              <strong>{listing.title}</strong>
              <p className="note">{listing.currency} {Number(listing.price).toLocaleString()} · {listing.status} · Seller: {listing.seller.name}</p>
              <div className="hero-actions">
                <Link href={`/listings/${listing.id}`} className="secondary-btn">View</Link>
                {listing.status !== "ACTIVE" && <button className="secondary-btn" disabled={busy === listing.id} onClick={() => updateListing(listing.id, "ACTIVE")}>Activate</button>}
                {listing.status === "ACTIVE" && <button className="secondary-btn" disabled={busy === listing.id} onClick={() => updateListing(listing.id, "EXPIRED")}>Hide listing</button>}
                <button className="danger-btn" disabled={busy === listing.id} onClick={() => deleteListing(listing.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
