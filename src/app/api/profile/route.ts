import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to view your profile.",
        },
        { status: 401 }
      );
    }

    const settings = await prisma.userSetting.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        publicProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        country: user.country,
        university: user.university,
        accountType: user.accountType,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        publicProfile: settings?.publicProfile ?? true,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Campus Mall profile GET error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to load your profile right now. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to update your profile.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const university =
      typeof body?.university === "string"
        ? body.university.trim()
        : "";

    if (name.length < 2) {
      return NextResponse.json(
        {
          error:
            "Your name must contain at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error: "Your name is too long.",
        },
        { status: 400 }
      );
    }

    if (university.length < 2) {
      return NextResponse.json(
        {
          error:
            "Please enter your university or college.",
        },
        { status: 400 }
      );
    }

    if (university.length > 200) {
      return NextResponse.json(
        {
          error:
            "University or college name is too long.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        university,
      },
      select: {
        id: true,
        name: true,
        country: true,
        university: true,
        accountType: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your profile has been updated successfully.",
      profile: updatedUser,
    });
  } catch (error) {
    console.error("Campus Mall profile PUT error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to update your profile right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
