"use client";
import { useEffect, useState } from "react";

const SPLASH_DURATION_MS = 7000;
const SPLASH_SESSION_KEY = "campus_mall_splash_seen";

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
    } catch {
      // If sessionStorage is unavailable, still show the splash normally.
    }

    const timer = window.setTimeout(() => {
      setVisible(false);
      document.documentElement.classList.remove("splash-blocking");
    }, SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="campus-splash" role="status" aria-label="Welcome to Campus Mall">
      <div className="soft-glow soft-glow-one" aria-hidden="true" />
      <div className="soft-glow soft-glow-two" aria-hidden="true" />
      <div className="splash-content">
        <div className="brand-mark" aria-hidden="true">CM</div>
        <div className="brand-line" aria-hidden="true" />
        <h1>Welcome to campus mall</h1>
        <p>Your space. Your identity. Your future.</p>
        <div className="loading-line" aria-hidden="true"><span /></div>
        <small>© 2026 Campus Mall</small>
      </div>
      <style jsx>{`
        .campus-splash {
          position: fixed; inset: 0; z-index: 99999; overflow: hidden;
          display: grid; place-items: center; min-height: 100dvh;
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 52%, #f4f4f4 100%);
          color: #171717; text-align: center;
          animation: splashOut .6s ease 6.4s forwards;
        }
        .splash-content { position: relative; z-index: 2; width: min(92vw, 680px); animation: contentIn 1s cubic-bezier(.2,.8,.2,1) both; }
        .brand-mark {
          width: 86px; height: 86px; margin: 0 auto 18px; display: grid; place-items: center;
          border-radius: 24px; background: #c9152d; color: #fff; font-size: 30px;
          font-weight: 900; letter-spacing: -2px; box-shadow: 0 14px 35px rgba(201,21,45,.18);
          animation: logoIn .9s cubic-bezier(.2,.8,.2,1) .1s both, logoFloat 3s ease-in-out 1.2s infinite;
        }
        .brand-line { width: 42px; height: 3px; margin: 0 auto 25px; border-radius: 99px; background: #c9152d; animation: lineIn .7s ease .35s both; }
        h1 { margin: 0; font-size: clamp(31px, 7vw, 54px); line-height: 1.05; font-weight: 800; letter-spacing: -.04em; animation: textIn .8s ease .45s both; }
        p { margin: 15px 0 0; color: #6d6d6d; font-size: clamp(16px, 3.5vw, 21px); line-height: 1.5; animation: textIn .8s ease .6s both; }
        .loading-line { width: min(210px, 55vw); height: 3px; margin: 28px auto 0; overflow: hidden; border-radius: 99px; background: #ececec; animation: textIn .8s ease .75s both; }
        .loading-line span { display: block; width: 45%; height: 100%; border-radius: inherit; background: #c9152d; animation: progress 6.2s linear .8s both; }
        small { display: block; margin-top: 22px; color: #9a9a9a; font-size: 13px; animation: textIn .8s ease .8s both; }
        .soft-glow { position: absolute; width: 330px; height: 330px; border-radius: 50%; filter: blur(55px); opacity: .24; pointer-events: none; }
        .soft-glow-one { top: -150px; right: -100px; background: #f3dce0; animation: driftOne 6s ease-in-out infinite; }
        .soft-glow-two { bottom: -170px; left: -100px; background: #eeeeee; animation: driftTwo 7s ease-in-out infinite; }
        @keyframes contentIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes logoIn { from { opacity: 0; transform: scale(.7) rotate(-7deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
        @keyframes logoFloat { 50% { transform: translateY(-5px); } }
        @keyframes lineIn { from { width: 0; opacity: 0; } to { width: 42px; opacity: 1; } }
        @keyframes textIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progress { from { transform: translateX(-110%); } to { transform: translateX(230%); } }
        @keyframes driftOne { 50% { transform: translate(-35px, 35px) scale(1.08); } }
        @keyframes driftTwo { 50% { transform: translate(35px, -25px) scale(1.06); } }
        @keyframes splashOut { to { opacity: 0; visibility: hidden; pointer-events: none; } }
        @media (prefers-reduced-motion: reduce) {
          .campus-splash, .splash-content, .brand-mark, .brand-line, h1, p, .loading-line, small, .soft-glow, .loading-line span { animation: none; }
        }
      `}</style>
    </div>
  );
}