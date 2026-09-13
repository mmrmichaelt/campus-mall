import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { settingsSchema } from "../../../lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to view your settings.",
        },
        { status: 401 }
      );
    }

    const settings = await prisma.userSetting.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
      },
      update: {},
      select: {
        emailAlerts: true,
        messageAlerts: true,
        marketing: true,
        publicProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Campus Mall settings GET error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to load your settings right now. Please try again.",
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
          error: "You must be logged in to change your settings.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid settings.",
        },
        { status: 400 }
      );
    }

    const settings = await prisma.userSetting.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        emailAlerts: parsed.data.emailAlerts,
        messageAlerts: parsed.data.messageAlerts,
        marketing: parsed.data.marketing,
        publicProfile: parsed.data.publicProfile,
      },
      update: {
        emailAlerts: parsed.data.emailAlerts,
        messageAlerts: parsed.data.messageAlerts,
        marketing: parsed.data.marketing,
        publicProfile: parsed.data.publicProfile,
      },
      select: {
        emailAlerts: true,
        messageAlerts: true,
        marketing: true,
        publicProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your settings have been saved.",
      settings,
    });
  } catch (error) {
    console.error("Campus Mall settings PUT error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to save your settings right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
