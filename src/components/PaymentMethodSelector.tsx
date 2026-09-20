"use client";

import { useEffect, useState } from "react";

export type PaymentMethod =
  | "MPESA"
  | "AIRTEL_MONEY"
  | "CARD"
  | "BANK_TRANSFER"
  | "PESALINK"
  | "MOBILE_MONEY"
  | "PAYPAL"
  | "APPLE_PAY"
  | "GOOGLE_PAY"
  | "STRIPE"
  | "FLUTTERWAVE"
  | "PAYSTACK"
  | "CASH_ON_DELIVERY";

export const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
}> = [
  { id: "MPESA", label: "M-Pesa", description: "STK Push for supported Kenyan payments" },
  { id: "AIRTEL_MONEY", label: "Airtel Money", description: "Airtel mobile-money checkout when configured" },
  { id: "CARD", label: "Visa / Mastercard", description: "Debit or credit card checkout" },
  { id: "BANK_TRANSFER", label: "Bank transfer", description: "Direct bank payment" },
  { id: "PESALINK", label: "PesaLink", description: "Kenyan bank-to-bank payment" },
  { id: "MOBILE_MONEY", label: "Other mobile money", description: "Supported mobile-money networks by country" },
  { id: "PAYPAL", label: "PayPal", description: "PayPal checkout" },
  { id: "APPLE_PAY", label: "Apple Pay", description: "Wallet checkout where supported" },
  { id: "GOOGLE_PAY", label: "Google Pay", description: "Wallet checkout where supported" },
  { id: "STRIPE", label: "Stripe", description: "Stripe checkout and supported local methods" },
  { id: "FLUTTERWAVE", label: "Flutterwave", description: "Flutterwave hosted checkout" },
  { id: "PAYSTACK", label: "Paystack", description: "Paystack hosted checkout" },
  { id: "CASH_ON_DELIVERY", label: "Cash on delivery / in person", description: "Pay the seller in person" },
];

type Props = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  compact?: boolean;
};

export default function PaymentMethodSelector({ value, onChange, compact = false }: Props) {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/payments/methods", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data?.methods) {
          setAvailability(Object.fromEntries(data.methods.map((method: { id: string; configured: boolean }) => [method.id, method.configured])));
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="panel" style={{ marginTop: compact ? 10 : 16, padding: compact ? 12 : 16 }}>
      <p className="category">PAYMENT METHOD</p>
      <label>
        Choose how you want to pay
        <select value={value} onChange={(event) => onChange(event.target.value as PaymentMethod)}>
          {PAYMENT_METHODS.map((method) => (
            <option key={method.id} value={method.id}>
              {method.label}{availability[method.id] === false ? " — setup required" : ""}
            </option>
          ))}
        </select>
      </label>
      <p className="note" style={{ marginBottom: 0 }}>
        {PAYMENT_METHODS.find((method) => method.id === value)?.description}.
        {!availability[value] && value !== "CASH_ON_DELIVERY" && value !== "BANK_TRANSFER" && value !== "PESALINK"
          ? " This provider needs its merchant credentials before live checkout can be used."
          : ""}
      </p>
    </div>
  );
}
