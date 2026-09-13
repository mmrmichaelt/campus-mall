import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../../lib/auth";
import {
  sendEmailVerificationCode,
  sendPhoneVerificationCode,
} from "../../../../lib/verification";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to request a verification code.",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const type =
      body?.type === "EMAIL" || body?.type === "PHONE"
        ? body.type
        : null;

    if (!type) {
      return NextResponse.json(
        {
          error: "Choose either email or phone verification.",
        },
        { status: 400 }
      );
    }

    if (type === "EMAIL" && user.emailVerified) {
      return NextResponse.json(
        {
          error: "Your email address is already verified.",
        },
        { status: 400 }
      );
    }

    if (type === "PHONE" && user.phoneVerified) {
      return NextResponse.json(
        {
          error: "Your phone number is already verified.",
        },
        { status: 400 }
      );
    }

    if (type === "EMAIL") {
      await sendEmailVerificationCode(user.id);
    } else {
      await sendPhoneVerificationCode(user.id);
    }

    return NextResponse.json({
      success: true,
      message:
        type === "EMAIL"
          ? "A new verification code has been sent to your email."
          : "A new verification code has been sent to your phone.",
      type,
    });
  } catch (error) {
    console.error("Campus Mall send verification code error:", error);

    return NextResponse.json(
      {
        error:
          "We could not send the verification code right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
