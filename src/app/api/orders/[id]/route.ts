
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const VALID_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
] as const;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    const body = await req.json();
    const status = String(body.status || "").toUpperCase();

    if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Not allowed." },
        { status: 403 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status },
      });

      if (status === "ACCEPTED") {
        await tx.listing.update({
          where: { id: order.listingId },
          data: {
            status: "SOLD",
            soldAt: new Date(),
          },
        });

        await tx.cartItem.deleteMany({
          where: {
            listingId: order.listingId,
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: order.buyerId,
          type: "ORDER_UPDATE",
          title: "Order updated",
          message: `Your order is now ${status.toLowerCase()}.`,
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error) {
    console.error("Order update failed:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to update order." },
      { status: 500 }
    );
  }
}
