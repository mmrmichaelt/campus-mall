import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "User ID is required.",
        },
        { status: 400 }
      );
    }

    const profile = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        country: true,
        university: true,
        accountType: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        setting: {
          select: {
            publicProfile: true,
          },
        },
        _count: {
          select: {
            listings: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          error: "Profile not found.",
        },
        { status: 404 }
      );
    }

    const currentUser = await getCurrentUser();

    const isOwnProfile =
      currentUser?.id === profile.id;

    /*
     * Private profiles are visible to their owner.
     * Other users receive a limited response.
     */
    if (
      profile.setting?.publicProfile === false &&
      !isOwnProfile
    ) {
      return NextResponse.json({
        success: true,
        profile: {
          id: profile.id,
          name: profile.name,
          country: profile.country,
          university: profile.university,
          accountType: profile.accountType,
          isPrivate: true,
          listingCount: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        country: profile.country,
        university: profile.university,
        accountType: profile.accountType,

        /*
         * Do not expose the user's email or phone number
         * through a public profile.
         */
        emailVerified: profile.emailVerified,
        phoneVerified: profile.phoneVerified,

        memberSince: profile.createdAt,
        listingCount: profile._count.listings,

        isPrivate:
          profile.setting?.publicProfile === false,
      },
    });
  } catch (error) {
    console.error(
      "Campus Mall public profile error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load this profile.",
      },
      { status: 500 }
    );
  }
}
