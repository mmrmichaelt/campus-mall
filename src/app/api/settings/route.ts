import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { settingsSchema } from "../../../lib/validation";

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
      update: {},
      create: {
        userId: user.id,
        emailAlerts: true,
        messageAlerts: true,
        marketing: false,
        publicProfile: true,
      },
      select: {
        id: true,
        userId: true,
        emailAlerts: true,
        messageAlerts: true,
        marketing: true,
        publicProfile: true,
        createdAt: true,
        updatedAt: true,
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
        error: "Unable to load your settings.",
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
            parsed.error.issues[0]?.message ??
            "Invalid settings.",
        },
        { status: 400 }
      );
    }

    const {
      emailAlerts,
      messageAlerts,
      marketing,
      publicProfile,
    } = parsed.data;

    const settings = await prisma.userSetting.upsert({
      where: {
        userId: user.id,
      },
      update: {
        emailAlerts,
        messageAlerts,
        marketing,
        publicProfile,
      },
      create: {
        userId: user.id,
        emailAlerts,
        messageAlerts,
        marketing,
        publicProfile,
      },
      select: {
        id: true,
        userId: true,
        emailAlerts: true,
        messageAlerts: true,
        marketing: true,
        publicProfile: true,
        createdAt: true,
        updatedAt: true,
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
        error: "Unable to save your settings right now.",
      },
      { status: 500 }
    );
  }
}
