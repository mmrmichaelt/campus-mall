import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { finalizePaymentIntent } from "@/lib/payments";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  if (!secret || !signature) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const event = JSON.parse(raw);
  if (event?.event === "charge.success" && event?.data?.reference) {
    const reference = String(event.data.reference);
    const intent = await prisma.paymentIntent.findFirst({
      where: { OR: [{ reference }, { merchantRequestId: reference }] }
    });
    if (intent) {
      await prisma.paymentIntent.update({ where: { id: intent.id }, data: { status: "SUCCESS", resultCode: 0, resultDesc: "Paystack charge.success" } });
      await finalizePaymentIntent(intent.reference);
    }
  }
  return NextResponse.json({ received: true });
}
