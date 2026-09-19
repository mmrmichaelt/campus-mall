"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = "/join?next=/orders&action=orders";
        return;
      }
      if (!response.ok) throw new Error(data.error || "Unable to load orders.");
      setOrders(data.orders || []);
      setCurrentUserId(data.currentUserId || "");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to load orders.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function update(id: string, status: string) {
    setBusy(id); setMessage("");
    try {
      const response = await fetch("/api/orders/" + id, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to update order.");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to update order.");
    } finally { setBusy(""); }
  }

  if (loading) return <div className="panel"><h1>Orders</h1><p className="note">Loading orders...</p></div>;

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">CAMPUS MALL</p>
          <h1>Orders</h1>
          <p className="note">Track purchases and manage orders for listings you sell.</p>
        </div>
        <Link href="/" className="secondary-btn">Browse marketplace</Link>
      </div>
      {message && <p className="error" role="alert">{message}</p>}
      {!orders.length ? <div className="panel"><p>No orders yet.</p></div> : (
        <div style={{ display: "grid", gap: 14 }}>
          {orders.map((order) => (
            <div className="panel" key={order.id}>
              <div className="section-title">
                <div>
                  <p className="category">{order.status}</p>
                  <h2>{order.listing.title}</h2>
                  <p className="note">KSh {Number(order.amount).toLocaleString()} · Buyer: {order.buyer.name} · Seller: {order.seller.name}</p>
                </div>
                <Link href={`/listings/${order.listing.id}`} className="secondary-btn">View item</Link>
              </div>
              {currentUserId === order.seller?.id && (
                <div className="hero-actions">
                  {currentUserId === order.seller?.id && order.status === "PENDING" && (
                    <>
                      <button className="primary-btn" disabled={busy === order.id} onClick={() => void update(order.id, "ACCEPTED")}>Accept order</button>
                      <button className="danger-btn" disabled={busy === order.id} onClick={() => void update(order.id, "REJECTED")}>Reject order</button>
                      
                    </>
                  )}
                  {currentUserId === order.seller?.id && order.status === "ACCEPTED" && (
                    <button className="primary-btn" disabled={busy === order.id} onClick={() => void update(order.id, "COMPLETED")}>Mark completed</button>
                  )}
                </div>
              )}
              {currentUserId === order.buyer?.id && order.status === "PENDING" && (
                <div className="hero-actions">
                  <button className="secondary-btn" disabled={busy === order.id} onClick={() => void update(order.id, "CANCELLED")}>Cancel order</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
