import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settleRevenue } from "@/lib/payments";
import { vendDigitalProduct } from "../../../../../../../../lib/digital-provider";

function transactionFeeRate() {
  const value = Number(process.env.TRANSACTION_FEE_PERCENT || "5");
  return Number.isFinite(value) && value >= 0 ? value : 5;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cb = body?.Body?.stkCallback;
    if (!cb?.CheckoutRequestID) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const intent = await prisma.paymentIntent.findUnique({ where: { checkoutRequestId: cb.CheckoutRequestID } });
    if (!intent) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const ok = Number(cb.ResultCode) === 0;
    await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: { status: ok ? "SUCCESS" : "FAILED", resultCode: Number(cb.ResultCode), resultDesc: String(cb.ResultDesc || "") },
    });
    if (!ok) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const metadata = (intent.metadata || {}) as Record<string, unknown>;
    const revenueReference = "REV-" + intent.reference;

    if (intent.purpose === "PRO" && metadata.subscriptionId) {
      const subscriptionId = String(metadata.subscriptionId);
      const sub = await prisma.proSubscription.findUnique({ where: { id: subscriptionId } });
      if (sub) {
        const expires = new Date(Date.now() + (sub.plan === "YEARLY" ? 365 : 30) * 86400000);
        await prisma.proSubscription.update({
          where: { id: sub.id },
          data: { status: "ACTIVE", startedAt: new Date(), expiresAt: expires, provider: "MPESA", providerReference: cb.CheckoutRequestID },
        });
        if (metadata.proPaymentId) {
          await prisma.proPayment.update({
            where: { id: String(metadata.proPaymentId) },
            data: { status: "SUCCESS", paidAt: new Date(), provider: "MPESA", providerReference: cb.CheckoutRequestID },
          });
        }
        await settleRevenue({ userId: intent.userId, type: "PRO_SUBSCRIPTION", reference: revenueReference, gross: Number(intent.amount), metadata: { subscriptionId: sub.id } });
      }
    } else if (intent.purpose === "PROMOTION" && metadata.promotionPurchaseId) {
      const purchaseId = String(metadata.promotionPurchaseId);
      const purchase = await prisma.promotionPurchase.findUnique({ where: { id: purchaseId } });
      if (purchase) {
        await prisma.promotionPurchase.update({ where: { id: purchase.id }, data: { status: "SUCCESS" } });
        await prisma.listing.update({
          where: { id: purchase.listingId },
          data: { promoted: true, promotedUntil: new Date(Date.now() + purchase.days * 86400000) },
        });
        await settleRevenue({ userId: intent.userId, type: "SELLER_PROMOTION", reference: revenueReference, gross: Number(intent.amount), metadata: { listingId: purchase.listingId, days: purchase.days } });
      }
    } else if (intent.purpose === "BUSINESS" && metadata.subscriptionId) {
      const subscriptionId = String(metadata.subscriptionId);
      const subscription = await prisma.businessSubscription.findUnique({ where: { id: subscriptionId } });
      if (subscription) {
        await prisma.businessSubscription.update({
          where: { id: subscription.id },
          data: { status: "ACTIVE", startedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 86400000) },
        });
        await settleRevenue({ userId: intent.userId, type: "BUSINESS_ACCOUNT", reference: revenueReference, gross: Number(intent.amount), metadata: { subscriptionId: subscription.id } });
      }
    } else if (intent.purpose === "ADVERTISING" && metadata.adCampaignId) {
      const adCampaignId = String(metadata.adCampaignId);
      const campaign = await prisma.adCampaign.findUnique({ where: { id: adCampaignId } });
      if (campaign) {
        await prisma.adCampaign.update({
          where: { id: campaign.id },
          data: { status: "ACTIVE", startsAt: new Date(), endsAt: new Date(Date.now() + 30 * 86400000) },
        });
        await settleRevenue({ userId: intent.userId, type: "ADVERTISING", reference: revenueReference, gross: Number(intent.amount), metadata: { adCampaignId: campaign.id } });
      }
    } else if (intent.purpose === "ORDER" && metadata.orderId) {
      const orderId = String(metadata.orderId);
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order && order.buyerId === intent.userId) {
        await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
        await prisma.notification.create({
          data: { userId: order.sellerId, type: "NEW_PAID_ORDER", title: "Paid order received", message: "A buyer has completed payment for your listing." },
        });
        const rate = transactionFeeRate();
        const fee = Number(intent.amount) * rate / 100;
        if (fee > 0) {
          await settleRevenue({
            userId: intent.userId,
            type: "TRANSACTION_SERVICE_FEE",
            reference: revenueReference,
            gross: fee,
            fee: 0,
            metadata: { orderId: order.id, ratePercent: rate, saleAmount: Number(intent.amount) },
          });
        }
      }
    } else if (intent.purpose === "DIGITAL" && metadata.digitalOrderId) {
      const digitalOrderId = String(metadata.digitalOrderId);
      const digitalOrder = await prisma.digitalOrder.findUnique({ where: { id: digitalOrderId }, include: { product: true } });
      if (digitalOrder && digitalOrder.userId === intent.userId) {
        await prisma.digitalOrder.update({
          where: { id: digitalOrder.id },
          data: { status: "PAYMENT_CONFIRMED", providerReference: cb.CheckoutRequestID },
        });
        try {
          const product = digitalOrder.product;
          if (product) {
            const result = await vendDigitalProduct({
              orderId: digitalOrder.id,
              phone: digitalOrder.phone,
              network: product.category,
              type: product.type,
              amount: Number(digitalOrder.amount),
              providerCode: product.provider,
            });
            await prisma.digitalOrder.update({
              where: { id: digitalOrder.id },
              data: { status: result.accepted ? "SUCCESS" : "PROCESSING", providerReference: result.reference || cb.CheckoutRequestID },
            });
            if (result.accepted) {
              const commission = Number(digitalOrder.amount) * Number(process.env.DIGITAL_COMMISSION_PERCENT || "5") / 100;
              if (commission > 0) {
                await settleRevenue({
                  userId: intent.userId,
                  type: "DATA_AIRTIME_COMMISSION",
                  reference: revenueReference,
                  gross: commission,
                  metadata: { digitalOrderId: digitalOrder.id, saleAmount: Number(digitalOrder.amount) },
                });
              }
            }
          }
        } catch (providerError) {
          console.error("DIGITAL_PROVIDER_FULFILMENT_ERROR", providerError);
          await prisma.digitalOrder.update({ where: { id: digitalOrder.id }, data: { status: "PROCESSING" } });
        }
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("MPESA_CALLBACK_ERROR", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
