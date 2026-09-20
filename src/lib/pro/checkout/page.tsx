"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ProCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const plan = searchParams.get("plan") === "YEARLY"
    ? "YEARLY"
    : "MONTHLY";

  const amount = plan === "YEARLY" ? 1999 : 199;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pro/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start payment.");
      }

      if (!data.paymentConfigured) {
        throw new Error(
          "M-Pesa payment is not configured yet. Please try again after payment credentials are configured."
        );
      }

      if (data.stk?.CheckoutRequestID) {
        router.push("/account/pro");
        return;
      }

      throw new Error("Payment provider did not return a checkout request.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment."
      );
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-lg rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Campus Mall Pro</h1>

        <div className="mt-6 rounded-xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Selected plan
          </p>

          <p className="mt-1 text-lg font-semibold">
            {plan === "YEARLY" ? "Pro Yearly" : "Pro Monthly"}
          </p>

          <p className="mt-3 text-3xl font-bold">
            KSh {amount.toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={startCheckout}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Starting payment..." : "Continue to payment"}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          Your Pro status will only become active after the payment
          provider confirms the transaction.
        </p>
      </div>
    </main>
  );
}
