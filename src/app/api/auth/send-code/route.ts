import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../../lib/auth";
import {
  sendEmailVerificationCode,
  sendPhoneVerificationCode,
} from "../../../../lib/verification";
import { sendVerificationCodeSchema } from "../../../../lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to request a verification code.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = sendVerificationCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid verification request.",
        },
        { status: 400 }
      );
    }

    const { type } = parsed.data;

    if (type === "EMAIL") {
      if (!user.email) {
        return NextResponse.json({ error: "No email address is attached to this account." }, { status: 400 });
      }

      if (user.emailVerified) {
        return NextResponse.json(
          {
            error: "Your email address is already verified.",
          },
          { status: 400 }
        );
      }

      await sendEmailVerificationCode(user.id);

      return NextResponse.json({
        success: true,
        type: "EMAIL",
        message:
          "A new verification code has been sent to your email address.",
      });
    }

    if (!user.phone) {
      return NextResponse.json({ error: "No phone number is attached to this account." }, { status: 400 });
    }

    if (user.phoneVerified) {
      return NextResponse.json(
        {
          error: "Your phone number is already verified.",
        },
        { status: 400 }
      );
    }

    await sendPhoneVerificationCode(user.id);

    return NextResponse.json({
      success: true,
      type: "PHONE",
      message:
        "A new verification code has been sent to your phone number.",
    });
  } catch (error) {
    console.error(
      "Campus Mall verification-code delivery error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to send the verification code right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
