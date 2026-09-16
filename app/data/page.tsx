"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  type: "AIRTIME" | "DATA";
  network: string;
  name: string;
  description?: string | null;
  amount: number;
  providerCode: string;
};

const networks = [
  "SAFARICOM",
  "AIRTEL",
  "TELKOM",
  "FAIBA",
];

export default function DataAirtimePage() {
  const [type, setType] =
    useState<"DATA" | "AIRTIME">("DATA");

  const [network, setNetwork] =
    useState("SAFARICOM");

  const [products, setProducts] =
    useState<Product[]>([]);

  const [phone, setPhone] =
    useState("");

  const [selected, setSelected] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setMessage("");
      setSelected(null);

      try {
        const response = await fetch(
          `/api/digital/products?type=${type}&network=${network}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load products.",
          );
        }

        if (!cancelled) {
          setProducts(data.products || []);
        }
      } catch (error) {
        if (!cancelled) {
          setProducts([]);

          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load products.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [type, network]);

  const price = useMemo(() => {
    if (!selected) {
      return "";
    }

    return `KES ${selected.amount.toLocaleString()}`;
  }, [selected]);

  async function createOrder() {
    if (!selected) {
      setMessage(
        "Choose a data bundle or airtime product.",
      );

      return;
    }

    if (!phone.trim()) {
      setMessage(
        "Enter the recipient phone number.",
      );

      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/digital/purchase",
        {
          method: "POST",

          headers: {
            "content-type":
              "application/json",
          },

          body: JSON.stringify({
            productId: selected.id,
            phone,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create order.",
        );
      }

      setMessage(
        `Order ${data.order.id} created. Continue with payment to complete the purchase.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "28px 18px",
      }}
    >
      <h1>Data & Airtime</h1>

      <p>
        Buy mobile data bundles or airtime
        through Campus Mall.
      </p>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          margin: "20px 0",
        }}
      >
        <button
          type="button"
          onClick={() => setType("DATA")}
          aria-pressed={type === "DATA"}
        >
          Data bundles
        </button>

        <button
          type="button"
          onClick={() =>
            setType("AIRTIME")
          }
          aria-pressed={
            type === "AIRTIME"
          }
        >
          Airtime
        </button>
      </div>

      <label>
        Network

        <select
          value={network}
          onChange={(event) =>
            setNetwork(event.target.value)
          }
          style={{
            display: "block",
            width: "100%",
            padding: 12,
            marginTop: 6,
          }}
        >
          {networks.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </label>

      <label
        style={{
          display: "block",
          marginTop: 16,
        }}
      >
        Recipient phone number

        <input
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value)
          }
          placeholder="07XXXXXXXX"
          inputMode="tel"
          autoComplete="tel"
          style={{
            display: "block",
            width: "100%",
            padding: 12,
            marginTop: 6,
          }}
        />
      </label>

      <h2
        style={{
          marginTop: 24,
        }}
      >
        Available products
      </h2>

      {loading && (
        <p>Loading products…</p>
      )}

      {!loading &&
        !products.length && (
          <p>
            No products have been
            configured for this network
            yet.
          </p>
        )}

      <div
        style={{
          display: "grid",
          gap: 10,
        }}
      >
        {products.map((product) => (
          <button
            type="button"
            key={product.id}
            onClick={() =>
              setSelected(product)
            }
            style={{
              textAlign: "left",
              padding: 16,

              border:
                selected?.id === product.id
                  ? "2px solid #c9152d"
                  : "1px solid #ddd",

              borderRadius: 12,

              background: "#fff",
            }}
          >
            <strong>
              {product.name}
            </strong>

            {product.description && (
              <div>
                {product.description}
              </div>
            )}

            <b>
              KES{" "}
              {product.amount.toLocaleString()}
            </b>
          </button>
        ))}
      </div>

      {selected && (
        <section
          style={{
            marginTop: 24,
          }}
        >
          <p>
            Selected:{" "}
            <strong>
              {selected.name}
            </strong>{" "}
            — {price}
          </p>

          <button
            type="button"
            onClick={createOrder}
            disabled={loading}
          >
            {loading
              ? "Creating order…"
              : "Continue to payment"}
          </button>
        </section>
      )}

      {message && (
        <p
          role="status"
          style={{
            marginTop: 18,
          }}
        >
          {message}
        </p>
      )}
    </main>
  );
          }
