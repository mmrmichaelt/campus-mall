import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/session";

function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (/^07\d{8}$/.test(digits)) {
    return `254${digits.slice(1)}`;
  }

  if (/^01\d{8}$/.test(digits)) {
    return `254${digits.slice(1)}`;
  }

  if (/^254\d{9}$/.test(digits)) {
    return digits;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.email) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        {
          status: 401,
        },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.email,
      },

      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User account not found.",
        },
        {
          status: 404,
        },
      );
    }

    let body: {
      productId?: string;
      phone?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request.",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.productId || !body.phone) {
      return NextResponse.json(
        {
          error: "Product and phone number are required.",
        },
        {
          status: 400,
        },
      );
    }

    const phone = normalizeKenyanPhone(body.phone);

    if (!phone) {
      return NextResponse.json(
        {
          error: "Enter a valid Kenyan mobile number.",
        },
        {
          status: 400,
        },
      );
    }

    const product = await prisma.digitalProduct.findFirst({
      where: {
        id: body.productId,
        active: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "That product is no longer available.",
        },
        {
          status: 404,
        },
      );
    }

    const margin =
      product.providerCost === null ||
      product.providerCost === undefined
        ? 0
        : product.amount - product.providerCost;

    /*
     * IMPORTANT:
     *
     * Creating this order does NOT mean payment succeeded.
     *
     * The payment system must verify the customer's payment before
     * this order can be marked PAID/PROCESSING and sent to the
     * vending provider.
     */

    const order = await prisma.digitalOrder.create({
      data: {
        userId: user.id,

        type: product.type,

        network: product.network,

        recipientPhone: phone,

        productId: product.id,

        customerAmount: product.amount,

        providerCost: product.providerCost,

        margin,

        status: "PENDING_PAYMENT",
      },

      select: {
        id: true,
        customerAmount: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        order,

        nextStep: "PAYMENT_REQUIRED",

        message:
          "Order created. Complete payment to continue.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Digital purchase error:", error);

    return NextResponse.json(
      {
        error: "Unable to create the order.",
      },
      {
        status: 500,
      },
    );
  }
}
