import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        country: user.country,
        university: user.university,
        accountType: user.accountType,
        phone: user.phone,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        fullyVerified: user.emailVerified || user.phoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Campus Mall current-user request error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load your account information right now.",
      },
      { status: 500 }
    );
  }
}
