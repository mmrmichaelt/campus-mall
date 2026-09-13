import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { listingSchema } from "../../../lib/validation";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function serializeListing(listing: {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: Prisma.Decimal;
  currency: string;
  category: string;
  imageUrl: string | null;
  location: string;
  status: string;
  soldAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: string;
    name: string;
    country: string;
    university: string;
    accountType: string;
  };
}) {
  return {
    id: listing.id,
    sellerId: listing.sellerId,
    title: listing.title,
    description: listing.description,
    price: Number(listing.price),
    currency: listing.currency,
    category: listing.category,
    imageUrl: listing.imageUrl,
    location: listing.location,
    status: listing.status,
    soldAt: listing.soldAt,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    seller: listing.seller,
  };
}

/*
 * GET /api/listings
 *
 * Public listing search.
 *
 * Supported query parameters:
 * ?q=phone
 * ?category=items
 * ?country=Kenya
 * ?university=Kisii University
 * ?page=1
 * ?limit=20
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const country = searchParams.get("country")?.trim() ?? "";
    const university =
      searchParams.get("university")?.trim() ?? "";

    const requestedPage = Number(
      searchParams.get("page") ?? "1"
    );

    const requestedLimit = Number(
      searchParams.get("limit") ?? DEFAULT_PAGE_SIZE
    );

    const page =
      Number.isFinite(requestedPage) && requestedPage >= 1
        ? Math.floor(requestedPage)
        : 1;

    const limit =
      Number.isFinite(requestedLimit) &&
      requestedLimit >= 1
        ? Math.min(
            Math.floor(requestedLimit),
            MAX_PAGE_SIZE
          )
        : DEFAULT_PAGE_SIZE;

    /*
     * Only ACTIVE listings are returned.
     *
     * This is important because when a seller marks an item
     * SOLD, it immediately disappears from the marketplace.
     */
    const where: Prisma.ListingWhereInput = {
      status: "ACTIVE",
    };

    if (query) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          location: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          seller: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    if (category) {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    if (country) {
      where.seller = {
        ...(where.seller &&
        typeof where.seller === "object"
          ? where.seller
          : {}),
        country: {
          equals: country,
          mode: "insensitive",
        },
      };
    }

    if (university) {
      where.seller = {
        ...(where.seller &&
        typeof where.seller === "object"
          ? where.seller
          : {}),
        university: {
          equals: university,
          mode: "insensitive",
        },
      };
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await prisma.$transaction([
      prisma.listing.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          sellerId: true,
          title: true,
          description: true,
          price: true,
          currency: true,
          category: true,
          imageUrl: true,
          location: true,
          status: true,
          soldAt: true,
          createdAt: true,
          updatedAt: true,
          seller: {
            select: {
              id: true,
              name: true,
              country: true,
              university: true,
              accountType: true,
            },
          },
        },
      }),

      prisma.listing.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      listings: listings.map(serializeListing),
      pagination: {
        page,
        limit,
        total,
        totalPages:
          total === 0 ? 0 : Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
      filters: {
        q: query,
        category,
        country,
        university,
      },
    });
  } catch (error) {
    console.error("Campus Mall listing search error:", error);

    return NextResponse.json(
      {
        error:
          "We could not load marketplace listings right now.",
      },
      { status: 500 }
    );
  }
}

/*
 * POST /api/listings
 *
 * Creates a real listing belonging to the authenticated
 * Campus Mall user.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to create a listing.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = listingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid listing details.",
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      price,
      currency,
      category,
      imageUrl,
      location,
    } = parsed.data;

    const listing = await prisma.listing.create({
      data: {
        sellerId: user.id,
        title: title.trim(),
        description: description.trim(),
        price: new Prisma.Decimal(price),
        currency: currency.trim().toUpperCase(),
        category: category.trim(),
        imageUrl:
          imageUrl && imageUrl.trim()
            ? imageUrl.trim()
            : null,
        location: location.trim(),
        status: "ACTIVE",
      },
      select: {
        id: true,
        sellerId: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        category: true,
        imageUrl: true,
        location: true,
        status: true,
        soldAt: true,
        createdAt: true,
        updatedAt: true,
        seller: {
          select: {
            id: true,
            name: true,
            country: true,
            university: true,
            accountType: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your listing has been created.",
        listing: serializeListing(listing),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Campus Mall listing creation error:", error);

    return NextResponse.json(
      {
        error:
          "We could not create your listing right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
