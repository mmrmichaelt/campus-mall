import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getActiveProSubscription } from "@/lib/pro";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { isPro: false },
        { status: 401 }
      );
    }

    const subscription = await getActiveProSubscription(user.id);

    return NextResponse.json({
      isPro: Boolean(subscription),
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            expiresAt: subscription.expiresAt,
          }
        : null,
    });
  } catch (error) {
    console.error("PRO_STATUS_ERROR", error);

    return NextResponse.json(
      { error: "Unable to check Pro status." },
      { status: 500 }
    );
  }
}
