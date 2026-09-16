import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getProPrice } from "@/lib/pro";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  plan: z.enum(["MONTHLY", "YEARLY"]),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid Pro plan." },
        { status: 400 }
      );
    }

    const plan = parsed.data.plan;
    const amount = getProPrice(plan);

    const subscription = await prisma.proSubscription.create({
      data: {
        userId: user.id,
        plan,
        status: "PENDING",
        amount,
        currency: "KES",
      },
    });

    const payment = await prisma.proPayment.create({
      data: {
        subscriptionId: subscription.id,
        userId: user.id,
        amount,
        currency: "KES",
        status: "PENDING",
      },
    });

    /*
     * Connect the actual payment provider here.
     *
     * IMPORTANT:
     * Do not mark the subscription ACTIVE here.
     *
     * The payment provider's verified callback/webhook must
     * confirm the payment first.
     */

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      paymentId: payment.id,
      amount,
      plan,
      message: "Payment session created.",
    });
  } catch (error) {
    console.error("PRO_CHECKOUT_ERROR", error);

    return NextResponse.json(
      { error: "Unable to create Pro checkout." },
      { status: 500 }
    );
  }
}
