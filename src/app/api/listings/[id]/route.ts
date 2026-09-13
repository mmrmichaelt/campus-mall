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
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to update a listing.",
        },
        { status: 401 }
      );
    }

    const id = await getListingId(context);

    if (!id) {
      return NextResponse.json(
        {
          error: "Listing ID is required.",
        },
        { status: 400 }
      );
    }

    const existingListing = await prisma.listing.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        sellerId: true,
        status: true,
      },
    });

    if (!existingListing) {
      return NextResponse.json(
        {
          error: "Listing not found.",
        },
        { status: 404 }
      );
    }

    if (existingListing.sellerId !== user.id) {
      return NextResponse.json(
        {
          error: "You do not have permission to edit this listing.",
        },
        { status: 403 }
      );
    }

    if (existingListing.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error: "Sold or expired listings cannot be edited.",
        },
        { status: 400 }
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

    const listing = await prisma.listing.update({
      where: {
        id,
      },
      data: {
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

    return NextResponse.json({
      success: true,
      message: "Your listing has been updated.",
      listing: serializeListing(listing),
    });
  } catch (error) {
    console.error("Campus Mall listing update error:", error);

    return NextResponse.json(
      {
        error:
          "We could not update this listing right now.",
      },
      { status: 500 }
    );
  }
}

/*
 * PATCH /api/listings/[id]
 *
 * Used for listing status changes.
 *
 * Supported:
 * {
 *   "status": "SOLD"
 * }
 *
 * Once SOLD, the listing immediately disappears from
 * the public marketplace because marketplace searches
 * only return ACTIVE listings.
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const id = await getListingId(context);

    if (!id) {
      return NextResponse.json(
        {
          error: "Listing ID is required.",
        },
        { status: 400 }
      );
    }

    const existingListing = await prisma.listing.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        sellerId: true,
        status: true,
      },
    });

    if (!existingListing) {
      return NextResponse.json(
        {
          error: "Listing not found.",
        },
        { status: 404 }
      );
    }

    if (existingListing.sellerId !== user.id) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to change this listing.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const status =
      typeof body?.status === "string"
        ? body.status.toUpperCase()
        : "";

    if (status !== "SOLD" && status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "Status must be either ACTIVE or SOLD.",
        },
        { status: 400 }
      );
    }

    /*
     * Prevent reopening a sold listing accidentally.
     * A new listing should be created instead.
     */
    if (
      existingListing.status === "SOLD" &&
      status === "ACTIVE"
    ) {
      return NextResponse.json(
        {
          error:
            "A sold listing cannot be reactivated. Create a new listing instead.",
        },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.update({
      where: {
        id,
      },
      data:
        status === "SOLD"
          ? {
              status: "SOLD",
              soldAt: new Date(),
            }
          : {
              status: "ACTIVE",
              soldAt: null,
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

    return NextResponse.json({
      success: true,
      message:
        status === "SOLD"
          ? "Listing marked as sold and removed from the marketplace."
          : "Listing is active again.",
      listing: serializeListing(listing),
    });
  } catch (error) {
    console.error("Campus Mall listing status error:", error);

    return NextResponse.json(
      {
        error:
          "We could not change this listing right now.",
      },
      { status: 500 }
    );
  }
}

/*
 * DELETE /api/listings/[id]
 *
 * Permanently deletes a listing.
 *
 * Only the seller who owns the listing can delete it.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to delete a listing.",
        },
        { status: 401 }
      );
    }

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

    if (listing.sellerId !== user.id) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to delete this listing.",
        },
        { status: 403 }
      );
    }

    await prisma.listing.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully.",
    });
  } catch (error) {
    console.error("Campus Mall listing deletion error:", error);

    return NextResponse.json(
      {
        error:
          "We could not delete this listing right now.",
      },
      { status: 500 }
    );
  }
      }
