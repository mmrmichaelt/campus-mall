import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getProPrice, getProPricing } from "@/lib/pro";
import { getCurrentUser } from "@/lib/auth";
import { createPaymentIntent } from "@/lib/payments";
const schema = z.object({ plan: z.enum(["MONTHLY", "YEARLY"]), phone: z.string().optional(), paymentMethod: z.string().optional() });
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid Pro plan." }, { status: 400 });
    const pricing = getProPricing(user.country);
    const amount = getProPrice(parsed.data.plan, user.country);
    const currency = pricing.currency;
    const phone = parsed.data.phone?.trim() || user.phone;
    if (!phone) return NextResponse.json({ error: "A phone number is required for M-Pesa checkout." }, { status: 400 });
    const subscription = await prisma.proSubscription.create({ data: { userId: user.id, plan: parsed.data.plan, status: "PENDING", amount, currency } });
    const payment = await prisma.proPayment.create({ data: { subscriptionId: subscription.id, userId: user.id, amount, currency, status: "PENDING" } });
    const intent = await createPaymentIntent({ userId: user.id, purpose: "PRO", amount, currency, phone, email: user.email || undefined, paymentMethod: (parsed.data.paymentMethod || (currency === "KES" ? "MPESA" : "CARD")) as any, metadata: { subscriptionId: subscription.id, proPaymentId: payment.id, plan: parsed.data.plan, currency } });
    await prisma.proPayment.update({ where: { id: payment.id }, data: { checkoutReference: intent.intent.reference, provider: String((intent as any).paymentMethod || parsed.data.paymentMethod || "MPESA"), providerReference: intent.intent.checkoutRequestId } });
    return NextResponse.json({ success: true, subscriptionId: subscription.id, paymentId: payment.id, paymentIntentId: intent.intent.id, amount, currency, plan: parsed.data.plan, paymentConfigured: intent.configured, stk: intent.stk, checkoutUrl: (intent as any).checkoutUrl || null });
  } catch (error) { console.error("PRO_CHECKOUT_ERROR", error); return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create Pro checkout." }, { status: 500 }); }
}
