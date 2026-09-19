import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { listingSchema } from "../../../lib/validation";

export const dynamic = "force-dynamic";

function formatListing(listing: {
  id: string;
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
    emailVerified: boolean;
    phoneVerified: boolean;
  };
}) {
  return {
    ...listing,
    price: listing.price.toString(),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const country = searchParams.get("country")?.trim() || "";
    const university =
      searchParams.get("university")?.trim() || "";

    const rawPage = Number(searchParams.get("page") || "1");
    const rawLimit = Number(searchParams.get("limit") || "30");

    const page =
      Number.isInteger(rawPage) && rawPage > 0
        ? rawPage
        : 1;

    const limit =
      Number.isInteger(rawLimit) &&
      rawLimit >= 1 &&
      rawLimit <= 60
        ? rawLimit
        : 30;

    const where: Prisma.ListingWhereInput = {
      status: "ACTIVE",

      ...(category
        ? {
            category: {
              equals: category,
              mode: "insensitive",
            },
          }
        : {}),

      ...(country || university
        ? {
            seller: {
              ...(country
                ? {
                    country: {
                      equals: country,
                      mode: "insensitive",
                    },
                  }
                : {}),
              ...(university
                ? {
                    university: {
                      equals: university,
                      mode: "insensitive",
                    },
                  }
                : {}),
            },
          }
        : {}),

      ...(q
        ? {
            OR: [
              {
                title: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                category: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                location: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [listings, total] =
      await prisma.$transaction([
        prisma.listing.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
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
                emailVerified: true,
                phoneVerified: true,
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
      listings: listings.map(formatListing),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
      filters: {
        q,
        category,
        country,
        university,
      },
    });
  } catch (error) {
    console.error(
      "Campus Mall listings GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load marketplace listings right now.",
        diagnostic:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to create a listing.",
        },
        { status: 401 }
      );
    }

    if (!user.emailVerified && !user.phoneVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email or phone number before creating a listing.",
          redirectTo: "/verify",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const parsed = listingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid listing details.",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const listing = await prisma.listing.create({
      data: {
        sellerId: user.id,
        title: data.title.trim(),
        description: data.description.trim(),
        price: new Prisma.Decimal(data.price),
        currency: data.currency.trim().toUpperCase(),
        category: data.category.trim().toLowerCase(),
        imageUrl:
          data.imageUrls?.length
            ? JSON.stringify(data.imageUrls)
            : data.imageUrl?.trim() || null,
        location: data.location.trim(),
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your listing has been published successfully.",
        listing,
        redirectTo: `/listings/${listing.id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Campus Mall listing creation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create your listing right now. Please try again.",
      },
      { status: 500 }
    );
  }
        }
