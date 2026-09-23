"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Trash2, Megaphone } from "lucide-react";
import PaymentMethodSelector, { type PaymentMethod } from "./PaymentMethodSelector";

type ListingStatus =
| "ACTIVE"
| "SOLD"
| "EXPIRED";

type Props = {
listingId: string;
status: ListingStatus;
};

export default function ListingActions({
listingId,
status,
}: Props) {
const router = useRouter();

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [promotionLoading, setPromotionLoading] = useState(false);
const [promotionMessage, setPromotionMessage] = useState("");
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MPESA");

async function updateStatus(
nextStatus: "SOLD" | "ACTIVE"
) {
setError("");

const confirmed =
  nextStatus === "SOLD"
    ? window.confirm(
        "Mark this listing as sold? It will immediately disappear from the public marketplace."
      )
    : window.confirm(
        "Reactivate this listing?"
      );

if (!confirmed) {
  return;
}

setLoading(true);

try {
  const response = await fetch(
    `/api/listings/${listingId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: nextStatus,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Unable to update listing."
    );
  }

  router.refresh();
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to update listing."
  );
} finally {
  setLoading(false);
}

}

async function promoteListing(days: number) {
  setPromotionLoading(true);
  setPromotionMessage("");
  try {
    const response = await fetch("/api/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, days, paymentMethod }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Unable to start promotion.");
    if (data.checkoutUrl) { window.location.href = data.checkoutUrl; return; }
    setPromotionMessage(
      data.paymentConfigured
        ? `${paymentMethod === "MPESA" ? "M-Pesa payment request sent. Complete it on your phone" : "Payment started with " + paymentMethod.replaceAll("_", " ") + ". Complete the provider checkout"}; the listing will become featured after confirmation.`
        : "Promotion created, but M-Pesa is not configured on the server yet."
    );
  } catch (err) {
    setPromotionMessage(err instanceof Error ? err.message : "Unable to start promotion.");
  } finally {
    setPromotionLoading(false);
  }
}

async function deleteListing() {
setError("");

const confirmed = window.confirm(
  "Delete this listing permanently? This cannot be undone."
);

if (!confirmed) {
  return;
}

setLoading(true);

try {
  const response = await fetch(
    `/api/listings/${listingId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Unable to delete listing."
    );
  }

  router.push("/listings");
  router.refresh();
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to delete listing."
  );
} finally {
  setLoading(false);
}

}

if (status === "EXPIRED") {
return (
<div className="listing-actions panel">
<p className="note">
This listing has expired.
</p>

    <button
      type="button"
      className="danger-btn"
      onClick={deleteListing}
      disabled={loading}
    >
      <Trash2 size={17} />

      {loading
        ? "Deleting..."
        : "Delete listing"}
    </button>

    {error && (
      <p className="error" role="alert">
        {error}
      </p>
    )}
  </div>
);

}

return (
<div className="listing-actions panel">
<p
className="category"
style={{ marginBottom: "5px" }}
>
SELLER CONTROLS
</p>

  <h3>Manage your listing</h3>

  {status === "ACTIVE" ? (
    <button
      type="button"
      className="danger-btn"
      onClick={() =>
        updateStatus("SOLD")
      }
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        marginBottom: "10px",
      }}
    >
      <CheckCircle size={17} />

      {loading
        ? "Updating..."
        : "Mark as sold"}
    </button>
  ) : (
    <div
      className="success"
      style={{
        marginBottom: "10px",
      }}
    >
      <strong>Sold</strong>

      <p
        style={{
          marginBottom: 0,
        }}
      >
        This listing is no longer visible in the
        public marketplace.
      </p>
    </div>
  )}

  <button
    type="button"
    className="danger-btn"
    onClick={deleteListing}
    disabled={loading}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px",
    }}
  >
    <Trash2 size={17} />

    {loading
      ? "Deleting..."
      : "Delete listing"}
  </button>

  <div style={{ marginTop: "16px" }}>
    <h4><Megaphone size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Boost item to reach more people</h4>
    
    <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} compact />
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {[1, 3, 7, 14, 30].map((days) => (
        <button key={days} type="button" className="secondary-btn" onClick={() => promoteListing(days)} disabled={promotionLoading}>
          {days} day{days === 1 ? "" : "s"}
        </button>
      ))}
    </div>
    {promotionMessage && <span role="status" className="note">{promotionMessage}</span>}
  </div>

  {error && (
    <p
      className="error"
      role="alert"
      style={{ marginTop: "12px" }}
    >
      {error}
    </p>
  )}
</div>

);
}
