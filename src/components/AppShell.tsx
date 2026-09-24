"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Home, ShoppingCart, PlusCircle, MessageCircle, Settings, UserCircle, Search, Menu, CreditCard, MapPin, ShoppingBag, Megaphone, Tag, HelpCircle, ShieldCheck, LogOut } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/welcome") return;
    let active = true;
    try {
      const savedTheme = window.localStorage.getItem("campus_mall_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
        document.documentElement.dataset.theme = savedTheme;
      }
    } catch {}
    setMenuOpen(false);
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

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = q.trim();
    window.location.href = value ? "/listings?q=" + encodeURIComponent(value) : "/listings";
  }

  return (
    <div className="app">
      <header className="topbar">
        <form className="global-search" onSubmit={submitSearch}>
          <Search size={18} aria-hidden="true" />
          <input value={q} onChange={event => setQ(event.target.value)} placeholder="Search items, food, jobs, services..." aria-label="Search Campus Mall" />
        </form>
        <div className="top-actions">
          <Link href="/notifications" className={pathname.startsWith("/notifications") ? "active-page" : ""} aria-label="Notifications" title="Notifications"><Bell size={20} /></Link>
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={"Switch to " + (theme === "dark" ? "light" : "dark") + " mode"} title={"Switch to " + (theme === "dark" ? "light" : "dark") + " mode"}>
            <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
          </button>
          <div className="top-menu-wrap">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMenuOpen(value => !value)}
              aria-expanded={menuOpen}
              aria-controls="campus-mall-menu"
              aria-label="Open menu"
              title="Menu"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            {menuOpen && (
              <div id="campus-mall-menu" className="top-menu-panel">
                <Link href="/settings" onClick={() => setMenuOpen(false)} className={pathname === "/settings" ? "active-page" : ""}>
                  <Settings size={18} aria-hidden="true" />
                  <span>Settings</span>
                </Link>
                <Link href="/account/pro" onClick={() => setMenuOpen(false)} className={pathname.startsWith("/account/pro") ? "active-page" : ""}>
                  <CreditCard size={18} aria-hidden="true" />
                  <span>Campus Mall Pro</span>
                </Link>
                <Link href="/switch-institution" onClick={() => setMenuOpen(false)} className={pathname.startsWith("/switch-institution") ? "active-page" : ""}>
                  <MapPin size={18} aria-hidden="true" />
                  <span>Switch institution</span>
                </Link>
                <Link href="/orders" onClick={() => setMenuOpen(false)} className={pathname.startsWith("/orders") ? "active-page" : ""}>
                  <ShoppingBag size={18} aria-hidden="true" />
                  <span>My orders</span>
                </Link>
                <Link href="/advertise" onClick={() => setMenuOpen(false)} className={pathname.startsWith("/advertise") ? "active-page" : ""}>
                  <Megaphone size={18} aria-hidden="true" />
                  <span>Promote &amp; advertise</span>
                </Link>
                <Link href="/offers" onClick={() => setMenuOpen(false)} className={pathname.startsWith("/offers") ? "active-page" : ""}>
                  <Tag size={18} aria-hidden="true" />
                  <span>Offers &amp; promotions</span>
                </Link>
                <div className="top-menu-section-label">Support &amp; legal</div>
                <a href="mailto:campusmall.support@gmail.com" onClick={() => setMenuOpen(false)}>
                  <HelpCircle size={18} aria-hidden="true" />
                  <span>Support</span>
                </a>
                <Link href="/terms" onClick={() => setMenuOpen(false)}>
                  <HelpCircle size={18} aria-hidden="true" />
                  <span>Terms</span>
                </Link>
                <Link href="/privacy" onClick={() => setMenuOpen(false)}>
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>Privacy</span>
                </Link>
                <button type="button" onClick={async () => {
                  setMenuOpen(false);
                  try { await fetch("/api/auth/logout", { method: "POST" }); } finally { window.location.href = "/"; }
                }}>
                  <LogOut size={18} aria-hidden="true" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/" className={pathname === "/" ? "active" : ""}><Home size={19} /><span>Home</span></Link>
        <Link href="/sell" className={pathname.startsWith("/sell") ? "active" : ""}><PlusCircle size={19} /><span>Add item</span></Link>
        <Link href="/cart" className={pathname.startsWith("/cart") ? "active" : ""}><ShoppingCart size={19} /><span>Cart</span></Link>
        <Link href="/chats" className={pathname.startsWith("/chats") ? "active" : ""}><MessageCircle size={19} /><span>Chats</span></Link>
        <Link href={user ? "/profile" : "/join"} className={(pathname.startsWith("/profile") || pathname.startsWith("/join")) ? "active account-nav-link" : "account-nav-link"} aria-label={user ? "Account" : "Join"}>
          {user?.imageUrl ? <img src={user.imageUrl} alt="" className="bottom-profile-image" /> : <UserCircle size={19} />}
          <span>{user ? "Account" : "Join"}</span>
        </Link>
      </nav>

      <main>{children}</main>
      <footer>© 2026 Campus Mall · Support: campusmall.support@gmail.com</footer>
    </div>
  );
}
