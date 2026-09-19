"use client";

import { useState } from "react";

export default function BusinessPage() {
  const [plan, setPlan] = useState("BUSINESS");
  const [amount, setAmount] = useState("999");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/business/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, amount: Number(amount) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start business subscription.");
      setMessage(data.paymentConfigured ? "M-Pesa payment request sent. Your business subscription activates after confirmation." : "Business subscription created, but M-Pesa is not configured yet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start business subscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="panel">
        <h1>Campus Mall Business</h1>
        <p className="note">Create a paid business account subscription for organizations selling to the campus community.</p>
        <form className="form" onSubmit={submit}>
          <label>Plan<input required value={plan} onChange={(e) => setPlan(e.target.value)} /></label>
          <label>Monthly amount (KES)<input required min="1" step="1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
          {message && <p className="note" role="status">{message}</p>}
          <button className="primary-btn" disabled={loading}>{loading ? "Starting..." : "Subscribe & pay"}</button>
        </form>
      </div>
    </main>
  );
}
