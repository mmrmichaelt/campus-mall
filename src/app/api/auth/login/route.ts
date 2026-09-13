import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/auth";
import { loginSchema } from "../../../../lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid login details.",
        },
        { status: 400 }
      );
    }

    const {
      email,
      password,
    } = parsed.data;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passwordHash: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    /*
     * Use the same message whether the email exists or not.
     * This prevents exposing which email addresses have
     * Campus Mall accounts.
     */
    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    /*
     * Create a fresh authenticated session.
     */
    await createSession(user.id);

    /*
     * Verification is separate from authentication.
     *
     * Users can log in before verification, but protected
     * features such as real chats will require both
     * emailVerified and phoneVerified.
     */
    const fullyVerified =
      user.emailVerified && user.phoneVerified;

    return NextResponse.json({
      success: true,
      message: fullyVerified
        ? "Login successful."
        : "Login successful. Please complete your email and phone verification.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      verificationRequired: !fullyVerified,
      redirectTo: fullyVerified ? "/" : "/verify",
    });
  } catch (error) {
    console.error("Campus Mall login error:", error);

    return NextResponse.json(
      {
        error:
          "We could not log you in right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
