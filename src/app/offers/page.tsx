"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function OffersPage() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" }).then(r => r.json()).then(d => {
      if (d.settings) setEnabled(Boolean(d.settings.marketing));
    }).finally(() => setLoading(false));
  }, []);

  async function toggle() {
    const next = !enabled; setEnabled(next); setSaving(true); setMessage("");
    try {
      const r = await fetch("/api/settings", {
        method: "PUT", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ marketing: next })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setEnabled(!next); setMessage(d.error || "Unable to save."); }
      else setMessage(next ? "Offers and promotions enabled." : "Offers and promotions disabled.");
    } catch { setEnabled(!next); setMessage("Unable to save."); }
    finally { setSaving(false); }
  }

  return <div className="settings-page">
    <div className="market-page-head">
      <div><span className="hero-kicker">CAMPUS MALL</span><h1>Offers & promotions</h1></div>
      <Link href="/" className="secondary-btn">Marketplace</Link>
    </div>
    <section className="settings-group">
      <p>Choose whether you want to receive Campus Mall offers and promotional updates.</p>
      <label className="settings-row settings-toggle">
        <span><strong>Receive offers & promotions</strong></span>
        <input type="checkbox" checked={enabled} onChange={toggle} disabled={loading || saving} />
      </label>
      {message && <div className={message.includes("Unable") ? "error" : "success"} style={{marginTop:10}}>{message}</div>}
    </section>
  </div>;
}
