import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { listingSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const category = url.searchParams.get("category") || "";
  const condition = url.searchParams.get("condition") || "";
  const min = Number(url.searchParams.get("min") || 0);
  const max = Number(url.searchParams.get("max") || Number.MAX_SAFE_INTEGER);
  const user = await getCurrentUser();

  const where: any = {
    status: "ACTIVE",
    price: { gte: min, lte: max },
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
    ...(category ? { category } : {}),
    ...(condition ? { condition } : {}),
    ...(user ? { seller: { university: user.university } } : {})
  };
  const listings = await prisma.listing.findMany({
    where, include: { seller: { select: { id: true, name: true, university: true, verification: true, rating: true } } },
    orderBy: [{ promoted: "desc" }, { createdAt: "desc" }]
  });
  return NextResponse.json({ listings });
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const data = listingSchema.parse(await req.json());
    const listing = await prisma.listing.create({ data: { ...data, sellerId: user.id, pictureUrl: data.pictureUrl || null, brand: data.brand || null } });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not create item." }, { status: 400 });
  }
}
