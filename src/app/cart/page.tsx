"use client";
import { useEffect,useState } from "react";
export default function Cart(){const [items,setItems]=useState<any[]>([]);const [msg,setMsg]=useState("");
async function load(){const r=await fetch("/api/cart");if(r.ok)setItems((await r.json()).items);else setMsg("Log in to use your trolley.");}useEffect(()=>{load()},[]);
async function remove(id:string){await fetch("/api/cart",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({listingId:id})});load()}
async function order(id:string){const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({listingId:id,paymentMethod:"To be agreed"})});const x=await r.json();alert(r.ok?"Order placed.":x.error);load()}
const total=items.reduce((s,x)=>s+x.listing.price*x.quantity,0);
return <><h1>Your trolley</h1>{msg&&<div className="error">{msg}</div>}<div className="cart-list">{items.map(x=><div className="cart-item" key={x.id}><div><b>{x.listing.title}</b><p className="note">{x.listing.seller.name} · {x.listing.seller.university}</p><strong>KSh {x.listing.price.toLocaleString()}</strong></div><div><button className="primary-btn" onClick={()=>order(x.listingId)}>Order</button> <button className="danger-btn" onClick={()=>remove(x.listingId)}>Remove</button></div></div>)}</div><p className="cart-total">Total: KSh {total.toLocaleString()}</p></>
}
