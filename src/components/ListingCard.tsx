"use client";
import { ShoppingCart, MapPin, BadgeCheck, Tag } from "lucide-react";

export default function ListingCard({ item, onCart }: { item:any, onCart?: (id:string)=>void }) {
  return <article className={`listing-card ${item.promoted ? "promoted" : ""}`}>
    <div className="listing-photo">
      {item.pictureUrl ? <img src={item.pictureUrl} alt={item.title}/> : <div className="photo-placeholder"><Tag size={30}/><span>Campus Mall</span></div>}
      {item.promoted && <span className="promoted-label">PROMOTED</span>}
    </div>
    <div className="listing-body">
      <div className="listing-top"><span className="category">{item.category}</span><strong>KSh {Number(item.price).toLocaleString()}</strong></div>
      <h3>{item.title}</h3><p>{item.description}</p>
      <div className="meta"><span><MapPin size={14}/>{item.location}</span><span>{item.condition}</span></div>
      <div className="seller"><span>{item.seller?.name || "Seller"}</span>{item.seller?.verification === "Verified" && <BadgeCheck size={15}/>}<small>{item.seller?.university}</small></div>
      {onCart && <button className="primary-btn" onClick={()=>onCart(item.id)}><ShoppingCart size={17}/> Add to trolley</button>}
    </div>
  </article>
}
