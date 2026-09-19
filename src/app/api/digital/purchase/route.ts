import { NextRequest } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

function normalizeKenyanPhone(phone: string) {
  const value = phone.trim().replace(/\s+/g, "");

  if (value.startsWith("+254")) {
    return `254${value.slice(4)}`;
  }

  if (value.startsWith("254")) {
    return value;
  }

  if (value.startsWith("07") || value.startsWith("01")) {
    return `254${value.slice(1)}`;
  }

  return value;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? normalizeKenyanPhone(body.phone)
        : "";

    if (!productId) {
      return Response.json(
        {
          success: false,
          error: "Product ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!phone) {
      return Response.json(
        {
          success: false,
          error: "Phone number is required",
        },
        {
          status: 400,
        }
      );
    }

    const product = await prisma.digitalProduct.findFirst({
      where: {
        id: productId,
        active: true,
      },
    });

    if (!product) {
      return Response.json(
        {
          success: false,
          error: "Digital product not found or unavailable",
        },
        {
          status: 404,
        }
      );
    }

    const amount = Number(product.price);

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json(
        {
          success: false,
          error: "Invalid product price",
        },
        {
          status: 400,
        }
      );
    }

    const order = await prisma.digitalOrder.create({
      data: {
        userId: user.id,
        productId: product.id,
        phone,
        amount: product.price,
        status: "PENDING_PAYMENT",
      },
    });

    return Response.json(
      {
        success: true,
        message:
          "Digital order created. Payment must be completed before fulfilment.",
        order: {
          id: order.id,
          productId: order.productId,
          phone: order.phone,
          amount: order.amount,
          status: order.status,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("DIGITAL_PURCHASE_ERROR", error);

    return Response.json(
      {
        success: false,
        error: "Unable to create digital purchase",
      },
      {
        status: 500,
      }
    );
  }
}
