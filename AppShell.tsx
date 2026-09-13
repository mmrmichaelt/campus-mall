"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Home, ShoppingCart, PlusCircle, MessageCircle, Settings, UserCircle, LogOut, Search } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [q, setQ] = useState("");
  useEffect(() => { fetch("/api/me").then(r => r.json()).then(x => setUser(x.user)); }, []);
  async function logout() { await fetch("/api/auth/logout", {method:"POST"}); location.href="/"; }

  return <div className="app">
    <header className="topbar">
      <Link href="/" className="brand"><span className="brand-mark">CM</span><span>Campus Mall</span></Link>
      <form className="global-search" onSubmit={e => { e.preventDefault(); location.href = `/?q=${encodeURIComponent(q)}`; }}>
        <Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search items, food, jobs, services..." />
      </form>
      <div className="top-actions">
        <Link href="/notifications" aria-label="Notifications"><Bell size={20}/></Link>
        <Link href="/cart" aria-label="Cart"><ShoppingCart size={20}/></Link>
        {user ? <><Link href="/profile" className="avatar"><UserCircle size={22}/>{user.name?.split(" ")[0] || "Account"}</Link><button className="icon-btn" onClick={logout} title="Log out"><LogOut size={18}/></button></> : <Link className="small-btn" href="/join">Join</Link>}
      </div>
    </header>
    <nav className="mobile-nav">
      <Link href="/"><Home size={19}/><span>Home</span></Link>
      <Link href="/sell"><PlusCircle size={19}/><span>Add item</span></Link>
      <Link href="/cart"><ShoppingCart size={19}/><span>Cart</span></Link>
      <Link href="/chats"><MessageCircle size={19}/><span>Chats</span></Link>
      <Link href="/settings"><Settings size={19}/><span>Settings</span></Link>
    </nav>
    <main>{children}</main>
    <footer>© 2026 Campus Mall · Support: campusmallsupport@gmail.com</footer>
  </div>
}
