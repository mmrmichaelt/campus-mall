"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, ShieldCheck } from "lucide-react";

type Props = {
  sellerName: string;
  sellerCountry: string;
  sellerUniversity: string;
};

const categories = [
  {
    value: "Accommodation",
    description:
      "Hostels, rooms, apartments and accommodation",
  },
  {
    value: "Beauty & dressing",
    description:
      "Beauty products, clothing and dressing",
  },
  {
    value: "Electronics",
    description:
      "Phones, laptops, accessories and electronics",
  },
  {
    value: "Food",
    description:
      "Meals, snacks, drinks and other food",
  },
  {
    value: "Furniture",
    description:
      "Beds, chairs, tables and other furniture",
  },
  {
    value: "Jobs",
    description:
      "Part-time jobs and other opportunities",
  },
  {
    value: "Printing & photography",
    description:
      "Printing, photography and related services",
  },
  {
    value: "Stationery",
    description:
      "Books, pens, papers and school supplies",
  },
  {
    value: "Utensils",
    description:
      "Kitchen utensils and household items",
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
          <div>
            <p className="category">
              LISTING DETAILS
            </p>

            <h2>What are you offering?</h2>

            <p className="note">
              Give buyers enough information to
              understand what you are selling or
              offering.
            </p>
          </div>

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
            <small className="note">
              {title.length}/150 characters
            </small>
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
            <small className="note">
              {description.length}/5000 characters
            </small>
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
              <small className="note">
                {selectedCategory.description}
              </small>
            )}
          </label>

          <div>
            <p className="category">PRICE</p>

            <h2>Set your price</h2>

            <p className="note">
              Enter zero if the listing is free.
            </p>
          </div>

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

          <div>
            <p className="category">LOCATION</p>

            <h2>Where is it available?</h2>
          </div>

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
            <small className="note">
              Give buyers a useful campus, town or
              area.
            </small>
          </label>

          <div>
            <p className="category">IMAGE</p>

            <h2>Add a listing image</h2>

            <p className="note">
              Add an image URL if you have a publicly
              accessible image.
            </p>
          </div>

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

            <small className="note">
              Leave this empty if you do not have an
              image.
            </small>
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

      <aside className="panel">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <ShieldCheck size={22} />

          <p className="category">
            SELL SAFELY
          </p>
        </div>

        <h2>Good listings get attention.</h2>

        <ul
          style={{
            paddingLeft: "20px",
            lineHeight: 1.8,
          }}
        >
          <li>Use a clear and honest title.</li>
          <li>
            Describe the condition accurately.
          </li>
          <li>Use a useful location.</li>
          <li>Set a realistic price.</li>
          <li>Never share your password.</li>
          <li>
            Mark the listing as sold when it is no
            longer available.
          </li>
        </ul>

        <div
          className="panel"
          style={{
            marginTop: "18px",
            background: "var(--red-light)",
          }}
        >
          <ImageIcon
            size={20}
            style={{ marginBottom: "8px" }}
          />

          <p className="note">
            A clear image can help buyers understand
            your listing before contacting you.
          </p>
        </div>
      </aside>
    </div>
  );
}
