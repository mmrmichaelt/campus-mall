"use client";

import { useEffect, useState } from "react";

export type PaymentMethod =
  | "MPESA"
  | "CARD"
  | "BANK_TRANSFER"
  | "PAYPAL"
  | "GOOGLE_PAY";

export const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
}> = [
  { id: "MPESA", label: "M-Pesa", description: "STK Push for supported Kenyan payments" },
  { id: "CARD", label: "Visa / Mastercard", description: "Debit or credit card checkout" },
  { id: "BANK_TRANSFER", label: "Bank transfer", description: "Direct bank payment" },
  { id: "PAYPAL", label: "PayPal", description: "PayPal checkout" },
  { id: "GOOGLE_PAY", label: "Google Pay", description: "Wallet checkout where supported" },
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
        {!availability[value] && value !== "BANK_TRANSFER"
          ? " This provider needs its merchant credentials before live checkout can be used."
          : ""}
      </p>
    </div>
  );
}
