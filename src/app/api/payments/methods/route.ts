import { NextResponse } from "next/server";

const methods = [
  ["MPESA", "MPESA_CONSUMER_KEY", "M-Pesa"],
  ["AIRTEL_MONEY", "AIRTEL_MONEY_CLIENT_ID", "Airtel Money"],
  ["CARD", "STRIPE_SECRET_KEY", "Visa / Mastercard"],
  ["BANK_TRANSFER", "CAMPUS_MALL_BANK_NAME", "Bank transfer"],
  ["PESALINK", "CAMPUS_MALL_BANK_NAME", "PesaLink"],
  ["MOBILE_MONEY", "FLW_SECRET_KEY", "Other mobile money"],
  ["PAYPAL", "PAYPAL_CLIENT_ID", "PayPal"],
  ["APPLE_PAY", "STRIPE_SECRET_KEY", "Apple Pay"],
  ["GOOGLE_PAY", "STRIPE_SECRET_KEY", "Google Pay"],
  ["STRIPE", "STRIPE_SECRET_KEY", "Stripe"],
  ["FLUTTERWAVE", "FLW_SECRET_KEY", "Flutterwave"],
  ["PAYSTACK", "PAYSTACK_SECRET_KEY", "Paystack"],
  ["CASH_ON_DELIVERY", "CASH_ON_DELIVERY_ENABLED", "Cash on delivery / in person"],
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
