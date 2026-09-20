import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { finalizePaymentIntent } from "@/lib/payments";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") || "";
  const orderId = url.searchParams.get("token") || "";

  const intent = reference
    ? await prisma.paymentIntent.findUnique({ where: { reference } })
    : null;

  if (!intent || !orderId) {
    return NextResponse.redirect(
      new URL(
        `/payment-cancelled?reference=${encodeURIComponent(reference)}`,
        url.origin,
      ),
    );
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) {
    return NextResponse.redirect(
      new URL(
        `/payment-cancelled?reference=${encodeURIComponent(reference)}`,
        url.origin,
      ),
    );
  }

  const base =
    process.env.PAYPAL_ENVIRONMENT === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const tokenResponse = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const token = await tokenResponse.json();

  if (!tokenResponse.ok || !token.access_token) {
    return NextResponse.redirect(
      new URL(
        `/payment-cancelled?reference=${encodeURIComponent(reference)}`,
        url.origin,
      ),
    );
  }

  const capture = await fetch(
    `${base}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  const data = await capture.json();
  const success = capture.ok && data?.status === "COMPLETED";

  await prisma.paymentIntent.update({
    where: { id: intent.id },
    data: {
      status: success ? "SUCCESS" : "FAILED",
      resultCode: success ? 0 : 1,
      resultDesc: data?.status || null,
    },
  });

  if (success) {
    await finalizePaymentIntent(reference);
  }

  return NextResponse.redirect(
    new URL(
      success
        ? `/payment-success?reference=${encodeURIComponent(reference)}`
        : `/payment-cancelled?reference=${encodeURIComponent(reference)}`,
      url.origin,
    ),
  );
}
