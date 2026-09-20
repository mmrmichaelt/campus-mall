import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { createPaymentIntent } from "@/lib/payments";

function normalizeKenyanPhone(phone: string) {
  const value = phone.trim().replace(/\s+/g, "");
  if (value.startsWith("+254")) return "254" + value.slice(4);
  if (value.startsWith("254")) return value;
  if (value.startsWith("07") || value.startsWith("01")) return "254" + value.slice(1);
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const phone = typeof body.phone === "string" ? normalizeKenyanPhone(body.phone) : "";

    if (!productId) return Response.json({ success: false, error: "Product ID is required" }, { status: 400 });
    if (!phone) return Response.json({ success: false, error: "Phone number is required" }, { status: 400 });

    const product = await prisma.digitalProduct.findFirst({ where: { id: productId, active: true } });
    if (!product) return Response.json({ success: false, error: "Digital product not found or unavailable" }, { status: 404 });

    const amount = Number(product.price);
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ success: false, error: "Invalid product price" }, { status: 400 });

    const order = await prisma.digitalOrder.create({
      data: {
        userId: user.id,
        productId: product.id,
        phone,
        amount: product.price,
        status: "PENDING_PAYMENT",
      },
    });

    try {
      const payment = await createPaymentIntent({
        userId: user.id,
        purpose: "DIGITAL",
        amount,
        phone,
        email: user.email || undefined,
        paymentMethod: String(body.paymentMethod || "MPESA") as any,
        metadata: { digitalOrderId: order.id, productId: product.id },
      });

      return Response.json({
        success: true,
        message: payment.configured
          ? "Payment request started. Complete the M-Pesa prompt to continue."
          : "Order created, but M-Pesa is not configured yet.",
        order: {
          id: order.id,
          productId: order.productId,
          phone: order.phone,
          amount: order.amount,
          status: order.status,
        },
        paymentIntentId: payment.intent.id,
        paymentReference: payment.intent.reference,
        paymentConfigured: payment.configured,
        checkoutUrl: (payment as any).checkoutUrl || null,
        paymentMessage: (payment as any).paymentMessage || null,
        stk: payment.stk,
      }, { status: 201 });
    } catch (paymentError) {
      await prisma.digitalOrder.delete({ where: { id: order.id } }).catch(() => undefined);
      throw paymentError;
    }
  } catch (error) {
    console.error("DIGITAL_PURCHASE_ERROR", error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : "Unable to create digital purchase" }, { status: 500 });
  }
}
