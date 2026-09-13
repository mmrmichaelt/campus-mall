"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  sellerName: string;
  sellerCountry: string;
  sellerUniversity: string;
};

const categories = [
  {
    value: "items",
    label: "Items",
    description: "Electronics, clothes, books and other products",
  },
  {
    value: "food",
    label: "Food",
    description: "Meals, snacks, drinks and other food",
  },
  {
    value: "jobs",
    label: "Jobs",
    description: "Part-time jobs and opportunities",
  },
  {
    value: "services",
    label: "Services",
    description: "Skills, repairs, tutoring and other services",
  },
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
  const [category, setCategory] = useState("items");
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
          title,
          description,
          price,
          currency,
          category,
          imageUrl,
          location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create listing."
        );
      }

      if (!data.listing?.id) {
        throw new Error(
          "Listing was created but no listing ID was returned."
        );
      }

      setSuccess("Your listing has been created.");

      router.push(`/listings/${data.listing.id}`);
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

  return (
    <div className="new-listing-layout">
      <form
        onSubmit={handleSubmit}
        className="new-listing-form"
      >
        {error && (
          <div
            className="form-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div className="form-success">
            {success}
          </div>
        )}

        <div className="form-section">
          <div className="form-section-heading">
            <p className="eyebrow">LISTING DETAILS</p>

            <h2>What are you offering?</h2>

            <p>
              Give buyers enough information to understand
              what you are selling or offering.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="listing-title">
              Title
            </label>

            <input
              id="listing-title"
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

            <small>
              {title.length}/150 characters
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="listing-description">
              Description
            </label>

            <textarea
              id="listing-description"
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

            <small>
              {description.length}/5000 characters
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="listing-category">
              Category
            </label>

            <select
              id="listing-category"
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
                  {item.label}
                </option>
              ))}
            </select>

            <small>
              {
                categories.find(
                  (item) => item.value === category
                )?.description
              }
            </small>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <p className="eyebrow">PRICE</p>

            <h2>Set your price</h2>

            <p>
              Enter zero if the listing is free.
            </p>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="listing-price">
                Price
              </label>

              <input
                id="listing-price"
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
            </div>

            <div className="form-field">
              <label htmlFor="listing-currency">
                Currency
              </label>

              <select
                id="listing-currency"
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
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <p className="eyebrow">LOCATION</p>

            <h2>Where is it available?</h2>
          </div>

          <div className="form-field">
            <label htmlFor="listing-location">
              Location
            </label>

            <input
              id="listing-location"
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

            <small>
              Give buyers a useful campus, town or area.
            </small>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <p className="eyebrow">IMAGE</p>

            <h2>Add a listing image</h2>

            <p>
              You can provide an image URL. Image uploads
              can be connected to cloud storage later.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="listing-image">
              Image URL
            </label>

            <input
              id="listing-image"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(event) =>
                setImageUrl(event.target.value)
              }
            />

            <small>
              Leave this empty if you do not have an image.
            </small>
          </div>

          {imageUrl && (
            <div className="image-preview">
              <img
                src={imageUrl}
                alt="Listing preview"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            </div>
          )}
        </div>

        <div className="seller-information">
          <p className="eyebrow">SELLER</p>

          <h2>Your listing will show</h2>

          <div className="seller-preview">
            <strong>{sellerName}</strong>

            <span>{sellerUniversity}</span>

            <span>{sellerCountry}</span>
          </div>
        </div>

        <div className="listing-form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={submitting}
          >
            {submitting
              ? "Creating listing..."
              : "Publish listing"}
          </button>
        </div>
      </form>

      <aside className="listing-help-card">
        <p className="eyebrow">SELL SAFELY</p>

        <h2>Good listings get attention.</h2>

        <ul>
          <li>Use a clear and honest title.</li>
          <li>Describe the condition accurately.</li>
          <li>Use a useful location.</li>
          <li>Set a realistic price.</li>
          <li>Never share your password.</li>
          <li>
            Mark the listing as sold when it is no longer
            available.
          </li>
        </ul>
      </aside>
    </div>
  );
              }
