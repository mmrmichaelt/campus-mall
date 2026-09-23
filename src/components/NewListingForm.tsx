"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  sellerName: string;
  sellerCountry: string;
  sellerUniversity: string;
};

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

export default function NewListingForm({
  sellerName,
  sellerCountry,
  sellerUniversity,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [category, setCategory] = useState("Electronics");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState("Used");
  const [conditionNotes, setConditionNotes] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [year, setYear] = useState("");
  const [warranty, setWarranty] = useState("");
  const [negotiable, setNegotiable] = useState(true);
  const [delivery, setDelivery] = useState("Pickup");
  const [tags, setTags] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price,
          currency,
          category,
          imageUrl: imageUrl.trim(),
          location: location.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/account");
          return;
        }
        if (response.status === 403) {
          router.push("/verify");
          return;
        }
        throw new Error(data.error || "Unable to create listing.");
      }

      if (!data.listing?.id) {
        throw new Error("Listing was created but no listing ID was returned.");
      }

      setSuccess("Your listing has been created successfully.");
      router.push(`/listings/${data.listing.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="two-col">
      <form onSubmit={handleSubmit} className="panel">
        {error && (
          <div className="error" role="alert" style={{ marginBottom: "18px" }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success" style={{ marginBottom: "18px" }}>
            {success}
          </div>
        )}

        <div className="form">
          <div><p className="category">LISTING</p></div>

          <label>
            Title
            <input
              name="title"
              type="text"
              placeholder="e.g. Used HP laptop"
              value={title}
              onChange={event => setTitle(event.target.value)}
              maxLength={150}
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              placeholder="Describe the item, food, job or service..."
              value={description}
              onChange={event => setDescription(event.target.value)}
              maxLength={5000}
              rows={7}
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={category}
              onChange={event => setCategory(event.target.value)}
              required
            >
              {categories.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <div><p className="category">PRICE</p></div>

          <div className="two-col">
            <label>
              Price
              <input
                name="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0"
                value={price}
                onChange={event => setPrice(event.target.value)}
                required
              />
            </label>

            <label>
              Currency
              <select name="currency" value={currency} onChange={event => setCurrency(event.target.value)}>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="USD">USD — US Dollar</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="EUR">EUR — Euro</option>
                <option value="UGX">UGX — Ugandan Shilling</option>
                <option value="TZS">TZS — Tanzanian Shilling</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="ZAR">ZAR — South African Rand</option>
              </select>
            </label>
          </div>

          <div><p className="category">ITEM DETAILS</p></div>

          <div className="two-col">
            <label>
              Brand
              <input value={brand} onChange={event => setBrand(event.target.value)} placeholder="e.g. HP, Samsung, Nike" maxLength={100} />
            </label>
            <label>
              Model
              <input value={model} onChange={event => setModel(event.target.value)} placeholder="e.g. EliteBook 840 G8" maxLength={100} />
            </label>
          </div>

          <div className="two-col">
            <label>
              Condition
              <select value={condition} onChange={event => setCondition(event.target.value)}>
                <option>New</option>
                <option>Like new</option>
                <option>Used</option>
                <option>Good</option>
                <option>Fair</option>
                <option>For parts / repair</option>
              </select>
            </label>
            <label>
              Quantity
              <input type="number" min="1" max="100000" value={quantity} onChange={event => setQuantity(event.target.value)} />
            </label>
          </div>

          <label>
            Condition details
            <input value={conditionNotes} onChange={event => setConditionNotes(event.target.value)} placeholder="e.g. Minor scratches, fully working" maxLength={500} />
          </label>

          <div className="two-col">
            <label>
              Color
              <input value={color} onChange={event => setColor(event.target.value)} placeholder="e.g. Black" maxLength={50} />
            </label>
            <label>
              Size
              <input value={size} onChange={event => setSize(event.target.value)} placeholder="e.g. M, 42, 15.6 inch" maxLength={50} />
            </label>
          </div>

          <div className="two-col">
            <label>
              Material
              <input value={material} onChange={event => setMaterial(event.target.value)} placeholder="e.g. Leather, Cotton" maxLength={100} />
            </label>
            <label>
              Year
              <input type="number" min="1900" max="2100" value={year} onChange={event => setYear(event.target.value)} placeholder="e.g. 2024" />
            </label>
          </div>

          <div className="two-col">
            <label>
              Warranty
              <input value={warranty} onChange={event => setWarranty(event.target.value)} placeholder="e.g. 6 months / None" maxLength={200} />
            </label>
            <label>
              Delivery
              <select value={delivery} onChange={event => setDelivery(event.target.value)}>
                <option>Pickup</option>
                <option>Delivery available</option>
                <option>Pickup or delivery</option>
              </select>
            </label>
          </div>

          <label>
            Search tags
            <input value={tags} onChange={event => setTags(event.target.value)} placeholder="e.g. laptop, hp, core i5, student" maxLength={300} />
          </label>

          <label className="settings-toggle" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" checked={negotiable} onChange={event => setNegotiable(event.target.checked)} />
            Price is negotiable
          </label>

          <div><p className="category">LOCATION</p></div>

          <label>
            Location
            <input
              name="location"
              type="text"
              placeholder="e.g. Kisii University"
              value={location}
              onChange={event => setLocation(event.target.value)}
              maxLength={200}
              required
            />
          </label>

          <div><p className="category">IMAGE</p></div>

          <label>
            Image URL
            <input
              name="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={event => setImageUrl(event.target.value)}
            />
          </label>

          {imageUrl && (
            <div className="listing-photo" style={{ maxHeight: "320px", overflow: "hidden" }}>
              <img
                src={imageUrl}
                alt="Listing preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={event => { event.currentTarget.style.display = "none"; }}
              />
            </div>
          )}

          <div className="panel">
            <p className="category">SELLER</p>
            <h2>Your listing will show</h2>
            <div className="seller" style={{ marginTop: "12px" }}>
              <strong>{sellerName}</strong>
              <small>{sellerUniversity}</small>
              <small>{sellerCountry}</small>
            </div>
          </div>

          <div className="hero-actions">
            <button type="button" className="secondary-btn" onClick={() => router.back()} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Creating listing..." : "Publish listing"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
