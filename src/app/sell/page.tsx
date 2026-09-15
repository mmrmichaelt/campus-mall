"use client";

import { useState } from "react";

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
      imageUrl: data.imageUrl || null,
      price: Number(data.price),
      currency: data.currency,
      location: data.location,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/join";
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

    <label>
      Picture URL
      <input
        type="url"
        value={data.imageUrl}
        onChange={(event) =>
          update("imageUrl", event.target.value)
        }
        placeholder="https://..."
      />
    </label>

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
