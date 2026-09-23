import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    const listing = await prisma.listing.findUnique({ where: { id }, select: { id: true } });
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

    const [likes, favorites, comments] = await Promise.all([
      prisma.listingLike.count({ where: { listingId: id } }),
      prisma.listingFavorite.count({ where: { listingId: id } }),
      prisma.listingComment.findMany({
        where: { listingId: id }, orderBy: { createdAt: "desc" }, take: 100,
        select: { id: true, body: true, createdAt: true, user: { select: { id: true, name: true } } },
      }),
    ]);

    let liked = false, favorited = false;
    if (user) {
      const [like, favorite] = await Promise.all([
        prisma.listingLike.findUnique({ where: { userId_listingId: { userId: user.id, listingId: id } } }),
        prisma.listingFavorite.findUnique({ where: { userId_listingId: { userId: user.id, listingId: id } } }),
      ]);
      liked = !!like; favorited = !!favorite;
    }
    return NextResponse.json({ success: true, likes, favorites, comments, liked, favorited });
  } catch (error) {
    console.error("Engagement GET failed:", error);
    return NextResponse.json({ error: "Unable to load listing activity." }, { status: 500 });
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Create an account to continue.", accountRequired: true }, { status: 401 });


    const listing = await prisma.listing.findUnique({ where: { id }, select: { id: true, sellerId: true, status: true } });
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    if (listing.status !== "ACTIVE") return NextResponse.json({ error: "This listing is no longer active." }, { status: 409 });

    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "like") {
      const existing = await prisma.listingLike.findUnique({ where: { userId_listingId: { userId: user.id, listingId: id } } });
      if (existing) await prisma.listingLike.delete({ where: { id: existing.id } });
      else await prisma.listingLike.create({ data: { userId: user.id, listingId: id } });
    } else if (action === "favorite") {
      const existing = await prisma.listingFavorite.findUnique({ where: { userId_listingId: { userId: user.id, listingId: id } } });
      if (existing) await prisma.listingFavorite.delete({ where: { id: existing.id } });
      else await prisma.listingFavorite.create({ data: { userId: user.id, listingId: id } });
    } else if (action === "comment") {
      const text = String(body.body || "").trim();
      if (!text || text.length > 1000) return NextResponse.json({ error: "Comment must contain 1–1000 characters." }, { status: 400 });
      await prisma.listingComment.create({ data: { userId: user.id, listingId: id, body: text } });
      await prisma.notification.create({ data: { userId: listing.sellerId, type: "LISTING_COMMENT", title: "New listing comment", message: user.name + " commented on your listing." } });
    } else if (action === "share") {
      await prisma.activity.create({ data: { userId: user.id, listingId: id, type: "LISTING_SHARE", metadata: { channel: String(body.channel || "native") } } });
    } else {
      return NextResponse.json({ error: "Unsupported activity." }, { status: 400 });
    }

    const [likes, favorites, comments] = await Promise.all([
      prisma.listingLike.count({ where: { listingId: id } }),
      prisma.listingFavorite.count({ where: { listingId: id } }),
      prisma.listingComment.findMany({
        where: { listingId: id }, orderBy: { createdAt: "desc" }, take: 100,
        select: { id: true, body: true, createdAt: true, user: { select: { id: true, name: true } } },
      }),
    ]);
    const [like, favorite] = await Promise.all([
      prisma.listingLike.findUnique({ where: { userId_listingId: { userId: user.id, listingId: id } } }),
      prisma.listingFavorite.findUnique({ where: { userId_listingId: { userId: user.id, listingId: id } } }),
    ]);
    return NextResponse.json({ success: true, likes, favorites, comments, liked: !!like, favorited: !!favorite });
  } catch (error) {
    console.error("Engagement POST failed:", error);
    return NextResponse.json({ error: "Unable to update listing activity." }, { status: 500 });
  }
}
