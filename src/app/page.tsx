"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, SlidersHorizontal, MapPin } from "lucide-react";
import ListingCard from "@/components/ListingCard";

const cats=["Accommodation","Beauty & dressing","Electronics","Food","Furniture","Jobs","Printing & photography","Stationery","Utensils"];

export default function Home() {
  const [items,setItems]=useState<any[]>([]); const [user,setUser]=useState<any>(null); const [loading,setLoading]=useState(true);
  const [q,setQ]=useState(""); const [category,setCategory]=useState(""); const [condition,setCondition]=useState("");
  useEffect(()=>{ fetch("/api/me").then(r=>r.json()).then(x=>setUser(x.user)); },[]);
  useEffect(()=>{ const url=new URL("/api/listings",location.origin); if(q)url.searchParams.set("q",q);if(category)url.searchParams.set("category",category);if(condition)url.searchParams.set("condition",condition); fetch(url).then(r=>r.json()).then(x=>{setItems(x.listings||[]);setLoading(false)}); },[q,category,condition]);
  async function cart(id:string){ if(!user){location.href="/join";return;} const r=await fetch("/api/cart",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({listingId:id})}); const x=await r.json(); alert(r.ok?"Added to trolley.":x.error); }
  return <><section className="hero"><h1>Campus Mall</h1><p>Your campus marketplace for students and outsiders. See items posted around <b>{user?.university || "your selected university"}</b>, buy, sell, chat and manage orders in one place.</p><div className="hero-actions"><Link className="primary-btn" href="/sell"><PlusCircle size={18}/> Add item</Link>{!user&&<Link className="secondary-btn" href="/join">Create account</Link>}</div></section>
    <div className="section-title"><h2>Marketplace</h2>{user&&<span className="note"><MapPin size={14}/> Showing your university</span>}</div>
    <div className="filterbar"><input placeholder="Search this campus..." value={q} onChange={e=>setQ(e.target.value)}/><select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{cats.map(c=><option key={c}>{c}</option>)}</select><select value={condition} onChange={e=>setCondition(e.target.value)}><option value="">All conditions</option><option>New</option><option>Used - like new</option><option>Used</option></select><SlidersHorizontal size={20} style={{margin:"10px"}}/></div>
    {loading?<p>Loading marketplace...</p>:items.length?<div className="listing-grid">{items.map(x=><ListingCard key={x.id} item={x} onCart={cart}/>)}</div>:<div className="panel"><h3>No active items found</h3><p className="note">Try another category/search, or add the first item for your university.</p></div>}
  </>
}
