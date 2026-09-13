import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await ctx.params;
  const { status } = await req.json();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.sellerId !== user.id) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const updated = await prisma.order.update({ where: { id }, data: { status } });
  if (status === "ACCEPTED") {
    await prisma.listing.update({ where: { id: order.listingId }, data: { status: "SOLD", availability: "Sold" } });
    await prisma.cartItem.deleteMany({ where: { listingId: order.listingId } });
  }
  await prisma.notification.create({ data: { userId: order.buyerId, title: "Order updated", body: `Your order is now ${status.toLowerCase()}.` } });
  return NextResponse.json({ order: updated });
}
