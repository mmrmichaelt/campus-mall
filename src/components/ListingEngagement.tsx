"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, Bookmark, ShoppingCart } from "lucide-react";

type Props = { listingId: string; sellerId: string; active: boolean };

export default function ListingEngagement({ listingId, sellerId, active }: Props) {
  const [data, setData] = useState<any>({ likes: 0, favorites: 0, comments: [], liked: false, favorited: false });
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    const r = await fetch("/api/listings/" + listingId + "/engagement", { cache: "no-store" });
    if (r.ok) setData(await r.json());
  }
  useEffect(() => { void load(); }, [listingId]);

  async function act(action: string, body?: string) {
    setBusy(action); setMessage("");
    try {
      const r = await fetch("/api/listings/" + listingId + "/engagement", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, body }),
      });
      const result = await r.json().catch(() => ({}));
      if (r.status === 401) {
        window.location.href = "/join?next=" + encodeURIComponent(window.location.pathname) + "&action=" + action;
        return;
      }
      if (r.status === 403 && result.verificationRequired) {
        window.location.href = "/verify?next=" + encodeURIComponent(window.location.pathname);
        return;
      }
      if (!r.ok) throw new Error(result.error || "Unable to complete this action.");
      setData(result);
      if (action === "comment") setComment("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to complete this action.");
    } finally { setBusy(""); }
  }

  async function buyNow() {
    const phone = window.prompt("Enter the M-Pesa phone number for this purchase:");
    if (!phone) return;
    setBusy("order"); setMessage("");
    try {
      const r = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, phone }),
      });
      const result = await r.json().catch(() => ({}));
      if (r.status === 401) {
        window.location.href = "/join?next=" + encodeURIComponent(window.location.pathname) + "&action=order";
        return;
      }
      if (r.status === 403 && result.redirectTo) {
        window.location.href = result.redirectTo + "?next=" + encodeURIComponent(window.location.pathname);
        return;
      }
      if (!r.ok) throw new Error(result.error || "Unable to start the order.");
      setMessage(result.stk ? "M-Pesa payment request sent. Complete it on your phone." : "Order created.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to start the order.");
    } finally { setBusy(""); }
  }

  async function share() {
    setBusy("share"); setMessage("");
    try {
      const gate = await fetch("/api/listings/" + listingId + "/engagement", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share", channel: "pending" }),
      });
      const gateData = await gate.json().catch(() => ({}));
      if (gate.status === 401) {
        window.location.href = "/join?next=" + encodeURIComponent(window.location.pathname) + "&action=share";
        return;
      }
      if (gate.status === 403 && gateData.verificationRequired) {
        window.location.href = "/verify?next=" + encodeURIComponent(window.location.pathname);
        return;
      }
      if (!gate.ok) throw new Error(gateData.error || "Unable to share this listing.");

      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Listing link copied.");
      }
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") setMessage(e.message);
    } finally { setBusy(""); }
  }

  return (
    <section className="panel" style={{ marginTop: 20 }}>
      <div className="hero-actions">
        <button className="secondary-btn" type="button" disabled={!active || !!busy} onClick={() => void act("like")}>
          <Heart size={17} fill={data.liked ? "currentColor" : "none"} /> Like ({data.likes})
        </button>
        <button className="secondary-btn" type="button" disabled={!active || !!busy} onClick={() => document.getElementById("listing-comment-box")?.focus()}>
          <MessageCircle size={17} /> Comment ({data.comments.length})
        </button>
        <button className="secondary-btn" type="button" disabled={!active || !!busy} onClick={() => void share()}>
          <Share2 size={17} /> Share
        </button>
        <button className="secondary-btn" type="button" disabled={!active || !!busy} onClick={() => void act("favorite")}>
          <Bookmark size={17} fill={data.favorited ? "currentColor" : "none"} /> {data.favorited ? "Saved" : "Save"}
        </button>
        {active && (
          <button className="primary-btn" type="button" disabled={!active || !!busy} onClick={() => void buyNow()}><ShoppingCart size={17} /> Buy now</button>\n        <Link className="primary-btn" href={"/chats?listingId=" + listingId + "&withUserId=" + sellerId}>
            <MessageCircle size={17} /> Chat
          </Link>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (comment.trim()) void act("comment", comment.trim()); }} style={{ marginTop: 16 }}>
        <label htmlFor="listing-comment-box">Comment</label>
        <textarea id="listing-comment-box" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="Write a comment..." disabled={!active || !!busy} />
        <button className="primary-btn" type="submit" disabled={!comment.trim() || !!busy}>Post comment</button>
      </form>

      {message && <p className="note" role="status">{message}</p>}
      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {data.comments.map((item: any) => (
          <div key={item.id} className="panel" style={{ padding: 12 }}>
            <strong>{item.user.name}</strong>
            <p style={{ marginBottom: 0 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
