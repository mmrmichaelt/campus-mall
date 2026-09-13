import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
export async function POST(req: Request) {
  const user = await requireUser();
  const { listingId, days = 7 } = await req.json();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.sellerId !== user.id) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const until = new Date(Date.now() + Number(days) * 86400000);
  const updated = await prisma.listing.update({ where: { id: listingId }, data: { promoted: true, promotedUntil: until } });
  return NextResponse.json({ listing: updated, note: "Promotion is marked here; connect your preferred payment provider to collect the promotion fee." });
}
