"use client";

import { useState } from "react";

export default function AdvertisePage() {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("100");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/ads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, budget: Number(budget) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create advertising campaign.");
      setMessage(data.paymentConfigured ? "M-Pesa payment request sent. Your campaign activates after payment confirmation." : "Campaign created, but M-Pesa is not configured yet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create advertising campaign.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="panel">
        <h1>Advertise on Campus Mall</h1>
        <p className="note">Create a paid campaign to promote your business or service.</p>
        <form className="form" onSubmit={submit}>
          <label>Campaign title<input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekend food promotion" /></label>
          <label>Budget (KES)<input required min="100" step="1" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></label>
          {message && <p className="note" role="status">{message}</p>}
          <button className="primary-btn" disabled={loading}>{loading ? "Starting..." : "Create campaign & pay"}</button>
        </form>
      </div>
    </main>
  );
}
