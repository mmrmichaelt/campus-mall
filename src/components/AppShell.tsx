"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
Bell,
Home,
ShoppingCart,
PlusCircle,
MessageCircle,
Settings,
UserCircle,
LogOut,
Search,
} from "lucide-react";

export default function AppShell({
children,
}: {
children: React.ReactNode;
}) {
const [user, setUser] = useState<any>(null);
const [q, setQ] = useState("");

useEffect(() => {
let active = true;

fetch("/api/me")
  .then((response) => response.json())
  .then((data) => {
    if (active) {
      setUser(data.user ?? null);
    }
  })
  .catch(() => {
    if (active) {
      setUser(null);
    }
  });

return () => {
  active = false;
};

}, []);

async function logout() {
try {
await fetch("/api/auth/logout", {
method: "POST",
});
} finally {
window.location.href = "/";
}
}

function submitSearch(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

const value = q.trim();

if (!value) {
  window.location.href = "/";
  return;
}

window.location.href = `/?q=${encodeURIComponent(value)}`;

}

return (
<div className="app">
<header className="topbar">
<Link href="/" className="brand" aria-label="Campus Mall home">
<span className="brand-mark">CM</span>
<span>Campus Mall</span>
</Link>

    <form className="global-search" onSubmit={submitSearch}>
      <Search size={18} aria-hidden="true" />

      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder="Search items, food, jobs, services..."
        aria-label="Search Campus Mall"
      />
    </form>

    <div className="top-actions">
      <Link
        href="/notifications"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />
      </Link>

      <Link
        href="/cart"
        aria-label="Shopping cart"
        title="Trolley"
      >
        <ShoppingCart size={20} />
      </Link>

      {user ? (
        <>
          <Link
            href="/profile"
            className="avatar"
            aria-label="Profile"
          >
            <UserCircle size={22} />

            <span>
              {user.name?.split(" ")[0] || "Account"}
            </span>
          </Link>

          <button
            type="button"
            className="icon-btn"
            onClick={logout}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </>
      ) : (
        <Link className="small-btn" href="/join">
          Join
        </Link>
      )}
    </div>
  </header>

  <nav className="mobile-nav" aria-label="Mobile navigation">
    <Link href="/">
      <Home size={19} />
      <span>Home</span>
    </Link>

    <Link href="/sell">
      <PlusCircle size={19} />
      <span>Add item</span>
    </Link>

    <Link href="/cart">
      <ShoppingCart size={19} />
      <span>Cart</span>
    </Link>

    <Link href="/chats">
      <MessageCircle size={19} />
      <span>Chats</span>
    </Link>

    <Link href="/settings">
      <Settings size={19} />
      <span>Settings</span>
    </Link>
  </nav>

  <main>{children}</main>

  <footer>
    © 2026 Campus Mall · Support: campusmall.support@gmail.com
  </footer>
</div>

);
}
