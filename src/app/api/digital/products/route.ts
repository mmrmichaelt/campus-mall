import { NextRequest } from "next/server";
import { DigitalProductType } from "@prisma/client";

import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    const typeParam = searchParams.get("type")?.trim().toUpperCase();
    const search = searchParams.get("search")?.trim();
    const type = typeParam === "DATA" || typeParam === "AIRTIME"
      ? (typeParam as DigitalProductType)
      : undefined;

    const products = await prisma.digitalProduct.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
        ...(type ? { type } : {}),
        ...(search ? { OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { provider: { contains: search, mode: "insensitive" } },
        ] } : {}),
      },
      orderBy: [{ category: "asc" }, { price: "asc" }],
    });

    return Response.json({ success: true, products });
  } catch (error) {
    console.error("DIGITAL_PRODUCTS_ERROR", error);
    return Response.json({ success: false, error: "Unable to load digital products" }, { status: 500 });
  }
}
