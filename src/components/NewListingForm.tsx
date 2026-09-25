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
  "Printing & photography","Recreation","Services","Stationery","Utensils","Other",
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
              <option>KES</option>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>UGX</option>
              <option>TZS</option>
              <option>NGN</option>
              <option>ZAR</option>
              <option>AED</option>
              <option>AFN</option>
              <option>ALL</option>
              <option>AMD</option>
              <option>ANG</option>
              <option>AOA</option>
              <option>ARS</option>
              <option>AUD</option>
              <option>AWG</option>
              <option>AZN</option>
              <option>BAM</option>
              <option>BBD</option>
              <option>BDT</option>
              <option>BGN</option>
              <option>BHD</option>
              <option>BIF</option>
              <option>BMD</option>
              <option>BND</option>
              <option>BOB</option>
              <option>BRL</option>
              <option>BSD</option>
              <option>BTN</option>
              <option>BWP</option>
              <option>BYN</option>
              <option>BZD</option>
              <option>CAD</option>
              <option>CDF</option>
              <option>CHF</option>
              <option>CLP</option>
              <option>CNY</option>
              <option>COP</option>
              <option>CRC</option>
              <option>CUP</option>
              <option>CVE</option>
              <option>CZK</option>
              <option>DJF</option>
              <option>DKK</option>
              <option>DOP</option>
              <option>DZD</option>
              <option>EGP</option>
              <option>ERN</option>
              <option>ETB</option>
              <option>FJD</option>
              <option>FKP</option>
              <option>GEL</option>
              <option>GHS</option>
              <option>GIP</option>
              <option>GMD</option>
              <option>GNF</option>
              <option>GTQ</option>
              <option>GYD</option>
              <option>HKD</option>
              <option>HNL</option>
              <option>HTG</option>
              <option>HUF</option>
              <option>IDR</option>
              <option>ILS</option>
              <option>INR</option>
              <option>IQD</option>
              <option>IRR</option>
              <option>ISK</option>
              <option>JMD</option>
              <option>JOD</option>
              <option>JPY</option>
              <option>KGS</option>
              <option>KHR</option>
              <option>KMF</option>
              <option>KPW</option>
              <option>KRW</option>
              <option>KWD</option>
              <option>KYD</option>
              <option>KZT</option>
              <option>LAK</option>
              <option>LBP</option>
              <option>LKR</option>
              <option>LRD</option>
              <option>LSL</option>
              <option>LYD</option>
              <option>MAD</option>
              <option>MDL</option>
              <option>MGA</option>
              <option>MKD</option>
              <option>MMK</option>
              <option>MNT</option>
              <option>MOP</option>
              <option>MRU</option>
              <option>MUR</option>
              <option>MVR</option>
              <option>MWK</option>
              <option>MXN</option>
              <option>MYR</option>
              <option>MZN</option>
              <option>NAD</option>
              <option>NIO</option>
              <option>NOK</option>
              <option>NPR</option>
              <option>NZD</option>
              <option>OMR</option>
              <option>PAB</option>
              <option>PEN</option>
              <option>PGK</option>
              <option>PHP</option>
              <option>PKR</option>
              <option>PLN</option>
              <option>PYG</option>
              <option>QAR</option>
              <option>RON</option>
              <option>RSD</option>
              <option>RUB</option>
              <option>RWF</option>
              <option>SAR</option>
              <option>SBD</option>
              <option>SCR</option>
              <option>SDG</option>
              <option>SEK</option>
              <option>SGD</option>
              <option>SHP</option>
              <option>SLE</option>
              <option>SOS</option>
              <option>SRD</option>
              <option>SSP</option>
              <option>STN</option>
              <option>SVC</option>
              <option>SYP</option>
              <option>SZL</option>
              <option>THB</option>
              <option>TJS</option>
              <option>TMT</option>
              <option>TND</option>
              <option>TOP</option>
              <option>TRY</option>
              <option>TTD</option>
              <option>TWD</option>
              <option>UAH</option>
              <option>UYU</option>
              <option>UZS</option>
              <option>VES</option>
              <option>VND</option>
              <option>VUV</option>
              <option>WST</option>
              <option>XAF</option>
              <option>XCD</option>
              <option>XOF</option>
              <option>XPF</option>
              <option>YER</option>
              <option>ZMW</option>
              <option>ZWG</option>
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
