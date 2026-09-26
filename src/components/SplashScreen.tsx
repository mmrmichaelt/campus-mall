"use client";

import { useEffect, useState } from "react";

const SPLASH_DURATION_MS = 7000;
const SPLASH_SESSION_KEY = "campus_mall_splash_seen_v2";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "1") {
        setVisible(false);
        document.documentElement.classList.remove("splash-blocking");
        return;
      }

      window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
      document.documentElement.classList.add("splash-blocking");
    } catch {}

    const timer = window.setTimeout(() => {
      setVisible(false);
      document.documentElement.classList.remove("splash-blocking");
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="campus-splash" role="status" aria-label="Welcome to Campus Mall">
      <div className="splash-orb splash-orb-one" aria-hidden="true" />
      <div className="splash-orb splash-orb-two" aria-hidden="true" />

      <div className="splash-content">
        <div className="splash-logo" role="img" aria-label="Campus Mall">
          <svg viewBox="0 0 512 512" aria-hidden="true">
            <rect width="512" height="512" rx="92" fill="#111111" />
            <g fill="#ffffff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900">
              <text x="62" y="265" fontSize="205" fill="#ff1828">C</text>
              <text x="218" y="265" fontSize="205">M</text>
            </g>
            <g fill="none" stroke="#ffffff" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round">
              <path d="M154 326h30l16 74h126l27-58H201" />
              <path d="M217 346h113" />
            </g>
            <circle cx="220" cy="423" r="13" fill="#ffffff" />
            <circle cx="316" cy="423" r="13" fill="#ffffff" />
          </svg>
        </div>

        <div className="splash-accent" aria-hidden="true" />

        <h1>WELCOME TO CAMPUS MALL</h1>
        <p>Your space. Your identity. Your future.</p>

        <div className="splash-progress" aria-hidden="true">
          <span />
        </div>

        <small>© 2026 Campus Mall</small>
      </div>

      <style jsx>{`
        .campus-splash {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: grid;
          place-items: center;
          min-height: 100dvh;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 45%, #ffffff 0%, #ffffff 35%, #fafafa 68%, #f2f2f2 100%);
          color: #171717;
          text-align: center;
          animation: splashOut .55s ease 6.45s forwards;
        }

        .splash-content {
          position: relative;
          z-index: 2;
          width: min(92vw, 760px);
          padding: 32px 20px;
          animation: contentIn .9s cubic-bezier(.2,.8,.2,1) both;
        }

        .splash-logo {
          display: block;
          width: 112px;
          height: 112px;
          margin: 0 auto 28px;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 18px 45px rgba(201, 20, 41, .2);
          animation: logoIn .9s cubic-bezier(.2,.8,.2,1) .05s both, logoFloat 3.2s ease-in-out 1s infinite;
        }

        .splash-logo svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .splash-accent {
          width: 48px;
          height: 4px;
          margin: 0 auto 24px;
          border-radius: 999px;
          background: #c91429;
          animation: accentIn .65s ease .25s both;
        }

        h1 {
          margin: 0;
          font-size: clamp(29px, 7vw, 58px);
          line-height: 1.04;
          font-weight: 900;
          letter-spacing: -.045em;
          animation: textIn .8s ease .35s both;
        }

        p {
          margin: 17px 0 0;
          color: #666;
          font-size: clamp(16px, 3.6vw, 22px);
          line-height: 1.5;
          animation: textIn .8s ease .5s both;
        }

        .splash-progress {
          width: min(230px, 58vw);
          height: 3px;
          margin: 30px auto 0;
          overflow: hidden;
          border-radius: 999px;
          background: #e9e9e9;
          animation: textIn .8s ease .65s both;
        }

        .splash-progress span {
          display: block;
          width: 42%;
          height: 100%;
          border-radius: inherit;
          background: #c91429;
          animation: progress 6.2s linear .7s both;
        }

        small {
          display: block;
          margin-top: 23px;
          color: #999;
          font-size: 13px;
          animation: textIn .8s ease .75s both;
        }

        .splash-orb {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          filter: blur(65px);
          pointer-events: none;
          opacity: .28;
        }

        .splash-orb-one {
          top: -180px;
          right: -110px;
          background: #f2cdd2;
          animation: driftOne 6s ease-in-out infinite;
        }

        .splash-orb-two {
          bottom: -190px;
          left: -120px;
          background: #eeeeee;
          animation: driftTwo 7s ease-in-out infinite;
        }

        @keyframes contentIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes logoIn {
          from { opacity: 0; transform: scale(.72) rotate(-6deg); }
          to { opacity: 1; transform: scale(1) rotate(0); }
        }

        @keyframes logoFloat {
          50% { transform: translateY(-6px); }
        }

        @keyframes accentIn {
          from { width: 0; opacity: 0; }
          to { width: 48px; opacity: 1; }
        }

        @keyframes textIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes progress {
          from { transform: translateX(-115%); }
          to { transform: translateX(250%); }
        }

        @keyframes driftOne {
          50% { transform: translate(-35px, 35px) scale(1.08); }
        }

        @keyframes driftTwo {
          50% { transform: translate(35px, -25px) scale(1.06); }
        }

        @keyframes splashOut {
          to { opacity: 0; visibility: hidden; pointer-events: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .campus-splash,
          .splash-content,
          .splash-logo,
          .splash-accent,
          h1,
          p,
          .splash-progress,
          small,
          .splash-orb,
          .splash-progress span {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
