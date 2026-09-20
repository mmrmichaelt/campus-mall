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
    <div className="campus-splash-photo" role="status" aria-label="Welcome to Campus Mall">
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
          to { opacity: 0; visibility: hidden; pointer-events: none; }
        }
        @media (max-width: 620px) {
          .campus-splash-photo-image {
            background-size: auto 100%;
            background-position: center center;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .campus-splash-photo { animation: none; }
        }
      `}</style>
    </div>
  );
}