"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Membership = {
  id: string;
  country: string;
  institution: string;
  type: "POSTING" | "VISITING";
};

export default function InstitutionMemberships() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [limit, setLimit] = useState(2);
  const [country, setCountry] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState<"POSTING" | "VISITING">("POSTING");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/institution-memberships", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setMemberships(data.memberships || []);
        setLimit(data.limit || 2);
      } else {
        setMessage(data.error || "Please log in to manage institution memberships.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function addMembership(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch("/api/institution-memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, institution, type }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error || "Unable to add institution.");
        return;
      }
      setCountry("");
      setInstitution("");
      setType("POSTING");
      await load();
      setMessage("Institution membership saved.");
    } catch {
      setMessage("Unable to add institution.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMembership(id: string) {
    setMessage("");
    const response = await fetch("/api/institution-memberships", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "Unable to remove membership.");
      return;
    }
    await load();
  }

  return (
    <section className="panel" style={{ marginTop: 20 }}>
      <p className="category">MULTI-INSTITUTION MEMBERSHIP</p>
      <h2>Post or visit more campuses</h2>
      <p className="note">
        Your membership is tied to your account. Standard accounts can belong to up to 2 institutions.
        Campus Mall Pro unlocks additional institution memberships.
      </p>

      <div className="success" style={{ margin: "12px 0" }}>
        {memberships.length} of {limit} institution slots used
      </div>

      {loading ? (
        <p className="note">Loading institution memberships...</p>
      ) : (
        <>
          {memberships.length > 0 && (
            <div className="settings-links" style={{ marginBottom: 18 }}>
              {memberships.map((membership) => (
                <div
                  key={membership.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span>
                    <strong>{membership.institution}</strong>
                    <small className="note" style={{ display: "block", marginTop: 3 }}>
                      {membership.country} · {membership.type === "POSTING" ? "Posting member" : "Visiting member"}
                    </small>
                  </span>
                  <button className="secondary-btn" onClick={() => void removeMembership(membership.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={addMembership} className="settings-links">
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="Country, e.g. Kenya"
              required
              style={{ width: "100%", padding: 11, border: "1px solid var(--line)", borderRadius: 10 }}
            />
            <input
              value={institution}
              onChange={(event) => setInstitution(event.target.value)}
              placeholder="University / college"
              required
              style={{ width: "100%", padding: 11, border: "1px solid var(--line)", borderRadius: 10 }}
            />
            <select
              value={type}
              onChange={(event) => setType(event.target.value as "POSTING" | "VISITING")}
              style={{ width: "100%", padding: 11, border: "1px solid var(--line)", borderRadius: 10 }}
            >
              <option value="POSTING">Posting — I can post listings at this institution</option>
              <option value="VISITING">Visiting — I am a member/visitor of this institution</option>
            </select>
            <button className="primary-btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add institution"}
            </button>
          </form>

          {memberships.length >= limit && limit === 2 && (
            <div style={{ marginTop: 16 }}>
              <Link href="/pro" className="primary-btn">Get Campus Mall Pro for more institutions</Link>
            </div>
          )}
        </>
      )}

      {message && (
        <p className={message.includes("saved") ? "success" : "error"} style={{ marginTop: 14 }}>
          {message}
        </p>
      )}
    </section>
  );
}
