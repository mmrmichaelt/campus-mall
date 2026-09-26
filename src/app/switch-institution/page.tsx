"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SwitchInstitutionPage() {
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(d => {
        if (d.user?.university) {
          setUniversity(d.user.university);
          setIsGuest(false);
          return;
        }
        try {
          const guestInstitution =
            localStorage.getItem("campus_mall_active_institution")?.trim() ||
            localStorage.getItem("campus_mall_guest_university")?.trim() ||
            localStorage.getItem("campus_mall_guest_institution")?.trim() ||
            "";
          setUniversity(guestInstitution);
          setIsGuest(Boolean(guestInstitution));
        } catch {}
      })
      .catch(() => {
        try {
          const guestInstitution =
            localStorage.getItem("campus_mall_active_institution")?.trim() ||
            localStorage.getItem("campus_mall_guest_university")?.trim() ||
            localStorage.getItem("campus_mall_guest_institution")?.trim() ||
            "";
          setUniversity(guestInstitution);
          setIsGuest(Boolean(guestInstitution));
        } catch {}
      });
  }, []);

  async function save() {
    if (!university.trim()) { setMessage("Enter your institution."); return; }
    setSaving(true); setMessage("");
    try {
      const selected = university.trim();

      if (isGuest) {
        localStorage.setItem("campus_mall_guest_university", selected);
        localStorage.setItem("campus_mall_guest_institution", selected);
        localStorage.setItem("campus_mall_active_institution", selected);
        localStorage.setItem("campus_mall_institution_filter", "1");
        window.dispatchEvent(new CustomEvent("campus-mall-institution-filter-change", {
          detail: {
            active: true,
            previousActive: true,
            institution: selected,
            source: "guest",
            scrollY: 0,
          },
        }));
        setMessage("Guest institution switched.");
        return;
      }

      const r = await fetch("/api/university", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university: selected })
      });
      const d = await r.json().catch(() => ({}));
      setMessage(r.ok ? "Institution switched." : (d.error || "Unable to switch institution."));
    } catch {
      setMessage("Unable to switch institution.");
    } finally { setSaving(false); }
  }

  return <div className="settings-page">
    <div className="market-page-head">
      <div><span className="hero-kicker">CAMPUS MALL</span><h1>Switch institution</h1></div>
      <Link href="/" className="secondary-btn">Marketplace</Link>
    </div>
    <section className="settings-group">
      <p>Choose the institution you want to use as your current marketplace.</p>
      <input className="settings-input" value={university} onChange={e => setUniversity(e.target.value)} placeholder="University or college" />
      <button className="primary-btn" type="button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Switch institution"}</button>
      {message && <div className={message.endsWith(".") && message.includes("Unable") ? "error" : "success"} style={{marginTop:10}}>{message}</div>}
    </section>
  </div>;
}
