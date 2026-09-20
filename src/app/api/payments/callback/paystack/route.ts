import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") || "";
  if (!reference) return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  const intent = await prisma.paymentIntent.findUnique({ where: { reference } });
  if (!intent) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Paystack is not configured." }, { status: 503 });
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  const data = await response.json();
  const success = response.ok && data?.status === true && data?.data?.status === "success";
  await prisma.paymentIntent.update({ where: { id: intent.id }, data: { status: success ? "SUCCESS" : "FAILED", resultCode: success ? 0 : 1, resultDesc: data?.message || data?.data?.gateway_response || null } });
  return NextResponse.redirect(new URL(success ? `/payment-success?reference=${encodeURIComponent(reference)}` : `/payment-cancelled?reference=${encodeURIComponent(reference)}`, url.origin));
}
