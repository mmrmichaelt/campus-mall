import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { listingSchema } from "../../../lib/validation";
import { getCountryByCode } from "../../../data/countries";

export const dynamic = "force-dynamic";

function formatListing(listing: {
  id: string;
  title: string;
  description: string;
  price: Prisma.Decimal;
  currency: string;
  category: string;
  imageUrl: string | null;
  details: Prisma.JsonValue | null;
  location: string;
  status: string;
  promoted: boolean;
  promotedUntil: Date | null;
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
    const countryName = getCountryByCode(country)?.name || country;
    const institution = searchParams.get("institution")?.trim() || "";
    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = Number(searchParams.get("maxPrice"));
    const sort = searchParams.get("sort")?.trim() || "newest";
    const location = searchParams.get("location")?.trim() || "";
    const sellerType = searchParams.get("sellerType")?.trim() || "";

    const priceFilter: Prisma.DecimalFilter = {};
    if (Number.isFinite(minPrice) && minPrice >= 0) priceFilter.gte = minPrice;
    if (Number.isFinite(maxPrice) && maxPrice >= 0) priceFilter.lte = maxPrice;

    const orderBy: Prisma.ListingOrderByWithRelationInput[] =
      sort === "price-low" ? [{ price: "asc" }] :
      sort === "price-high" ? [{ price: "desc" }] :
      sort === "title-az" ? [{ title: "asc" }] :
      sort === "title-za" ? [{ title: "desc" }] :
      sort === "oldest" ? [{ createdAt: "asc" }] :
      [{ createdAt: "desc" }];

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

      ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
      ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),

      ...(category
        ? {
            category: {
              equals: category,
              mode: "insensitive",
            },
          }
        : {}),

      ...(country || sellerType
        ? {
            seller: {
              ...(country
                ? {
                    country: {
                      equals: countryName,
                      mode: "insensitive",
                    },
                  }
                : {}),
              ...(sellerType === "STUDENT" || sellerType === "OUTSIDER" ? { accountType: sellerType } : {}),
            },
          }
        : {}),

      ...(institution
        ? {
            details: {
              path: ["institution"],
              string_contains: institution,
              mode: "insensitive",
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
          orderBy,
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
            details: true,
            location: true,
            status: true,
            promoted: true,
            promotedUntil: true,
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
        q, category, country, institution,
        minPrice: Number.isFinite(minPrice) ? minPrice : null,
        maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
        sort, location, sellerType,
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
    const sellerInstitution = user.university.trim();

    if (sellerInstitution.length < 2) {
      return NextResponse.json(
        { error: "Your account does not have an institution saved. Please update your profile before posting an item." },
        { status: 400 }
      );
    }

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
        details: {
          ...(data.details || {}),
          institution: sellerInstitution,
        },
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
