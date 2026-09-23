"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, ShieldCheck } from "lucide-react";

type Props = {
  sellerName: string;
  sellerCountry: string;
  sellerUniversity: string;
};

const categories = ["Accommodation","Beauty & dressing","Electronics","Food","Furniture","Jobs","Printing & photography","Services","Stationery","Utensils"];

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
  const [category, setCategory] =
    useState("Electronics");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/account");
          return;
        }

        if (response.status === 403) {
          router.push("/verify");
          return;
        }

        throw new Error(
          data.error ||
            "Unable to create listing."
        );
      }

      if (!data.listing?.id) {
        throw new Error(
          "Listing was created but no listing ID was returned."
        );
      }

      setSuccess(
        "Your listing has been created successfully."
      );

      router.push(
        `/listings/${data.listing.id}`
      );
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create listing. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCategory = categories.find(
    (item) => item.value === category
  );

  return (
    <div className="two-col">
      <form
        onSubmit={handleSubmit}
        className="panel"
      >
        {error && (
          <div
            className="error"
            role="alert"
            style={{ marginBottom: "18px" }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="success"
            style={{ marginBottom: "18px" }}
          >
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
              onChange={(event) =>
                setTitle(event.target.value)
              }
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
              onChange={(event) =>
                setDescription(event.target.value)
              }
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
              onChange={(event) =>
                setCategory(event.target.value)
              }
              required
            >
              {categories.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.value}
                </option>
              ))}
            </select>

            {selectedCategory && (
              
            )}
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
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                required
              />
            </label>

            <label>
              Currency
              <select
                name="currency"
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value)
                }
              >
                <option value="KES">
                  KES — Kenyan Shilling
                </option>
                <option value="USD">
                  USD — US Dollar
                </option>
                <option value="GBP">
                  GBP — British Pound
                </option>
                <option value="EUR">
                  EUR — Euro
                </option>
                <option value="UGX">
                  UGX — Ugandan Shilling
                </option>
                <option value="TZS">
                  TZS — Tanzanian Shilling
                </option>
                <option value="NGN">
                  NGN — Nigerian Naira
                </option>
                <option value="ZAR">
                  ZAR — South African Rand
                </option>
              </select>
            </label>
          </div>

          <div><p className="category">LOCATION</p></div>

          <label>
            Location
            <input
              name="location"
              type="text"
              placeholder="e.g. Kisii University"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
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
              onChange={(event) =>
                setImageUrl(event.target.value)
              }
            />

            
          </label>

          {imageUrl && (
            <div
              className="listing-photo"
              style={{
                maxHeight: "320px",
                overflow: "hidden",
              }}
            >
              <img
                src={imageUrl}
                alt="Listing preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            </div>
          )}

          <div className="panel">
            <p className="category">SELLER</p>

            <h2>Your listing will show</h2>

            <div
              className="seller"
              style={{
                marginTop: "12px",
              }}
            >
              <strong>{sellerName}</strong>
              <small>{sellerUniversity}</small>
              <small>{sellerCountry}</small>
            </div>
          </div>

          <div className="hero-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={submitting}
            >
              {submitting
                ? "Creating listing..."
                : "Publish listing"}
            </button>
          </div>
        </div>
      </form>

      
    </div>
  );
}
