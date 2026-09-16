import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const subscription = await prisma.proSubscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      orderBy: {
        expiresAt: "desc",
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No active Pro subscription found." },
        { status: 404 }
      );
    }

    const updated = await prisma.proSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updated.id,
        status: updated.status,
        expiresAt: updated.expiresAt,
      },
    });
  } catch (error) {
    console.error("PRO_CANCEL_ERROR", error);

    return NextResponse.json(
      { error: "Unable to cancel subscription." },
      { status: 500 }
    );
  }
}
