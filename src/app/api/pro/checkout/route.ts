import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getProPrice } from "@/lib/pro";
import { getCurrentUser } from "@/lib/auth";
import { createPaymentIntent } from "@/lib/payments";
const schema = z.object({ plan: z.enum(["MONTHLY", "YEARLY"]), phone: z.string().optional() });
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid Pro plan." }, { status: 400 });
    const amount = getProPrice(parsed.data.plan);
    const subscription = await prisma.proSubscription.create({ data: { userId: user.id, plan: parsed.data.plan, status: "PENDING", amount, currency: "KES" } });
    const payment = await prisma.proPayment.create({ data: { subscriptionId: subscription.id, userId: user.id, amount, currency: "KES", status: "PENDING" } });
    const intent = await createPaymentIntent({ userId: user.id, purpose: "PRO", amount, phone: parsed.data.phone || user.phone, metadata: { subscriptionId: subscription.id, proPaymentId: payment.id, plan: parsed.data.plan } });
    await prisma.proPayment.update({ where: { id: payment.id }, data: { checkoutReference: intent.intent.reference, provider: "MPESA", providerReference: intent.intent.checkoutRequestId } });
    return NextResponse.json({ success: true, subscriptionId: subscription.id, paymentId: payment.id, paymentIntentId: intent.intent.id, amount, plan: parsed.data.plan, paymentConfigured: intent.configured, stk: intent.stk });
  } catch (error) { console.error("PRO_CHECKOUT_ERROR", error); return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create Pro checkout." }, { status: 500 }); }
}
