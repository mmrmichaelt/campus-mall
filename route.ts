import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  const items = await prisma.cartItem.findMany({
    where: { userId: user.id, listing: { status: "ACTIVE" } },
    include: { listing: { include: { seller: { select: { name: true, university: true } } } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ items });
}
export async function POST(req: Request) {
  const user = await requireUser();
  const { listingId, quantity = 1 } = await req.json();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "ACTIVE") return NextResponse.json({ error: "Item is no longer available." }, { status: 409 });
  const item = await prisma.cartItem.upsert({
    where: { userId_listingId: { userId: user.id, listingId } },
    update: { quantity: { increment: Number(quantity) } },
    create: { userId: user.id, listingId, quantity: Number(quantity) }
  });
  return NextResponse.json({ item });
}
export async function DELETE(req: Request) {
  const user = await requireUser();
  const { listingId } = await req.json();
  await prisma.cartItem.delete({ where: { userId_listingId: { userId: user.id, listingId } } });
  return NextResponse.json({ ok: true });
}
