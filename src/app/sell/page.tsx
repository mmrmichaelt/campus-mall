"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import PaymentMethodSelector, { type PaymentMethod } from "../../components/PaymentMethodSelector";

const categories = [
  "Accommodation",
  "Beauty & dressing",
  "Electronics",
  "Food",
  "Furniture",
  "Jobs",
  "Printing & photography",
  "Services",
  "Stationery",
  "Utensils",
  "Other",
];

export default function SellPage() {
const [data, setData] = useState({
title: "",
description: "",
category: "Electronics",
imageUrl: "",
price: "",
currency: "KES",
location: "",
});

const [message, setMessage] = useState("");
const [institution, setInstitution] = useState("");
const [busy, setBusy] = useState(false);
const [uploadingPhotos, setUploadingPhotos] = useState(false);
const [imageUrls, setImageUrls] = useState<string[]>([]);
const [photoMessage, setPhotoMessage] = useState("");
const [boostDays, setBoostDays] = useState("0");
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MPESA");

useEffect(() => {
  const controller = new AbortController();
  fetch("/api/profile", { signal: controller.signal, cache: "no-store" })
    .then((response) => response.json())
    .then((result) => {
      const savedInstitution = result?.profile?.university;
      if (typeof savedInstitution === "string") setInstitution(savedInstitution);
    })
    .catch((error) => {
      if (error?.name !== "AbortError") setInstitution("");
    });
  return () => controller.abort();
}, []);

function update(field: string, value: string) {
setData((current) => ({
...current,
[field]: value,
}));
}

async function submit(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

setMessage("");
setBusy(true);

try {
  const response = await fetch("/api/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      category: data.category,
      institution: institution.trim(),
      imageUrl: imageUrls[0] || null,
      imageUrls,
      price: Number(data.price),
      currency: data.currency,
      location: data.location,
      boostDays: Number(boostDays),
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/join?next=/sell&action=sell";
      return;
    }

    if (response.status === 403 && result.redirectTo) {
      window.location.href = result.redirectTo + "?next=/sell";
      return;
    }

    setMessage(
      result.error ||
        "Unable to post this item. Please try again."
    );
    return;
  }

  if (Number(boostDays) > 0 && result.listing?.id) {
    try {
      const promotionResponse = await fetch("/api/promote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: result.listing.id, days: Number(boostDays), paymentMethod }) });
      const promotion = await promotionResponse.json().catch(() => ({}));
      if (!promotionResponse.ok) throw new Error(promotion.error || "Unable to start the boost.");
      if (promotion.checkoutUrl) { window.location.href = promotion.checkoutUrl; return; }
    } catch (error) {
      setMessage(error instanceof Error ? `${error.message} You can boost this item later from its page.` : "Item posted. You can boost it later from its page.");
      window.setTimeout(() => { window.location.href = result.redirectTo || `/listings/${result.listing.id}`; }, 900);
      return;
    }
  }
  window.location.href = result.redirectTo || `/listings/${result.listing.id}`;
} catch {
  setMessage(
    "Unable to connect to Campus Mall. Please check your internet connection."
  );
} finally {
  setBusy(false);
}

}

return (
<div className="panel">
<h1>Add item</h1>

  <p className="note">
    Post an item, food, job or service and choose the institution where it is posted. You remain the owner and can manage your listing from your account.
  </p>

  <form className="form" onSubmit={submit}>
    <label>
      Item name
      <input
        required
        value={data.title}
        onChange={(event) =>
          update("title", event.target.value)
        }
        placeholder="e.g. HP laptop"
      />
    </label>

    <label>
      Description
      <textarea
        required
        value={data.description}
        onChange={(event) =>
          update("description", event.target.value)
        }
        placeholder="Describe the item, food, job or service..."
      />
    </label>

    <label>
      Category
      <select
        required
        value={data.category}
        onChange={(event) =>
          update("category", event.target.value)
        }
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </label>

    <label>
      Institution
      <input required value={institution} readOnly disabled aria-readonly="true" />
      <small className="note">Taken automatically from your account profile. It cannot be changed while posting this item.</small>
    </label>

    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">PHOTOS</p>
          <h2>Upload photos</h2>
          <p className="note">Select up to 5 photos from your phone or computer. No photo URL is required.</p>
        </div>
        <ImageIcon size={24} />
      </div>

      <label>
        Photos
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={async (event) => {
            const files = Array.from(event.target.files || []);
            if (!files.length) return;
            if (files.length > 5) {
              setPhotoMessage("You can upload up to 5 photos.");
              event.target.value = "";
              return;
            }
            setUploadingPhotos(true);
            setPhotoMessage("");
            setMessage("");
            try {
              const formData = new FormData();
              files.forEach((file) => formData.append("files", file));
              const response = await fetch("/api/uploads", { method: "POST", body: formData });
              const result = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(result.error || "Unable to upload photos.");
              }
              setImageUrls(result.urls || []);
              setPhotoMessage(`${(result.urls || []).length} photo(s) uploaded successfully.`);
            } catch (error) {
              setPhotoMessage(error instanceof Error ? error.message : "Unable to upload photos.");
            } finally {
              setUploadingPhotos(false);
              event.target.value = "";
            }
          }}
        />
      </label>

      {uploadingPhotos && <p className="note"><Upload size={15} /> Uploading photos...</p>}

      {imageUrls.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 10, marginTop: 12 }}>
          {imageUrls.map((url, index) => (
            <div key={url} style={{ position: "relative" }}>
              <img src={url} alt={`Listing photo ${index + 1}`} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 12 }} />
              <button
                type="button"
                className="secondary-btn"
                aria-label={`Remove photo ${index + 1}`}
                onClick={() => setImageUrls((current) => current.filter((item) => item !== url))}
                style={{ position: "absolute", top: 5, right: 5, minWidth: 34, padding: 6 }}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {photoMessage && <p className="success">{photoMessage}</p>}

      <p className="note" style={{ marginTop: 8 }}>
        Maximum 5 photos, 4 MB each. JPG, PNG, WEBP or GIF.
      </p>
    </div>



    <label>
      Price
      <input
        required
        type="number"
        min="0"
        step="0.01"
        value={data.price}
        onChange={(event) =>
          update("price", event.target.value)
        }
        placeholder="0"
      />
    </label>

    <label>
      Currency
      <select
        required
        value={data.currency}
        onChange={(event) =>
          update("currency", event.target.value)
        }
      >
        <option value="KES">KES — Kenyan Shilling</option>
        <option value="USD">USD — US Dollar</option>
        <option value="EUR">EUR — Euro</option>
        <option value="GBP">GBP — Pound Sterling</option>
      </select>
    </label>

    <div className="panel" style={{ marginTop: 4, marginBottom: 0 }}>
      <p className="category">ADVERTISING & PROMOTION</p>
      <h2>Boost item to reach more people</h2>
      <p className="note">Optional paid promotion. Your item will still be posted for free if you skip this. You can boost it later from the item page.</p>
      <label>
        Boost duration
        <select value={boostDays} onChange={(event) => setBoostDays(event.target.value)}>
          <option value="0">No boost — free listing</option>
          <option value="1">1 day — KES 50</option>
          <option value="3">3 days — KES 120</option>
          <option value="7">7 days — KES 250</option>
          <option value="14">14 days — KES 450</option>
          <option value="30">30 days — KES 800</option>
        </select>
      </label>
      <p className="note" style={{ marginBottom: 8 }}>These are Campus Mall promotion/advertising fees. If selected, the chosen payment method is started after your item is created.</p>
      {Number(boostDays) > 0 && <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} compact />}
    </div>

    <label>
      Location
      <input
        required
        value={data.location}
        onChange={(event) =>
          update("location", event.target.value)
        }
        placeholder="Hostel, town, building..."
      />
    </label>

    {message && (
      <div className="error" role="alert">
        {message}
      </div>
    )}

    <button
      type="submit"
      className="primary-btn"
      disabled={busy}
    >
      {busy ? "Posting..." : "Post item"}
    </button>
  </form>
</div>

);
}
