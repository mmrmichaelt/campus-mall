import crypto from "crypto";
import { NextRequest } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { settleRevenue } from "@/lib/payments";

function verifySignature(
  rawBody: string,
  signature: string | null,
  secret: string
) {
  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  );
}

export async function POST(request: NextRequest) {
  try {
    const secret =
      process.env.DIGITAL_PROVIDER_WEBHOOK_SECRET;

    if (!secret) {
      console.error(
        "DIGITAL_PROVIDER_WEBHOOK_SECRET is not configured"
      );

      return Response.json(
        {
          success: false,
          error: "Webhook is not configured",
        },
        {
          status: 500,
        }
      );
    }

    const rawBody = await request.text();

    const signature =
      request.headers.get(
        "x-digital-provider-signature"
      ) ??
      request.headers.get(
        "x-webhook-signature"
      );

    if (
      !verifySignature(
        rawBody,
        signature,
        secret
      )
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid webhook signature",
        },
        {
          status: 401,
        }
      );
    }

    let body: {
      orderId?: string;
      reference?: string;
      status?: string;
      providerReference?: string;
      message?: string;
    };

    try {
      body = JSON.parse(rawBody);
    } catch {
      return Response.json(
        {
          success: false,
          error: "Invalid webhook payload",
        },
        {
          status: 400,
        }
      );
    }

    const orderId =
      typeof body.orderId === "string"
        ? body.orderId.trim()
        : "";

    const providerReference =
      typeof body.providerReference === "string"
        ? body.providerReference.trim()
        : typeof body.reference === "string"
          ? body.reference.trim()
          : "";

    const incomingStatus =
      typeof body.status === "string"
        ? body.status.toUpperCase()
        : "";

    if (!orderId) {
      return Response.json(
        {
          success: false,
          error: "Order ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const order =
      await prisma.digitalOrder.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      return Response.json(
        {
          success: false,
          error: "Digital order not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      order.status === "SUCCESS" ||
      order.status === "COMPLETED"
    ) {
      return Response.json({
        success: true,
        message: "Order was already completed",
      });
    }

    const successful =
      incomingStatus === "SUCCESS" ||
      incomingStatus === "COMPLETED" ||
      incomingStatus === "PAID";

    const failed =
      incomingStatus === "FAILED" ||
      incomingStatus === "CANCELLED" ||
      incomingStatus === "CANCELED";

    if (!successful && !failed) {
      await prisma.digitalOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: "PENDING_PAYMENT",
        },
      });

      return Response.json({
        success: true,
        message: "Webhook received",
      });
    }

    if (failed) {
      await prisma.digitalOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: "FAILED",
          providerReference:
            providerReference || undefined,
        },
      });

      return Response.json({
        success: true,
        message: "Digital order marked as failed",
      });
    }

    /*
     * IMPORTANT:
     * Payment success does not automatically mean the
     * airtime/data has been delivered.
     *
     * The actual provider fulfilment must happen here
     * after connecting a real digital-product provider.
     */

    await prisma.digitalOrder.update({
      where: {
        id: order.id,
      },
      data: {
        status: "SUCCESS",
        providerReference:
          providerReference || undefined,
      },
    });

    const commission = Number(order.amount) * Number(process.env.DIGITAL_COMMISSION_PERCENT || "5") / 100;
    if (commission > 0) {
      await settleRevenue({
        userId: order.userId,
        type: "DATA_AIRTIME_COMMISSION",
        reference: "DIG-" + order.id,
        gross: commission,
        metadata: {
          digitalOrderId: order.id,
          saleAmount: Number(order.amount),
          providerReference: providerReference || null,
        },
      });
    }

    return Response.json({
      success: true,
      message:
        "Payment confirmed. Provider fulfilment is pending.",
    });
  } catch (error) {
    console.error("DIGITAL_WEBHOOK_ERROR", error);

    return Response.json(
      {
        success: false,
        error: "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
      }
