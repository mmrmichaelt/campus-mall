import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const listingId = String(body.listingId || "").trim();

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required." },
        { status: 400 }
      );
    }

    if (!user.emailVerified || !user.phoneVerified) {
      return NextResponse.json(
        {
          error:
            "Please verify both your email and phone number before placing an order.",
        },
        { status: 403 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    });

    if (!listing || listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Item unavailable." },
        { status: 409 }
      );
    }

    if (listing.sellerId === user.id) {
      return NextResponse.json(
        { error: "You cannot order your own listing." },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          buyerId: user.id,
          sellerId: listing.sellerId,
          listingId: listing.id,
          amount: listing.price,
          quantity: 1,
          status: "PENDING",
        },
      });

      await tx.notification.create({
        data: {
          userId: listing.sellerId,
          type: "NEW_ORDER",
          title: "New order",
          message: `${user.name} placed an order for ${listing.title}.`,
        },
      });

      return createdOrder;
    });

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation failed:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create order." },
      { status: 500 }
    );
  }
}
