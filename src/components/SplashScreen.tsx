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
        <div className="brand-mark" aria-hidden="true">CM</div>
        <h1>Welcome to campus mall</h1>
        <p>Your space. Your identity. Your future.</p>
        <div className="accent-line" aria-hidden="true" />
        <small>© 2026 Campus Mall</small>
      </div>
      <style jsx>{`
        .campus-splash {
          position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center;
          min-height: 100dvh; padding: 24px; overflow: hidden; text-align: center;
          background: radial-gradient(circle at 50% 38%, #241116 0%, #100d0e 48%, #080808 100%);
          color: #fff;
        }
        .campus-splash::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(135deg, rgba(201,21,45,.16), transparent 45%, rgba(168,15,36,.10));
        }
        .campus-splash-content { position: relative; width: min(92vw, 680px); }
        .brand-mark {
          width: 86px; height: 86px; margin: 0 auto 26px; display: grid; place-items: center;
          border-radius: 22px; background: #c9152d; color: #fff; font-size: 30px;
          font-weight: 900; letter-spacing: -2px; box-shadow: 0 16px 42px rgba(201,21,45,.30);
        }
        h1 { margin: 0; font-size: clamp(31px, 7vw, 54px); line-height: 1.05; font-weight: 850; letter-spacing: -.035em; }
        p { margin: 16px 0 0; color: #f2dfe2; font-size: clamp(16px, 3.5vw, 21px); line-height: 1.5; }
        .accent-line { width: 58px; height: 4px; margin: 25px auto 0; border-radius: 99px; background: #c9152d; }
        small { display: block; margin-top: 24px; color: #a9a1a3; font-size: 13px; }
        @keyframes fade { to { opacity: 0; visibility: hidden; pointer-events: none; } }
        .campus-splash { animation: fade .55s ease 6.45s forwards; }
      `}</style>
    </div>
  );
}