import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await requireUser();
  const { listingId, paymentMethod } = await req.json();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "ACTIVE") return NextResponse.json({ error: "Item unavailable." }, { status: 409 });
  const order = await prisma.order.create({ data: { buyerId: user.id, sellerId: listing.sellerId, listingId, amount: listing.price, paymentMethod: paymentMethod || "To be agreed" } });
  await prisma.notification.create({ data: { userId: listing.sellerId, title: "New order", body: `${user.name || "A buyer"} placed an order for ${listing.title}.` } });
  return NextResponse.json({ order }, { status: 201 });
}
export async function GET() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    include: { listing: true, buyer: { select: { name: true } }, seller: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ orders });
}
