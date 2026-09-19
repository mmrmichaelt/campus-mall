"use client";

import Link from "next/link";
import InstitutionMemberships from "@/components/InstitutionMemberships";
import { useEffect, useState } from "react";
import {
  Bell,
  ShieldCheck,
  ShoppingBag,
  Store,
  CreditCard,
  Palette,
  LockKeyhole,
  HelpCircle,
  Megaphone,
  UserRound,
  MapPin,
  LogOut,
} from "lucide-react";

type SettingsState = {
  emailAlerts: boolean;
  messageAlerts: boolean;
  marketing: boolean;
  publicProfile: boolean;
};

const defaults: SettingsState = {
  emailAlerts: true,
  messageAlerts: true,
  marketing: false,
  publicProfile: true,
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>(defaults);
  const [uni, setUni] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.settings) {
          setSettings(data.settings);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function save(next: SettingsState) {
    setSettings(next);
    setSaving(true);
    setMsg("");
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await response.json().catch(() => ({}));
      setMsg(response.ok ? "Settings saved." : (data.error || "Unable to save settings."));
    } catch {
      setMsg("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: keyof SettingsState) {
    void save({ ...settings, [key]: !settings[key] });
  }

  async function changeUniversity() {
    setMsg("");
    try {
      const response = await fetch("/api/university", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university: uni }),
      });
      const data = await response.json().catch(() => ({}));
      setMsg(response.ok ? "University switched successfully." : (data.error || "Log in first."));
    } catch {
      setMsg("Unable to switch university.");
    }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } finally {
      setLoggingOut(false);
    }
  }

  const Toggle = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 18,
        padding: "14px 0",
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <span>
        <strong>{label}</strong>
        <small className="note" style={{ display: "block", marginTop: 4 }}>
          {description}
        </small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={saving || loading}
        style={{ width: 22, height: 22 }}
      />
    </label>
  );

  return (
    <div>
      <div className="section-title">
        <div>
          <p className="category">CAMPUS MALL</p>
          <h1>Marketplace settings</h1>
          <p className="note">
            Control your account, shopping, selling, privacy, notifications and marketplace experience.
          </p>
        </div>
        <Link href="/" className="secondary-btn">Marketplace</Link>
      </div>

      {msg && <div className={msg.includes("Unable") || msg.includes("error") ? "error" : "success"} style={{ marginBottom: 18 }}>{msg}</div>}

      <div className="two-col">
        <section className="panel">
          <div className="section-title">
            <div>
              <p className="category">ACCOUNT</p>
              <h2><UserRound size={20} /> Account & profile</h2>
            </div>
          </div>
          <div className="hero-actions">
            <Link href="/profile" className="primary-btn">Edit profile</Link>
            <Link href="/account" className="secondary-btn">Account overview</Link>
            <Link href="/verify" className="secondary-btn">Verify email & phone</Link>
          </div>
          <p className="note" style={{ marginTop: 14 }}>
            Your email address is used for account access and verification. Campus Mall does not ask you to confirm it twice during registration.
          </p>
        </section>

        <section className="panel">
          <p className="category">CAMPUS</p>
          <h2><MapPin size={20} /> University / college</h2>
          <input
            value={uni}
            onChange={(event) => setUni(event.target.value)}
            placeholder="Enter university / college"
            style={{ width: "100%", padding: 11, border: "1px solid #ddd", borderRadius: 10 }}
          />
          <button className="primary-btn" style={{ marginTop: 10 }} onClick={changeUniversity}>
            Switch university
          </button>
        </section>
      </div>

      <InstitutionMemberships />

      <section className="panel" style={{ marginTop: 20 }}>
        <p className="category">NOTIFICATIONS</p>
        <h2><Bell size={20} /> Notification preferences</h2>
        <Toggle label="Email notifications" description="Receive important account and marketplace updates by email." checked={settings.emailAlerts} onChange={() => toggle("emailAlerts")} />
        <Toggle label="Chat notifications" description="Get notified about buyer and seller messages." checked={settings.messageAlerts} onChange={() => toggle("messageAlerts")} />
        <Toggle label="Offers and promotions" description="Receive optional Campus Mall offers and marketing." checked={settings.marketing} onChange={() => toggle("marketing")} />
      </section>

      <div className="two-col" style={{ marginTop: 20 }}>
        <section className="panel">
          <p className="category">PRIVACY & SECURITY</p>
          <h2><ShieldCheck size={20} /> Privacy controls</h2>
          <Toggle label="Public profile" description="Allow other marketplace users to view your public profile and active listings." checked={settings.publicProfile} onChange={() => toggle("publicProfile")} />
          <div className="hero-actions" style={{ marginTop: 16 }}>
            <Link href="/verify" className="secondary-btn"><LockKeyhole size={17} /> Verification & security</Link>
            <Link href="/notifications" className="secondary-btn"><Bell size={17} /> Notifications</Link>
          </div>
        </section>

        <section className="panel">
          <p className="category">SHOPPING</p>
          <h2><ShoppingBag size={20} /> Shopping preferences</h2>
          <div className="hero-actions">
            <Link href="/cart" className="secondary-btn"><ShoppingBag size={17} /> Trolley / cart</Link>
            <Link href="/listings" className="secondary-btn">Browse marketplace</Link>
            <Link href="/orders" className="secondary-btn">My orders</Link>
          </div>
        </section>
      </div>

      <div className="two-col" style={{ marginTop: 20 }}>
        <section className="panel">
          <p className="category">SELLING</p>
          <h2><Store size={20} /> Seller tools</h2>
          <div className="hero-actions">
            <Link href="/sell" className="primary-btn">Add an item</Link>
            <Link href="/advertise" className="secondary-btn">Advertise a product</Link>
            <Link href="/business" className="secondary-btn">Business account</Link>
          </div>
          <p className="note" style={{ marginTop: 12 }}>
            Listing creation can remain free while featured placement, promotions and advertising can be paid services.
          </p>
        </section>

        <section className="panel">
          <p className="category">PAYMENTS & PRO</p>
          <h2><CreditCard size={20} /> Payments and subscriptions</h2>
          <div className="hero-actions">
            <Link href="/account/pro" className="primary-btn">Manage Campus Mall Pro</Link>
            <Link href="/pro" className="secondary-btn">View Pro plans</Link>
            <Link href="/business" className="secondary-btn">Business plans</Link>
          </div>
        </section>
      </div>

      <div className="two-col" style={{ marginTop: 20 }}>
        <section className="panel">
          <p className="category">GROWTH</p>
          <h2><Megaphone size={20} /> Promotion & advertising</h2>
          <p className="note">Promote listings, create advertising campaigns and manage business visibility.</p>
          <div className="hero-actions">
            <Link href="/advertise" className="primary-btn">Create advert</Link>
            <Link href="/business" className="secondary-btn">Business account</Link>
          </div>
        </section>

        <section className="panel">
          <p className="category">APPEARANCE</p>
          <h2><Palette size={20} /> App experience</h2>
          <p className="note">Campus Mall is designed for phone and desktop use. Your browser or device can control dark/light appearance where supported.</p>
          <div className="hero-actions">
            <Link href="/" className="secondary-btn">Return to marketplace</Link>
            <button type="button" className="secondary-btn" onClick={() => {
              const root = document.documentElement;
              const next = root.dataset.theme === "dark" ? "light" : "dark";
              root.dataset.theme = next;
              window.localStorage.setItem("campus_mall_theme", next);
            }}>Toggle dark / light mode</button>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 20 }}>
        <p className="category">HELP & LEGAL</p>
        <h2><HelpCircle size={20} /> Support</h2>
        <div className="hero-actions">
          <a href="mailto:campusmall.support@gmail.com" className="secondary-btn">Email support</a>
          <Link href="/terms" className="secondary-btn">Terms</Link>
          <Link href="/privacy" className="secondary-btn">Privacy</Link>
        </div>
        <p className="note" style={{ marginTop: 12 }}>Support: campusmall.support@gmail.com</p>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <p className="category">SESSION</p>
        <h2>Sign out</h2>
        <p className="note">Sign out of this device. You can log in again at any time.</p>
        <button className="danger-btn" onClick={logout} disabled={loggingOut}>
          <LogOut size={17} /> {loggingOut ? "Signing out..." : "Log out"}
        </button>
      </section>

      {saving && <p className="note" style={{ textAlign: "center", marginTop: 16 }}>Saving settings...</p>}
    </div>
  );
}
