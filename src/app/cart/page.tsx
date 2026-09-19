"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  PackageCheck,
} from "lucide-react";

type CartItem = {
  id: string;
  listingId: string;
  quantity: number;
  listing: {
    id: string;
    title: string;
    price: number | string;
    currency?: string;
    seller: {
      name: string;
      university: string;
    };
  };
};

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.href = "/join?next=/cart&action=cart";
        return;
      }
      if (!response.ok) {
        setItems([]);
        setMessage(data?.error || "Unable to load your trolley.");
        return;
      }

      setItems(data?.items ?? []);
    } catch {
      setItems([]);
      setMessage(
        "Unable to load your trolley right now."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(listingId: string) {
    setBusyId(listingId);
    setMessage("");

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          data?.error ||
            "Unable to remove this item."
        );
        return;
      }

      await load();
    } catch {
      setMessage(
        "Unable to remove this item right now."
      );
    } finally {
      setBusyId("");
    }
  }

  async function order(listingId: string) {
    setBusyId(listingId);
    setMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          paymentMethod: "To be agreed",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          data?.error ||
            "Unable to place this order."
        );
        return;
      }

      alert("Order placed successfully.");

      await load();
    } catch {
      setMessage(
        "Unable to place this order right now."
      );
    } finally {
      setBusyId("");
    }
  }

  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(item.listing.price) *
        item.quantity,
    0
  );

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">CAMPUS MALL</p>

          <h1>Your trolley</h1>

          <p className="note">
            Review items you've added before placing
            an order.
          </p>
        </div>

        <Link
          href="/"
          className="secondary-btn"
        >
          Continue shopping
        </Link>
      </div>

      {message && (
        <div
          className="error"
          role="alert"
          style={{ marginBottom: "20px" }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="panel">
          <p className="note">
            Loading your trolley...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="panel">
          <div
            style={{
              textAlign: "center",
              padding: "30px 15px",
            }}
          >
            <ShoppingCart
              size={48}
              style={{ marginBottom: "12px" }}
            />

            <h2>Your trolley is empty</h2>

            <p className="note">
              Browse the Campus Mall marketplace and
              add items you're interested in.
            </p>

            <Link
              href="/"
              className="primary-btn"
            >
              Browse marketplace
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => {
              const price = Number(
                item.listing.price
              );

              const itemTotal =
                price * item.quantity;

              const currency =
                item.listing.currency ||
                "KES";

              const busy =
                busyId === item.listingId;

              return (
                <div
                  className="cart-item"
                  key={item.id}
                >
                  <div>
                    <p className="category">
                      LISTING
                    </p>

                    <h3>
                      {item.listing.title}
                    </h3>

                    <p className="note">
                      Seller:{" "}
                      {item.listing.seller.name}
                    </p>

                    <p className="note">
                      {
                        item.listing.seller
                          .university
                      }
                    </p>

                    <strong>
                      {currency}{" "}
                      {Number.isFinite(price)
                        ? price.toLocaleString()
                        : "0"}
                    </strong>

                    <p className="note">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "12px",
                      }}
                    >
                      {currency}{" "}
                      {Number.isFinite(itemTotal)
                        ? itemTotal.toLocaleString()
                        : "0"}
                    </strong>

                    <div className="hero-actions">
                      <button
                        type="button"
                        className="primary-btn"
                        disabled={busy}
                        onClick={() =>
                          order(
                            item.listingId
                          )
                        }
                      >
                        <PackageCheck
                          size={17}
                        />

                        {busy
                          ? "Processing..."
                          : "Order"}
                      </button>

                      <button
                        type="button"
                        className="danger-btn"
                        disabled={busy}
                        onClick={() =>
                          remove(
                            item.listingId
                          )
                        }
                      >
                        <Trash2 size={17} />

                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-total">
            Total: KSh{" "}
            {total.toLocaleString()}
          </div>

          <p
            className="note"
            style={{ marginTop: "12px" }}
          >
            Payment arrangements are agreed between
            the buyer and seller.
          </p>
        </>
      )}
    </div>
  );
    }
