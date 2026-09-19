"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Subscription = {
  id: string;
  plan: "MONTHLY" | "YEARLY";
  status: string;
  expiresAt: string | null;
};

export default function AccountProPage() {
  const [isPro, setIsPro] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  async function loadStatus() {
    const response = await fetch("/api/pro/status", { cache: "no-store" });
    const data = await response.json();
    setIsPro(Boolean(data.isPro));
    setSubscription(data.subscription ?? null);
    setLoading(false);
  }

  useEffect(() => {
    loadStatus().catch(() => setLoading(false));
  }, []);

  async function cancelSubscription() {
    if (!window.confirm("Cancel your Campus Mall Pro subscription?")) return;
    setCancelling(true);
    try {
      const response = await fetch("/api/pro/cancel", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        window.alert(data.error || "Unable to cancel subscription.");
        return;
      }
      await loadStatus();
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <main className="mx-auto max-w-3xl px-4 py-10">Loading Pro status...</main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Campus Mall Pro</h1>
        {isPro && subscription ? (
          <div className="mt-6">
            <div className="rounded-xl bg-green-50 p-5">
              <p className="font-semibold text-green-800">Pro is active</p>
              <p className="mt-2 text-sm text-green-700">Plan: {subscription.plan === "YEARLY" ? "Yearly" : "Monthly"}</p>
              {subscription.expiresAt && <p className="mt-1 text-sm text-green-700">Expires: {new Date(subscription.expiresAt).toLocaleDateString()}</p>}
            </div>
            <button onClick={cancelSubscription} disabled={cancelling} className="mt-6 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 disabled:opacity-50">
              {cancelling ? "Cancelling..." : "Cancel subscription"}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-gray-600">Choose a Pro plan to unlock your Campus Mall Pro account.</p>
            <Link href="/pro" className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-3 font-semibold text-white">View Pro plans</Link>
          </div>
        )}
      </div>
    </main>
  );
}
