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
        <div className="topbar-spacer" aria-hidden="true" />

