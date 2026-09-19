import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { settleRevenue } from "@/lib/payments";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!user || !admins.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const reference = String(body.reference || "").trim();
    const partner = String(body.partner || "").trim();

    if (!reference || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Reference and positive commission amount are required." }, { status: 400 });
    }

    const revenue = await settleRevenue({
      type: "AFFILIATE_PARTNER",
      reference: "AFF-" + reference,
      gross: amount,
      metadata: { partner },
    });

    return NextResponse.json({ success: true, revenue });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to record affiliate revenue." }, { status: 500 });
  }
}
