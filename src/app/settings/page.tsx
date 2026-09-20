"use client";

import { useState } from "react";
import Link from "next/link";

export default function Settings() {
  const [uni, setUni] = useState("");
  const [msg, setMsg] = useState("");

  async function change() {
    setMsg("");

    try {
      const response = await fetch("/api/university", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university: uni }),
      });

      setMsg(
        response.ok
          ? "University switched. The marketplace will now show the selected university."
          : "Log in first."
      );
    } catch {
      setMsg("Unable to switch university.");
    }
  }

  return (
    <>
      <h1>Settings</h1>

      <div className="two-col">
        <section className="panel">
          <h2>Account</h2>
          <p>Manage your account, verification, profile and Campus Mall Pro.</p>

          <div className="hero-actions">
            <Link className="primary-btn" href="/profile">Profile</Link>
            <Link className="secondary-btn" href="/verify">Verification</Link>
            <Link className="secondary-btn" href="/account/pro">Campus Mall Pro</Link>
          </div>
        </section>

        <section className="panel">
          <h2>Change university</h2>
          <input
            style={{ width: "100%", padding: 11, border: "1px solid #ddd", borderRadius: 10 }}
            value={uni}
            onChange={(event) => setUni(event.target.value)}
            placeholder="Enter university / college"
          />
          <button className="primary-btn" style={{ marginTop: 10 }} onClick={change}>
            Switch university
          </button>
          {msg && <p className="success">{msg}</p>}
        </section>
      </div>

      <div className="panel">
        <h2>Help & legal</h2>
        <div className="hero-actions">
          <a className="secondary-btn" href="mailto:campusmall.support@gmail.com?subject=Campus%20Mall%20feedback">Feedback</a>
          <a className="secondary-btn" href="mailto:campusmall.support@gmail.com?subject=Campus%20Mall%20help">Help & support</a>
          <Link className="secondary-btn" href="/about">About Campus Mall</Link>
          <Link className="secondary-btn" href="/faq">FAQ</Link>
          <Link className="secondary-btn" href="/terms">Terms of service</Link>
        </div>
        <p>Support: <a href="mailto:campusmall.support@gmail.com">campusmall.support@gmail.com</a></p>
      </div>
    </>
  );
}
