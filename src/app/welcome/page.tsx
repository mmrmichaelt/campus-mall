"use client";

import { useEffect } from "react";

export default function Welcome() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.href = "/join";
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: "30px 20px",
      }}
    >
      <div>
        <div
          className="brand-mark"
          style={{
            display: "inline-block",
            fontSize: "30px",
            padding: "12px 15px",
            marginBottom: "18px",
          }}
          aria-label="Campus Mall"
        >
          CM
        </div>

        <h1>Welcome to campus mall</h1>

        <p
          className="note"
          style={{
            fontSize: "1rem",
            marginTop: "10px",
          }}
        >
          Your space. Your identity. Your future.
        </p>

        <p
          className="note"
          style={{
            marginTop: "28px",
          }}
        >
          © 2026 Campus Mall
        </p>
      </div>
    </main>
  );
}
