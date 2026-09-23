import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [users, listings, activeListings, orders, revenue, recentListings] =
    await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.revenueTransaction.aggregate({
        where: { status: "SETTLED" },
        _sum: { net: true },
      }),
      prisma.listing.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          title: true,
          price: true,
          currency: true,
          status: true,
          createdAt: true,
          seller: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

  return NextResponse.json({
    success: true,
    stats: {
      users,
      listings,
      activeListings,
      orders,
      revenue: Number(revenue._sum.net || 0),
    },
    recentListings,
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const id = String(body.id || "").trim();
    const status = String(body.status || "").trim().toUpperCase();

    if (!id || !["ACTIVE", "SOLD", "EXPIRED"].includes(status)) {
      return NextResponse.json({ error: "Listing ID and a valid status are required." }, { status: 400 });
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: status as "ACTIVE" | "SOLD" | "EXPIRED",
        soldAt: status === "SOLD" ? new Date() : null,
      },
      select: { id: true, title: true, status: true },
    });

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update listing." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const id = String(body.id || "").trim();
    if (!id) return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });

    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete listing." },
      { status: 500 }
    );
  }
}
