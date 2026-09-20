"use client";
import { useEffect, useState } from "react";
const SPLASH_DURATION_MS = 7000;
const SPLASH_SESSION_KEY = "campus_mall_splash_seen";
export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "1") return;
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
      setVisible(true);
    } catch { setVisible(true); }
    const timer = window.setTimeout(() => setVisible(false), SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return (
    <div className="campus-splash" role="status" aria-label="Welcome to Campus Mall">
      <div className="campus-splash-content">
        <h1>Welcome to campus mall</h1>
        <p>Your space. Your identity. Your future.</p>
        <small>© 2026 Campus Mall</small>
      </div>
      <style jsx>{`
        .campus-splash { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; min-height: 100dvh; padding: 24px; background: #ffffff; color: #111111; text-align: center; animation: fade .55s ease 6.45s forwards; }
        .campus-splash-content { width: min(92vw, 620px); }
        h1 { margin: 0; font-size: clamp(30px, 7vw, 52px); line-height: 1.08; font-weight: 800; }
        p { margin: 14px 0 0; color: #555555; font-size: clamp(16px, 3.5vw, 21px); }
        small { display: block; margin-top: 28px; color: #777777; font-size: 13px; }
        @keyframes fade { to { opacity: 0; visibility: hidden; pointer-events: none; } }
      `}</style>
    </div>
  );
}