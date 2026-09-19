"use client";

import { useState } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";

const categories = [
"Accommodation",
"Beauty & dressing",
"Electronics",
"Food",
"Furniture",
"Jobs",
"Printing & photography",
"Stationery",
"Utensils",
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
const [busy, setBusy] = useState(false);
const [uploadingPhotos, setUploadingPhotos] = useState(false);
const [imageUrls, setImageUrls] = useState<string[]>([]);
const [photoMessage, setPhotoMessage] = useState("");

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
      imageUrl: imageUrls[0] || null,
      imageUrls,
      price: Number(data.price),
      currency: data.currency,
      location: data.location,
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

  window.location.href = "/";
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
    Post an item, food, job or service to your selected
    university. You remain the owner and can manage your
    listing from your account.
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
