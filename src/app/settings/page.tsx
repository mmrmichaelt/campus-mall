"use client";

import Link from "next/link";
import InstitutionMemberships from "@/components/InstitutionMemberships";
import { useEffect, useState } from "react";
import { Bell, ShieldCheck, ShoppingBag, Store, CreditCard, Palette, HelpCircle, Megaphone, UserRound, MapPin, LogOut, ChevronRight } from "lucide-react";

type SettingsState = { emailAlerts:boolean; messageAlerts:boolean; marketing:boolean; publicProfile:boolean };
const defaults:SettingsState={emailAlerts:true,messageAlerts:true,marketing:false,publicProfile:true};

export default function Settings(){
  const [settings,setSettings]=useState<SettingsState>(defaults);
  const [uni,setUni]=useState(""); const [msg,setMsg]=useState(""); const [saving,setSaving]=useState(false); const [loading,setLoading]=useState(true); const [loggingOut,setLoggingOut]=useState(false);

  useEffect(()=>{(async()=>{try{const r=await fetch("/api/settings",{cache:"no-store"});const d=await r.json().catch(()=>({}));if(r.ok&&d.settings)setSettings(d.settings)}finally{setLoading(false)}})()},[]);
  async function save(next:SettingsState){setSettings(next);setSaving(true);setMsg("");try{const r=await fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(next)});const d=await r.json().catch(()=>({}));setMsg(r.ok?"Saved.":(d.error||"Unable to save."))}catch{setMsg("Unable to save.")}finally{setSaving(false)}}
  function toggle(key:keyof SettingsState){void save({...settings,[key]:!settings[key]})}
  async function changeUniversity(){try{const r=await fetch("/api/university",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({university:uni})});const d=await r.json().catch(()=>({}));setMsg(r.ok?"University switched.":(d.error||"Log in first."))}catch{setMsg("Unable to switch university.")}}
  async function logout(){setLoggingOut(true);try{await fetch("/api/auth/logout",{method:"POST"});window.location.href="/"}finally{setLoggingOut(false)}}

  const Row=({href,icon,label}:any)=><Link href={href} className="settings-row"><span className="settings-row-icon">{icon}</span><strong>{label}</strong><ChevronRight size={17}/></Link>;
  const Toggle=({label,checked,onChange}:any)=><label className="settings-row settings-toggle"><span><strong>{label}</strong></span><input type="checkbox" checked={checked} onChange={onChange} disabled={saving||loading}/></label>;

  return <div className="settings-page">
    <div className="market-page-head"><div><span className="hero-kicker">CAMPUS MALL</span><h1>Settings</h1></div><Link href="/" className="secondary-btn">Marketplace</Link></div>
    {msg&&<div className={msg.includes("Unable")?"error":"success"} style={{marginBottom:10}}>{msg}</div>}

    <section className="settings-list">
      <Row href="/account/pro" icon={<CreditCard size={18}/>} label="Campus Mall Pro"/>
      <Row href="/profile" icon={<UserRound size={18}/>} label="Account & profile"/>
      <div className="settings-inline">
        <span className="settings-row-icon"><MapPin size={18}/></span>
        <div><strong>Institution</strong><input value={uni} onChange={e=>setUni(e.target.value)} placeholder="Search university or college"/><button className="primary-btn" onClick={changeUniversity}>Switch</button></div>
      </div>
      <InstitutionMemberships />
      <Row href="/orders" icon={<ShoppingBag size={18}/>} label="My orders"/>
      <Row href="/advertise" icon={<Megaphone size={18}/>} label="Promote & advertise"/>
      <Row href="/business" icon={<Store size={18}/>} label="Business account"/>
    </section>

    <section className="settings-group"><h3>More</h3>
      <Row href="/notifications" icon={<Bell size={18}/>} label="Notifications"/>
      <Row href="/chats" icon={<UserRound size={18}/>} label="Chats & messages"/>
      <Row href="/cart" icon={<ShoppingBag size={18}/>} label="Trolley / cart"/>
      <Row href="/sell" icon={<Store size={18}/>} label="Add item"/>
      <Row href="/listings" icon={<Store size={18}/>} label="Browse marketplace"/>
    </section>

    <section className="settings-group"><h3>Preferences</h3>
      <Toggle label="Email notifications" checked={settings.emailAlerts} onChange={()=>toggle("emailAlerts")}/>
      <Toggle label="Chat notifications" checked={settings.messageAlerts} onChange={()=>toggle("messageAlerts")}/>
      <Toggle label="Offers & promotions" checked={settings.marketing} onChange={()=>toggle("marketing")}/>
      <Toggle label="Public profile" checked={settings.publicProfile} onChange={()=>toggle("publicProfile")}/>
      <button type="button" className="settings-row settings-button" onClick={()=>{const root=document.documentElement;const next=root.dataset.theme==="dark"?"light":"dark";root.dataset.theme=next;window.localStorage.setItem("campus_mall_theme",next)}}><span className="settings-row-icon"><Palette size={18}/></span><strong>Appearance</strong><span/></button>
      <Row href="/notifications" icon={<Bell size={18}/>} label="Notification center"/>
    </section>

    <section className="settings-group"><h3>Support & legal</h3>
      <a href="mailto:campusmall.support@gmail.com" className="settings-row"><span className="settings-row-icon"><HelpCircle size={18}/></span><strong>Support</strong><ChevronRight size={17}/></a>
      <Row href="/terms" icon={<HelpCircle size={18}/>} label="Terms"/>
      <Row href="/privacy" icon={<ShieldCheck size={18}/>} label="Privacy"/>
    </section>

    <section className="settings-group settings-danger"><button className="settings-row settings-button danger-row" onClick={logout} disabled={loggingOut}><span className="settings-row-icon"><LogOut size={18}/></span><strong>{loggingOut?"Signing out...":"Log out"}</strong><span/></button></section>
  </div>;
}
