"use client";

import { useEffect, useState } from "react";

const SPLASH_DURATION_MS = 7000;
const SPLASH_SESSION_KEY = "campus_mall_splash_seen";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the welcome screen only once per browser session.
    // This prevents navigating back to Home from replaying the 7-second splash.
    try {
      if (window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "1") {
        return;
      }

      window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
      setVisible(true);
    } catch {
      // If sessionStorage is unavailable, still show the splash once
      // for this mounted Home page.
      setVisible(true);
    }

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="campus-splash-photo"
      role="status"
      aria-label="Welcome to Campus Mall"
    >
      <div className="campus-splash-photo-image" aria-hidden="true" />

      <style jsx>{`
        .campus-splash-photo {
          position: fixed;
          inset: 0;
          z-index: 1000;
          overflow: hidden;
          min-height: 100dvh;
          background: #140c0e;
          animation: campusSplashFadeOut .55s ease 6.45s forwards;
        }

        .campus-splash-photo-image {
          position: absolute;
          inset: 0;
          background-image: url("/campus-mall-welcome.jpg");
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
        }

        @keyframes campusSplashFadeOut {
          to {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
        }

        @media (max-width: 620px) {
          .campus-splash-photo-image {
            background-size: cover;
            background-position: center center;
          }
        }

        @media (max-width: 420px) {
          .campus-splash-photo-image {
            background-position: 50% center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .campus-splash-photo {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
