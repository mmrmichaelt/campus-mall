"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Share2, ShoppingCart } from "lucide-react";

type Props = {
  listingId: string;
  sellerId: string;
  active: boolean;
};

export default function ListingEngagement({ listingId, sellerId, active }: Props) {
  const [data, setData] = useState<any>({
    likes: 0,
    favorites: 0,
    comments: [],
    liked: false,
    favorited: false,
  });
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    const response = await fetch("/api/listings/" + listingId + "/engagement", { cache: "no-store" });
    if (response.ok) setData(await response.json());
  }

  useEffect(() => {
    void load();
  }, [listingId]);

  async function act(action: string, body?: string) {
    setBusy(action);
    setMessage("");

    try {
      const response = await fetch("/api/listings/" + listingId + "/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, body }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.href = "/join?next=" + encodeURIComponent(window.location.pathname);
        return;
      }

      if (response.status === 403 && result.verificationRequired) {
        window.location.href = "/verify?next=" + encodeURIComponent(window.location.pathname);
        return;
      }

      if (!response.ok) throw new Error(result.error || "Unable to complete this action.");
      setData(result);
      if (action === "comment") setComment("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete this action.");
    } finally {
      setBusy("");
    }
  }

  async function share() {
    setBusy("share");
    setMessage("");

    try {
      const response = await fetch("/api/listings/" + listingId + "/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share", channel: "native" }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.href = "/join?next=" + encodeURIComponent(window.location.pathname);
        return;
      }

      if (response.status === 403 && result.verificationRequired) {
        window.location.href = "/verify?next=" + encodeURIComponent(window.location.pathname);
        return;
      }

      if (!response.ok) throw new Error(result.error || "Unable to share this listing.");

      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Listing link copied.");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setMessage(error.message);
    } finally {
      setBusy("");
    }
  }

  async function buyNow() {
    const phone = window.prompt("Enter the M-Pesa phone number for this purchase:");
    if (!phone) return;

    setBusy("order");
    setMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, phone }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.href = "/join?next=" + encodeURIComponent(window.location.pathname);
        return;
      }

      if (!response.ok) throw new Error(result.error || "Unable to start the order.");
      setMessage(result.stk ? "M-Pesa payment request sent. Complete it on your phone." : "Order created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start the order.");
    } finally {
      setBusy("");
    }
  }

  const chatHref = {
    pathname: "/chats",
    query: { listingId, withUserId: sellerId },
  };

  return (
    <section className="panel" style={{ marginTop: 20 }}>
      <h2>About this item</h2>

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
          <>
            <button className="primary-btn" type="button" disabled={!!busy} onClick={() => void buyNow()}>
              <ShoppingCart size={17} /> Buy now
            </button>
            <Link className="primary-btn" href={chatHref}>
              <MessageCircle size={17} /> Chat seller
            </Link>
          </>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (comment.trim()) void act("comment", comment.trim());
        }}
        style={{ marginTop: 16 }}
      >
        <label htmlFor="listing-comment-box">Comment on this item</label>
        <textarea
          id="listing-comment-box"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1000}
          placeholder="Ask a question or leave a comment about this item..."
          disabled={!active || !!busy}
        />
        <button className="primary-btn" type="submit" disabled={!comment.trim() || !!busy}>
          Post comment
        </button>
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
