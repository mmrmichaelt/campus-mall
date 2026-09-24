"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { countries } from "@/data/countries";

type Props = {
  sellerName: string;
  sellerCountry: string;
  sellerUniversity: string;
};

const categories = [
  "Accommodation","Beauty & dressing","Electronics","Food","Furniture","Jobs",
  "Printing & photography","Services","Stationery","Utensils","Other",
];

export default function NewListingForm({ sellerName, sellerCountry, sellerUniversity }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("Used");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [color, setColor] = useState("");
  const [delivery, setDelivery] = useState("Pickup");
  const [category, setCategory] = useState("Electronics");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [warranty, setWarranty] = useState("");
  const [location, setLocation] = useState("");
  const [institution] = useState(sellerUniversity);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: [brand, condition, model, color, year, warranty, delivery, location].filter(Boolean).join(" · ") || title.trim(),
          price,
          currency,
          category,
          institution: institution.trim(),
          imageUrl: imageUrl.trim(),
          location: location.trim(),
          details: {
            brand: brand.trim(),
            model: model.trim(),
            condition,
            color: color.trim(),
            year: year ? Number(year) : undefined,
            warranty: warranty.trim(),
            delivery,
          },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) { router.push("/account"); return; }
        if (response.status === 403) { router.push("/verify"); return; }
        throw new Error(data.error || "Unable to create listing.");
      }
      if (!data.listing?.id) throw new Error("Listing was created but no listing ID was returned.");
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
        {error && <div className="error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}

        <div className="form">
          <label>
            Title
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={150} required />
          </label>

          <label>
            Brand
            <input value={brand} onChange={e => setBrand(e.target.value)} maxLength={100} />
          </label>

          <label>
            Condition
            <select value={condition} onChange={e => setCondition(e.target.value)} required>
              <option>Used</option>
              <option>New</option>
            </select>
          </label>

          <label>
            Price
            <input type="number" inputMode="decimal" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
          </label>

          <label>
            Colour
            <input value={color} onChange={e => setColor(e.target.value)} maxLength={50} />
          </label>

          <label>
            Delivery option
            <select value={delivery} onChange={e => setDelivery(e.target.value)} required>
              <option>Pickup</option>
              <option>Delivery</option>
            </select>
          </label>

          <label>
            Category
            <select value={category} onChange={e => setCategory(e.target.value)} required>
              {categories.map(item => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label>
            Model
            <input value={model} onChange={e => setModel(e.target.value)} maxLength={100} />
          </label>

          <label>
            Year
            <input type="number" min="1900" max="2100" value={year} onChange={e => setYear(e.target.value)} />
          </label>

          <label>
            Warranty
            <input value={warranty} onChange={e => setWarranty(e.target.value)} maxLength={200} />
          </label>

          <label>
            Currency
            <select value={currency} onChange={e => setCurrency(e.target.value)} required>
              <option>KES</option><option>USD</option><option>GBP</option><option>EUR</option>
              <option>UGX</option><option>TZS</option><option>NGN</option><option>ZAR</option>
            </select>
          </label>

          <label>
            Institution
            <input value={institution} readOnly disabled aria-readonly="true" />
            <small className="note">Taken from your account profile. It cannot be changed while posting this item.</small>
          </label>

          <label>
            Location
            <input value={location} onChange={e => setLocation(e.target.value)} maxLength={200} required />
          </label>

          <label>
            Images
            <input type="url" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </label>

          <div className="panel">
            <strong>Seller information</strong>
            <div className="seller" style={{ marginTop: 10 }}>
              <strong>{sellerName}</strong>
              <small>{institution || "Institution selected above"}</small>
              <small>{sellerCountry}</small>
            </div>
          </div>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Creating listing..." : "Publish listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
