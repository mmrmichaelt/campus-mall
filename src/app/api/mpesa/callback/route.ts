import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settleRevenue } from "@/lib/payments";

export const dynamic = "force-dynamic";

function getMetadataValue(items: any[], name: string) {
  return items.find((item) => item?.Name === name)?.Value;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const callback = body?.Body?.stkCallback;
    const checkoutRequestId = String(callback?.CheckoutRequestID || "");
    const resultCode = Number(callback?.ResultCode);

    if (!checkoutRequestId) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const intent = await prisma.paymentIntent.findUnique({
      where: { checkoutRequestId },
    });

    if (!intent) {
      console.warn("Campus Mall M-PESA callback: unknown checkout request", checkoutRequestId);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (intent.status === "SUCCESS" || intent.status === "FAILED") {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const items = callback?.CallbackMetadata?.Item || [];
    const receipt = getMetadataValue(items, "MpesaReceiptNumber");
    const transactionDate = getMetadataValue(items, "TransactionDate");

    if (resultCode !== 0) {
      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: {
          status: "FAILED",
          resultCode,
          resultDesc: String(callback?.ResultDesc || "M-PESA payment failed."),
        },
      });

      const metadata = (intent.metadata && typeof intent.metadata === "object")
        ? intent.metadata as Record<string, unknown>
        : {};

      if (intent.purpose === "PROMOTION" && typeof metadata.promotionPurchaseId === "string") {
        await prisma.promotionPurchase.update({
          where: { id: metadata.promotionPurchaseId },
          data: { status: "FAILED" },
        });
      }

      if (intent.purpose === "ADVERTISING" && typeof metadata.adCampaignId === "string") {
        await prisma.adCampaign.update({
          where: { id: metadata.adCampaignId },
          data: { status: "FAILED" },
        });
      }

      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const updated = await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: {
        status: "SUCCESS",
        resultCode: 0,
        resultDesc: String(callback?.ResultDesc || "Payment received."),
        metadata: {
          ...(intent.metadata && typeof intent.metadata === "object" ? intent.metadata as Record<string, unknown> : {}),
          mpesaReceiptNumber: receipt ? String(receipt) : undefined,
          transactionDate: transactionDate ? String(transactionDate) : undefined,
        },
      },
    });

    const metadata = (updated.metadata && typeof updated.metadata === "object")
      ? updated.metadata as Record<string, unknown>
      : {};

    if (updated.purpose === "PROMOTION" && typeof metadata.promotionPurchaseId === "string" && typeof metadata.listingId === "string") {
      const days = Math.max(1, Number(metadata.days || 7));
      const purchase = await prisma.promotionPurchase.findUnique({
        where: { id: metadata.promotionPurchaseId },
      });

      if (purchase) {
        const now = new Date();
        const listing = await prisma.listing.findUnique({
          where: { id: String(metadata.listingId) },
          select: { id: true, promotedUntil: true },
        });
        const base = listing?.promotedUntil && listing.promotedUntil > now ? listing.promotedUntil : now;
        const endsAt = new Date(base);
        endsAt.setDate(endsAt.getDate() + days);

        await prisma.$transaction([
          prisma.promotionPurchase.update({
            where: { id: purchase.id },
            data: { status: "SUCCESS" },
          }),
          prisma.listing.update({
            where: { id: String(metadata.listingId) },
            data: { promoted: true, promotedUntil: endsAt },
          }),
        ]);

        await settleRevenue({
          userId: updated.userId,
          type: "LISTING_PROMOTION",
          reference: updated.reference,
          gross: Number(updated.amount),
          metadata: { listingId: String(metadata.listingId), days, mpesaReceiptNumber: receipt ? String(receipt) : undefined },
        });
      }
    }

    if (updated.purpose === "ADVERTISING" && typeof metadata.adCampaignId === "string") {
      const startsAt = new Date();
      const endsAt = new Date(startsAt);
      endsAt.setDate(endsAt.getDate() + 30);

      await prisma.adCampaign.update({
        where: { id: metadata.adCampaignId },
        data: {
          status: "ACTIVE",
          startsAt,
          endsAt,
        },
      });

      await settleRevenue({
        userId: updated.userId,
        type: "ADVERTISING",
        reference: updated.reference,
        gross: Number(updated.amount),
        metadata: { adCampaignId: metadata.adCampaignId, mpesaReceiptNumber: receipt ? String(receipt) : undefined },
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Campus Mall M-PESA callback error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}

export async function GET() {
  return NextResponse.json({ service: "Campus Mall M-PESA callback", status: "ready" });
}
