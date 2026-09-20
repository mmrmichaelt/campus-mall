import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") || url.searchParams.get("tx_ref") || "";
  const transactionId = url.searchParams.get("transaction_id") || "";
  const intent = reference ? await prisma.paymentIntent.findUnique({ where: { reference } }) : null;
  if (!intent) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  const key = process.env.FLW_SECRET_KEY;
  if (!key || !transactionId) return NextResponse.redirect(new URL(`/payment-cancelled?reference=${encodeURIComponent(reference)}`, url.origin));
  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  const data = await response.json();
  const success = response.ok && data?.status === "success" && data?.data?.status === "successful" && data?.data?.tx_ref === reference;
  await prisma.paymentIntent.update({ where: { id: intent.id }, data: { status: success ? "SUCCESS" : "FAILED", resultCode: success ? 0 : 1, resultDesc: data?.message || null } });
  return NextResponse.redirect(new URL(success ? `/payment-success?reference=${encodeURIComponent(reference)}` : `/payment-cancelled?reference=${encodeURIComponent(reference)}`, url.origin));
}
