"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  SlidersHorizontal,
  MapPin,
  Search,
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

type User = {
  id: string;
  name: string;
  country: string;
  university: string;
  accountType: string;
  phone: string;
  email: string;
  emailVerified: boolean;
  phoneVerified: boolean;
};

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number | string;
  currency: string;
  category: string;
  imageUrl?: string | null;
  location: string;
  status: string;
  promoted: boolean;
  promotedUntil?: string | null;
  createdAt: string;
  seller?: {
    id: string;
    name: string;
    university: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
};

export default function Home() {
  const [items, setItems] = useState<Listing[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/me", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data?.user ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      setError("");

      try {
        const url = new URL("/api/listings", window.location.origin);

        if (q.trim()) {
          url.searchParams.set("q", q.trim());
        }

        if (category) {
          url.searchParams.set("category", category);
        }

        const response = await fetch(url.toString(), {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Unable to load marketplace.");
        }

        if (!cancelled) {
          setItems(data?.listings ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load marketplace."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      cancelled = true;
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

      const data = await response.json();

      if (!response.ok) {
        alert(data?.error || "Unable to add item to trolley.");
        return;
      }

      alert("Added to trolley.");
    } catch {
      alert("Unable to add item to trolley.");
    }
  }

  return (
    <>
      <section className="hero">
        <h1>Campus Mall</h1>

        <p>
          Your campus marketplace for students and outsiders. Discover items,
          food, jobs and services around{" "}
          <b>{user?.university || "your selected university"}</b>.
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
        <div>
          <h2>Marketplace</h2>

          {user?.university && (
            <span className="note">
              <MapPin size={14} />
              Showing listings for {user.university}
            </span>
          )}
        </div>
      </div>

      <div className="filterbar">
        <div
          style={{
            display: "flex",
            alignItems: "center",
           
