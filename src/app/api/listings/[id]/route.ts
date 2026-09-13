import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { listingSchema } from "../../../../lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

async function getListingId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

/*
 * GET /api/listings/[id]
 *
 * Gets one marketplace listing.
 */
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const id = await getListingId(context);

    if (!id) {
      return NextResponse.json(
        {
          error: "Listing ID is required.",
        },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id,
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

    if (!listing) {
      return NextResponse.json(
        {
          error: "Listing not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Sold/expired listings are no longer publicly available.
     * The seller can still access their own listing for management.
     */
    if (listing.status !== "ACTIVE") {
      const currentUser = await getCurrentUser();

      if (!currentUser || currentUser.id !== listing.sellerId) {
        return NextResponse.json(
          {
            error: "This listing is no longer available.",
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      listing: serializeListing(listing),
    });
  } catch (error) {
    console.error("Campus Mall listing lookup error:", error);

    return NextResponse.json(
      {
        error: "Unable to load this listing.",
      },
      { status: 500 }
    );
  }
}

/*
 * PUT /api/listings/[id]
 *
 * Updates a listing.
 *
 * Only the original seller can update it.
 */
export async function PUT(
  request:
