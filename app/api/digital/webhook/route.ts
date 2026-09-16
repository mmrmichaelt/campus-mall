import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { prisma } from "../../../../lib/prisma";
import { vendDigitalProduct } from "../../../../lib/digital-provider";

function validSignature(
  rawBody: string,
  signature: string | null,
) {
  const secret =
    process.env.DIGITAL_PROVIDER_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer,
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature =
    request.headers.get("x-provider-signature");

  if (!validSignature(rawBody, signature)) {
    return NextResponse.json(
      {
        error: "Invalid webhook signature.",
      },
      {
        status: 401,
      },
    );
  }

  let body: {
    orderId?: string;
    status?: "SUCCESS" | "FAILED";
    paymentReference?: string;
    providerReference?: string;
    message?: string;
  };

  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {
        error: "Invalid webhook payload.",
      },
      {
        status: 400,
      },
    );
  }

  if (!body.orderId || !body.status) {
    return NextResponse.json(
      {
        error: "Missing webhook fields.",
      },
      {
        status: 400,
      },
    );
  }

  const order = await prisma.digitalOrder.findUnique({
    where: {
      id: body.orderId,
    },

    include: {
      product: true,
    },
  });

  if (!order) {
    return NextResponse.json(
      {
        error: "Order not found.",
      },
      {
        status: 404,
      },
    );
  }

  /*
   * Idempotency:
   *
   * Do not process an already completed/refunded order again.
   */

  if (
    order.status === "SUCCESS" ||
    order.status === "REFUNDED"
  ) {
    return NextResponse.json({
      ok: true,
    });
  }

  if (body.status === "FAILED") {
    await prisma.digitalOrder.update({
      where: {
        id: order.id,
      },

      data: {
        status: "FAILED",

        paymentReference:
          body.paymentReference,

        providerReference:
          body.providerReference,

        providerMessage:
          body.message,

        callbackPayload: body,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  }

  await prisma.digitalOrder.update({
    where: {
      id: order.id,
    },

    data: {
      status: "PROCESSING",

      paymentReference:
        body.paymentReference,

      paidAt: new Date(),

      callbackPayload: body,
    },
  });

  if (!order.product) {
    await prisma.digitalOrder.update({
      where: {
        id: order.id,
      },

      data: {
        status: "FAILED",

        providerMessage:
          "Digital product is missing.",
      },
    });

    return NextResponse.json({
      ok: true,
    });
  }

  try {
    const result =
      await vendDigitalProduct({
        orderId: order.id,

        phone: order.recipientPhone,

        network: order.network,

        type: order.type,

        amount: order.customerAmount,

        providerCode:
          order.product.providerCode,
      });

    await prisma.digitalOrder.update({
      where: {
        id: order.id,
      },

      data: {
        status: result.accepted
          ? "SUCCESS"
          : "FAILED",

        providerReference:
          result.reference,

        providerMessage:
          result.message,

        completedAt:
          result.accepted
            ? new Date()
            : undefined,
      },
    });
  } catch (error) {
    await prisma.digitalOrder.update({
      where: {
        id: order.id,
      },

      data: {
        status: "FAILED",

        providerMessage:
          error instanceof Error
            ? error.message
            : "Digital delivery failed.",
      },
    });
  }

  return NextResponse.json({
    ok: true,
  });
}
