"use client";

import { useState } from "react";

export default function Settings() {
  const [uni, setUni] = useState("");
  const [msg, setMsg] = useState("");

  async function change() {
    setMsg("");

    try {
      const response = await fetch("/api/university", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          university: uni,
        }),
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

          <p>
            Manage your account, notification preferences and
            Campus Mall Pro.
          </p>

          <p className="note">
            Your Campus Mall account controls your university,
            listings and marketplace experience.
          </p>

          <p>
            <a className="primary-btn" href="/account/pro">
              Campus Mall Pro
            </a>
          </p>
        </section>

        <section className="panel">
          <h2>Change university</h2>

          <input
            style={{
              width: "100%",
              padding: 11,
              border: "1px solid #ddd",
              borderRadius: 10,
            }}
            value={uni}
            onChange={(event) => setUni(event.target.value)}
            placeholder="Enter university / college"
          />

          <button
            className="primary-btn"
            style={{
              marginTop: 10,
            }}
            onClick={change}
          >
            Switch university
          </button>

          {msg && <p className="success">{msg}</p>}
        </section>
      </div>

      <div className="panel">
        <h2>Campus Mall revenue services</h2>
        <p className="note">The platform is structured to support these revenue channels:</p>
        <ul>
          <li>Data & airtime commissions</li>
          <li>Pro subscriptions</li>
          <li>Seller listing/promotional fees</li>
          <li>Featured products</li>
          <li>Advertising</li>
          <li>Transaction/service fees</li>
          <li>Business accounts</li>
          <li>Affiliate/partner revenue</li>
        </ul>
      </div>

      <div className="panel">
        <h2>Help & legal</h2>

        <p>
          Feedback · Terms of service · About Campus Mall · FAQ ·
          Dark mode
        </p>

        <p>Support: campusmall.support@gmail.com</p>
      </div>
    </>
  );
}
