"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MarketplaceFilter from "./MarketplaceFilter";
import Link from "next/link";
import { Bell, Home, ShoppingCart, PlusCircle, MessageCircle, Settings, UserCircle, LogOut, Search } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/welcome") return;
    let active = true;
    fetch("/api/me").then(r => r.json()).then(data => {
      if (active) setUser(data.user ?? null);
    }).catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, [pathname]);

  if (pathname === "/welcome") return <>{children}</>;

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("campus_mall_theme", next);
  }

  async function logout() {
    try { await fetch("/api/auth/logout", { method: "POST" }); }
    finally { window.location.href = "/"; }
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = q.trim();
    window.location.href = value ? "/?q=" + encodeURIComponent(value) : "/";
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link href="/" className={"brand " + (pathname === "/" ? "active-page" : "")} aria-label="Campus Mall home">
          <span className="brand-mark">CM</span><span>Campus Mall</span>
        </Link>
        <form className="global-search" onSubmit={submitSearch}>
          <Search size={18} aria-hidden="true" />
          <input value={q} onChange={event => setQ(event.target.value)} placeholder="Search items, food, jobs, services..." aria-label="Search Campus Mall" />
        </form>
        <div className="top-actions">
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={"Switch to " + (theme === "dark" ? "light" : "dark") + " mode"} title={"Switch to " + (theme === "dark" ? "light" : "dark") + " mode"}>
            {theme === "dark" ? "☀️" : "🌙"} <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          <Link href="/notifications" className={pathname.startsWith("/notifications") ? "active-page" : ""} aria-label="Notifications" title="Notifications"><Bell size={20} /></Link>
          <MarketplaceFilter />
          {user ? <>
            <Link
              href="/profile"
              className={"avatar " + (pathname.startsWith("/profile") ? "active-page" : "")}
              aria-label="Profile"
              title="Profile"
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="header-profile-image"
                />
              ) : (
                <UserCircle size={24} aria-hidden="true" />
              )}
            </Link>
          </> : <Link className={"small-btn " + (pathname.startsWith("/join") ? "active-page" : "")} href="/join">Join</Link>}
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/" className={pathname === "/" ? "active" : ""}><Home size={19} /><span>Home</span></Link>
        <Link href="/sell" className={pathname.startsWith("/sell") ? "active" : ""}><PlusCircle size={19} /><span>Add item</span></Link>
        <Link href="/cart" className={pathname.startsWith("/cart") ? "active" : ""}><ShoppingCart size={19} /><span>Cart</span></Link>
        <Link href="/chats" className={pathname.startsWith("/chats") ? "active" : ""}><MessageCircle size={19} /><span>Chats</span></Link>
        <Link href="/settings" className={pathname.startsWith("/settings") ? "active" : ""}><Settings size={19} /><span>Settings</span></Link>
      </nav>
      <main>{children}</main>
      <footer>© 2026 Campus Mall · Support: campusmall.support@gmail.com</footer>
    </div>
  );
}
