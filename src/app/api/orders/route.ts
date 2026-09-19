import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createPaymentIntent } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const listingId = String(body.listingId || "").trim();

    if (!listingId) return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });
    if (!user.emailVerified && !user.phoneVerified) {
      return NextResponse.json({ error: "Please verify your email or phone number before placing an order.", redirectTo: "/verify" }, { status: 403 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== "ACTIVE") return NextResponse.json({ error: "Item unavailable." }, { status: 409 });
    if (listing.currency !== "KES") return NextResponse.json({ error: "M-Pesa checkout currently supports KES listings only." }, { status: 400 });
    if (listing.sellerId === user.id) return NextResponse.json({ error: "You cannot order your own listing." }, { status: 400 });

    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        sellerId: listing.sellerId,
        listingId: listing.id,
        amount: listing.price,
        quantity: 1,
        status: "PENDING",
      },
    });

    try {
      const payment = await createPaymentIntent({
        userId: user.id,
        purpose: "ORDER",
        amount: Number(listing.price),
        phone: String(body.phone || user.phone),
        metadata: { orderId: order.id, listingId: listing.id },
      });

      return NextResponse.json({
        success: true,
        order,
        paymentIntentId: payment.intent.id,
        paymentReference: payment.intent.reference,
        paymentConfigured: payment.configured,
        stk: payment.stk,
      }, { status: 201 });
    } catch (paymentError) {
      await prisma.order.delete({ where: { id: order.id } }).catch(() => undefined);
      throw paymentError;
    }
  } catch (error) {
    console.error("Order creation failed:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create order." }, { status: 500 });
  }
}
