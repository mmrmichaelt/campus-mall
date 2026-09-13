import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = await req.json();
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.sellerId !== user.id) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

    if (body.status === "SOLD") {
      await prisma.listing.update({ where: { id }, data: { status: "SOLD", availability: "Sold" } });
      await prisma.cartItem.deleteMany({ where: { listingId: id } });
      return NextResponse.json({ ok: true, status: "SOLD" });
    }

    const updated = await prisma.listing.update({
      where: { id }, data: {
        title: body.title ?? listing.title,
        description: body.description ?? listing.description,
        price: body.price ?? listing.price,
        condition: body.condition ?? listing.condition,
        availability: body.availability ?? listing.availability
      }
    });
    return NextResponse.json({ listing: updated });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Update failed." }, { status: 400 });
  }
}
