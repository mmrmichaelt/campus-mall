import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../../lib/auth";
import { verifyCode } from "../../../../lib/verification";
import { verificationSchema } from "../../../../lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to verify your account.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = verificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid verification code.",
        },
        { status: 400 }
      );
    }

    const { type, code } = parsed.data;

    if (
      (type === "EMAIL" && user.emailVerified) ||
      (type === "PHONE" && user.phoneVerified)
    ) {
      const fullyVerified = user.emailVerified || user.phoneVerified;

      return NextResponse.json({
        success: true,
        message:
          type === "EMAIL"
            ? "Your email address is already verified."
            : "Your phone number is already verified.",
        verification: {
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          fullyVerified,
        },
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
            result.error ||
            "The verification code is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await getCurrentUser();

    if (!updatedUser) {
      return NextResponse.json(
        {
          error:
            "Your account could not be loaded after verification.",
        },
        { status: 500 }
      );
    }

    const fullyVerified = updatedUser.emailVerified || updatedUser.phoneVerified;

    return NextResponse.json({
      success: true,
      message:
        type === "EMAIL"
          ? "Your email address has been verified successfully."
          : "Your phone number has been verified successfully.",
      verification: {
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
        fullyVerified,
      },
      redirectTo: fullyVerified ? "/" : "/verify",
    });
  } catch (error) {
    console.error(
      "Campus Mall verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify your code right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
