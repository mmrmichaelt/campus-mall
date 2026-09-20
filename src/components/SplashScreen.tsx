"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="campus-splash" role="status" aria-label="Welcome to Campus Mall">
      <div className="campus-splash-content">
        <div className="campus-splash-mark" aria-hidden="true">CM</div>
        <div className="campus-splash-title">WELCOME TO CAMPUS MALL</div>
        <div className="campus-splash-tagline">Your space. Your identity. Your future.</div>
      </div>
      <div className="campus-splash-footer">© 2026 Campus Mall</div>
    </div>
  );
}
