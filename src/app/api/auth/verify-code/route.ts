import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../../lib/auth";
import { verifyCode } from "../../../../lib/verification";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to verify your account.",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const type =
      body?.type === "EMAIL" || body?.type === "PHONE"
        ? body.type
        : null;

    const code =
      typeof body?.code === "string"
        ? body.code.trim()
        : "";

    if (!type) {
      return NextResponse.json(
        {
          error: "Choose either email or phone verification.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          error: "Enter the 6-digit verification code.",
        },
        { status: 400 }
      );
    }

    if (type === "EMAIL" && user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Your email is already verified.",
      });
    }

    if (type === "PHONE" && user.phoneVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Your phone number is already verified.",
      });
    }

    const result = await verifyCode(
      user.id,
      type,
      code
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error ??
            "Invalid or expired verification code.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await getCurrentUser();

    if (!updatedUser) {
      return NextResponse.json(
        {
          error: "Unable to reload your account.",
        },
        { status: 500 }
      );
    }

    const fullyVerified =
      updatedUser.emailVerified &&
      updatedUser.phoneVerified;

    return NextResponse.json({
      success: true,
      message: fullyVerified
        ? "Your email and phone number are verified. You can now use Campus Mall chats."
        : type === "EMAIL"
          ? "Your email has been verified. Please verify your phone number."
          : "Your phone number has been verified. Please verify your email.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
      },
      fullyVerified,
      redirectTo: fullyVerified ? "/" : "/verify",
    });
  } catch (error) {
    console.error("Campus Mall verification error:", error);

    return NextResponse.json(
      {
        error:
          "We could not verify your code right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
