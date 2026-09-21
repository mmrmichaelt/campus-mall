"use client";

import { useEffect } from "react";

const WELCOME_COOKIE = "campus_mall_welcome_seen";

export default function Welcome() {
  useEffect(() => {
    document.cookie = WELCOME_COOKIE + "=1; Path=/; SameSite=Lax";
    const timer = window.setTimeout(() => window.location.replace("/"), 7000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main style={{
      minHeight: "100dvh",
      display: "grid",
      placeItems: "center",
      textAlign: "center",
      padding: "30px 20px",
      background: "linear-gradient(135deg, #ffffff 0%, #fafafa 52%, #f4f4f4 100%)",
      color: "#171717"
    }}>
      <div>
        <div className="brand-mark" style={{
          display: "grid", placeItems: "center", width: "86px", height: "86px",
          margin: "0 auto 18px", fontSize: "30px", borderRadius: "24px"
        }} aria-label="Campus Mall">CM</div>
        <h1>Welcome to campus mall</h1>
        <p className="note" style={{ fontSize: "1rem", marginTop: "10px" }}>
          Your space. Your identity. Your future.
        </p>
        <div aria-hidden="true" style={{
          width: "210px", height: "3px", margin: "28px auto 0",
          overflow: "hidden", borderRadius: "99px", background: "#ececec"
        }}>
          <span style={{
            display: "block", width: "45%", height: "100%", borderRadius: "inherit",
            background: "#c9152d", animation: "campusWelcomeProgress 7s linear both"
          }} />
        </div>
        <p className="note" style={{ marginTop: "22px", fontSize: "13px" }}>© 2026 Campus Mall</p>
      </div>
      <style jsx>{`
        @keyframes campusWelcomeProgress {
          from { transform: translateX(-110%); }
          to { transform: translateX(230%); }
        }
      `}</style>
    </main>
  );
}
