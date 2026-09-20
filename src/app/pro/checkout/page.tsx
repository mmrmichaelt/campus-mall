"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import PaymentMethodSelector, { type PaymentMethod } from "../../../components/PaymentMethodSelector";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") === "YEARLY" ? "YEARLY" : "MONTHLY";
  const amount = plan === "YEARLY" ? 1999 : 199;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MPESA");

  async function startCheckout() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/pro/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, paymentMethod }),
      });
      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/join";
        return;
      }

      if (!response.ok) throw new Error(data.error || "Unable to start payment.");

      if (data.paymentConfigured && data.stk) {
        setMessage(paymentMethod === "MPESA" ? "M-Pesa payment request sent. Check your phone and enter your M-Pesa PIN. Your Pro account will activate after payment confirmation." : "Payment method is configured. Continue through the provider checkout to complete payment.");
      } else {
        setMessage("This payment method is not configured on the server yet. Add its merchant credentials in Vercel environment variables before using it for live payments.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Campus Mall Pro checkout</h1>
        <p className="mt-2 text-gray-600">{plan === "YEARLY" ? "Yearly" : "Monthly"} plan — KSh {amount.toLocaleString()}</p>
        {error && <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-800">{message}</div>}
        <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
        <button onClick={startCheckout} disabled={loading} className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? "Starting payment..." : `Pay with ${paymentMethod === "MPESA" ? "M-Pesa" : paymentMethod.replaceAll("_", " ")}`}
        </button>
        <p className="mt-4 text-center text-xs text-gray-500">Your subscription becomes active only after the payment callback confirms the transaction.</p>
      </div>
    </main>
  );
}


export default function ProCheckoutPage() {
  return <Suspense fallback={<main className="mx-auto max-w-lg px-4 py-10">Loading checkout...</main>}><CheckoutContent /></Suspense>;
}
