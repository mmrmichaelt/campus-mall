import { NextResponse } from "next/server";

const methods = [
  ["MPESA", "MPESA_CONSUMER_KEY", "M-Pesa"],
  ["CARD", "STRIPE_SECRET_KEY", "Visa / Mastercard"],
  ["BANK_TRANSFER", "CAMPUS_MALL_BANK_NAME", "Bank transfer"],
  ["PESALINK", "CAMPUS_MALL_BANK_NAME", "PesaLink"],
  ["PAYPAL", "PAYPAL_CLIENT_ID", "PayPal"],
  ["GOOGLE_PAY", "STRIPE_SECRET_KEY", "Google Pay"],
  ["STRIPE", "STRIPE_SECRET_KEY", "Stripe"],
] as const;

export async function GET() {
  return NextResponse.json({
    methods: methods.map(([id, env, label]) => ({
      id,
      label,
      configured:
        id === "MPESA"
          ? Boolean(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_SHORTCODE && process.env.MPESA_PASSKEY && process.env.MPESA_CALLBACK_URL)
          : Boolean(process.env[env]),
    })),
  });
}
