"use client";

import { useEffect, useState } from "react";

const SPLASH_DURATION_MS = 7000;

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="campus-splash campus-splash-photo" role="status" aria-label="Welcome to Campus Mall">
      <div className="campus-splash-photo-overlay" aria-hidden="true" />
      <div className="campus-splash-photo-content">
        <p className="campus-splash-welcome">WELCOME TO</p>
        <h1 className="campus-splash-title">CAMPUS MALL</h1>
        <p className="campus-splash-tagline">Your space. Your identity. Your future.</p>
      </div>
      <div className="campus-splash-footer">© 2026 Campus Mall</div>
      <style jsx>{`
        .campus-splash-photo {
          position: fixed; inset: 0; z-index: 1000; overflow: hidden;
          display: grid; place-items: center; min-height: 100dvh;
          background-color: #171114;
          background-image: url("/campus-mall-welcome.webp");
          background-size: cover; background-position: center center; background-repeat: no-repeat;
          color: #fff; animation: campusSplashFadeOut 0.55s ease 6.45s forwards;
        }
        .campus-splash-photo-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,.28) 42%, rgba(0,0,0,.62) 100%), linear-gradient(90deg, rgba(201,21,45,.18), transparent 48%, rgba(0,0,0,.12));
        }
        .campus-splash-photo-content {
          position: relative; z-index: 1; width: min(92vw, 1100px);
          padding: clamp(20px, 5vw, 64px); margin-top: clamp(4vh, 9vh, 90px);
          text-align: center; text-shadow: 0 3px 18px rgba(0,0,0,.62);
        }
        .campus-splash-welcome { margin: 0 0 8px; font-size: clamp(22px, 4.1vw, 58px); font-weight: 800; letter-spacing: .02em; }
        .campus-splash-title { margin: 0; font-size: clamp(44px, 8.6vw, 116px); line-height: .98; font-weight: 950; letter-spacing: -.045em; }
        .campus-splash-tagline { margin: clamp(16px, 2.5vw, 30px) 0 0; font-size: clamp(16px, 2.5vw, 32px); font-style: italic; font-weight: 600; line-height: 1.25; }
        .campus-splash-footer { position: absolute; z-index: 1; left: 20px; right: 20px; bottom: max(18px, env(safe-area-inset-bottom)); text-align: center; font-size: clamp(12px, 1.2vw, 17px); text-shadow: 0 2px 10px rgba(0,0,0,.7); }
        @keyframes campusSplashFadeOut { to { opacity: 0; visibility: hidden; pointer-events: none; } }
        @media (max-width: 620px) {
          .campus-splash-photo { background-position: 50% center; }
          .campus-splash-photo-content { width: 94vw; padding: 18px 12px; margin-top: 5vh; }
          .campus-splash-welcome { font-size: clamp(20px, 6.8vw, 30px); }
          .campus-splash-title { font-size: clamp(40px, 12vw, 64px); letter-spacing: -.04em; }
          .campus-splash-tagline { font-size: clamp(15px, 4.3vw, 21px); }
        }
        @media (prefers-reduced-motion: reduce) { .campus-splash-photo { animation: none; } }
      `}</style>
    </div>
  );
}