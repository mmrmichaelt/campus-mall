import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createPaymentIntent } from "@/lib/payments";
const prices: Record<number, number> = { 1: 50, 3: 120, 7: 250, 14: 450, 30: 800 };
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const listing = await prisma.listing.findUnique({ where: { id: String(body.listingId) } });
    const days = Number(body.days || 7);
    if (!listing || listing.sellerId !== user.id || listing.status !== "ACTIVE") return NextResponse.json({ error: "Listing not available." }, { status: 403 });
    if (!prices[days]) return NextResponse.json({ error: "Invalid promotion duration." }, { status: 400 });
    const purchase = await prisma.promotionPurchase.create({ data: { userId: user.id, listingId: listing.id, days, amount: prices[days] } });
    const payment = await createPaymentIntent({ userId: user.id, purpose: "PROMOTION", amount: prices[days], phone: String(body.phone || user.phone), email: user.email || undefined, paymentMethod: String(body.paymentMethod || "MPESA") as any, metadata: { promotionPurchaseId: purchase.id, listingId: listing.id, days } });
    await prisma.promotionPurchase.update({ where: { id: purchase.id }, data: { paymentIntentId: payment.intent.id } });
    return NextResponse.json({ success: true, purchaseId: purchase.id, paymentIntentId: payment.intent.id, paymentConfigured: payment.configured, stk: payment.stk });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start promotion." }, { status: 500 }); }
}
