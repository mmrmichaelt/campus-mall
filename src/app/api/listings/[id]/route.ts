import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { listingSchema } from "../../../../lib/validation";

export const dynamic = "force-dynamic";

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
emailVerified: boolean;
phoneVerified: boolean;
};
}) {
return {
...listing,
price: listing.price.toString(),
};
}

export async function GET(
request: Request,
context: RouteContext
) {
try {
const { id } = await context.params;

if (!id) {
  return NextResponse.json(
    {
      error: "Listing ID is required.",
    },
    { status: 400 }
  );
}

const currentUser = await getCurrentUser();

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
        emailVerified: true,
        phoneVerified: true,
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

const isSeller = currentUser?.id === listing.sellerId;

if (!isSeller && listing.status !== "ACTIVE") {
  return NextResponse.json(
    {
      error: "This listing is no longer available.",
    },
    { status: 404 }
  );
}

return NextResponse.json({
  success: true,
  listing: serializeListing(listing),
});

} catch (error) {
console.error(
"Campus Mall listing GET error:",
error
);

return NextResponse.json(
  {
    error: "Unable to load this listing right now.",
  },
  { status: 500 }
);

}
}

export async function PUT(
request: Request,
context: RouteContext
) {
try {
const { id } = await context.params;

const currentUser = await getCurrentUser();

if (!currentUser) {
  return NextResponse.json(
    {
      error: "You must be logged in to edit a listing.",
    },
    { status: 401 }
  );
}

const existingListing =
  await prisma.listing.findUnique({
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

if (existingListing.sellerId !== currentUser.id) {
  return NextResponse.json(
    {
      error:
        "You do not have permission to edit this listing.",
    },
    { status: 403 }
  );
}

if (existingListing.status === "SOLD") {
  return NextResponse.json(
    {
      error:
        "Sold listings cannot be edited or reactivated.",
    },
    { status: 409 }
  );
}

if (existingListing.status === "EXPIRED") {
  return NextResponse.json(
    {
      error: "Expired listings cannot be edited or reactivated.",
    },
    { status: 409 }
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

const listing = await prisma.listing.update({
  where: {
    id,
  },
  data: {
    title: data.title.trim(),
    description: data.description.trim(),
    price: new Prisma.Decimal(data.price),
    currency: data.currency.trim().toUpperCase(),
    category: data.category.trim().toLowerCase(),
    imageUrl: data.imageUrl?.trim() || null,
    location: data.location.trim(),
  },
  select: {
    id: true,
    title: true,
    status: true,
    updatedAt: true,
  },
});

return NextResponse.json({
  success: true,
  message: "Your listing has been updated.",
  listing,
});

} catch (error) {
console.error(
"Campus Mall listing update error:",
error
);

return NextResponse.json(
  {
    error: "Unable to update this listing right now.",
  },
  { status: 500 }
);

}
}

export async function PATCH(
request: Request,
context: RouteContext
) {
try {
const { id } = await context.params;

const currentUser = await getCurrentUser();

if (!currentUser) {
  return NextResponse.json(
    {
      error: "You must be logged in to change a listing.",
    },
    { status: 401 }
  );
}

const existingListing =
  await prisma.listing.findUnique({
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

if (existingListing.sellerId !== currentUser.id) {
  return NextResponse.json(
    {
      error:
        "You do not have permission to change this listing.",
    },
    { status: 403 }
  );
}

const body = await request.json();

const requestedStatus = body?.status;

if (
  requestedStatus !== "SOLD" &&
  requestedStatus !== "ACTIVE"
) {
  return NextResponse.json(
    {
      error: "Status must be either ACTIVE or SOLD.",
    },
    { status: 400 }
  );
}

if (existingListing.status === "SOLD") {
  return NextResponse.json(
    {
      error: "A sold listing cannot be reactivated.",
    },
    { status: 409 }
  );
}

if (existingListing.status === "EXPIRED") {
  return NextResponse.json(
    {
      error: "An expired listing cannot be reactivated.",
    },
    { status: 409 }
  );
}

if (requestedStatus === "SOLD") {
  const result = await prisma.$transaction(async (tx) => {
    const listing = await tx.listing.update({
      where: {
        id,
      },
      data: {
        status: "SOLD",
        soldAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        soldAt: true,
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        listingId: id,
      },
    });

    return listing;
  });

  return NextResponse.json({
    success: true,
    message:
      "Listing marked as sold and removed from the public marketplace.",
    listing: result,
  });
}

const listing = await prisma.listing.update({
  where: {
    id,
  },
  data: {
    status: "ACTIVE",
    soldAt: null,
  },
  select: {
    id: true,
    status: true,
    soldAt: true,
  },
});

return NextResponse.json({
  success: true,
  message: "Listing is active again.",
  listing,
});

} catch (error) {
console.error(
"Campus Mall listing status error:",
error
);

return NextResponse.json(
  {
    error:
      "Unable to change the listing status right now.",
  },
  { status: 500 }
);

}
}

export async function DELETE(
request: Request,
context: RouteContext
) {
try {
const { id } = await context.params;

const currentUser = await getCurrentUser();

if (!currentUser) {
  return NextResponse.json(
    {
      error:
        "You must be logged in to delete a listing.",
    },
    { status: 401 }
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

if (listing.sellerId !== currentUser.id) {
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
  redirectTo: "/listings",
});

} catch (error) {
console.error(
"Campus Mall listing deletion error:",
error
);

return NextResponse.json(
  {
    error:
      "Unable to delete this listing right now.",
  },
  { status: 500 }
);

}
}
