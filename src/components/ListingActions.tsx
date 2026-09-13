"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <div className="listing-actions">
        <div className="listing-action-status">
          This listing has expired.
        </div>

        <button
          type="button"
          className="danger-button"
          onClick={deleteListing}
          disabled={loading}
        >
          {loading
            ? "Deleting..."
            : "Delete listing"}
        </button>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="listing-actions">
      <p className="eyebrow">
        SELLER CONTROLS
      </p>

      <h3>Manage your listing</h3>

      {status === "ACTIVE" ? (
        <button
          type="button"
          className="sold-button"
          onClick={() =>
            updateStatus("SOLD")
          }
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Mark as sold"}
        </button>
      ) : (
        <div className="listing-action-status">
          <strong>Sold</strong>

          <p>
            This listing is no longer visible in the
            public marketplace.
          </p>
        </div>
      )}

      <button
        type="button"
        className="danger-button"
        onClick={deleteListing}
        disabled={loading}
      >
        {loading
          ? "Deleting..."
          : "Delete listing"}
      </button>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
