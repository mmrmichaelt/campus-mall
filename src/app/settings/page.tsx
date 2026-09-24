"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

type SettingsState = { emailAlerts:boolean; messageAlerts:boolean; marketing:boolean; publicProfile:boolean };
const defaults:SettingsState={emailAlerts:true,messageAlerts:true,marketing:false,publicProfile:true};

export default function Settings(){
  const [settings,setSettings]=useState<SettingsState>(defaults);
  const [msg,setMsg]=useState(""); const [saving,setSaving]=useState(false); const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{try{const r=await fetch("/api/settings",{cache:"no-store"});const d=await r.json().catch(()=>({}));if(r.ok&&d.settings)setSettings(d.settings)}finally{setLoading(false)}})()},[]);
  async function save(next:SettingsState){setSettings(next);setSaving(true);setMsg("");try{const r=await fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(next)});const d=await r.json().catch(()=>({}));setMsg(r.ok?"Saved.":(d.error||"Unable to save."))}catch{setMsg("Unable to save.")}finally{setSaving(false)}}
  function toggle(key:keyof SettingsState){void save({...settings,[key]:!settings[key]})}
  return <div className="settings-page">
    <div className="market-page-head"><div><span className="hero-kicker">CAMPUS MALL</span><h1>Settings</h1></div><Link href="/" className="secondary-btn">Marketplace</Link></div>
    {msg&&<div className={msg.includes("Unable")?"error":"success"} style={{marginBottom:10}}>{msg}</div>}


    <section className="settings-group"><h3>Preferences</h3>
      <Toggle label="Email notifications" checked={settings.emailAlerts} onChange={()=>toggle("emailAlerts")}/>
      <Toggle label="Chat notifications" checked={settings.messageAlerts} onChange={()=>toggle("messageAlerts")}/>
      <Toggle label="Public profile" checked={settings.publicProfile} onChange={()=>toggle("publicProfile")}/>
      <button type="button" className="settings-row settings-button" onClick={()=>{const root=document.documentElement;const next=root.dataset.theme==="dark"?"light":"dark";root.dataset.theme=next;window.localStorage.setItem("campus_mall_theme",next)}}><span className="settings-row-icon"><Palette size={18}/></span><strong>Appearance</strong><span/></button>
    </section>

  </div>;
}
