import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name is too long"),

  university: z
    .string()
    .trim()
    .min(2, "University / college is required")
    .max(200, "University / college name is too long"),
});

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
        phone: user.phone,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
        publicProfile: settings?.publicProfile ?? true,
      },
    });
  } catch (error) {
    console.error("Campus Mall profile GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load your profile.",
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

    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid profile details.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: parsed.data.name,
        university: parsed.data.university,
      },
      select: {
        id: true,
        name: true,
        country: true,
        university: true,
        accountType: true,
        phone: true,
        email: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your profile has been updated.",
      profile: updatedUser,
    });
  } catch (error) {
    console.error("Campus Mall profile PUT error:", error);

    return NextResponse.json(
      {
        error: "Unable to update your profile right now.",
      },
      { status: 500 }
    );
  }
}
