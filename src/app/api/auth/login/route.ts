import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/auth";
import { loginSchema } from "../../../../lib/validation";
import { isValidInstitution } from "../../../../lib/institution-directory";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid login details.",
        },
        { status: 400 }
      );
    }

    const institutionValid = await isValidInstitution(parsed.data.country, parsed.data.university.trim());

    if (!institutionValid) {
      return NextResponse.json(
        { error: "Please select your institution from the official suggestions." },
        { status: 400 }
      );
    }

    const identifier = parsed.data.identifier.trim();
    const emailIdentifier = identifier.toLowerCase();
    const phoneIdentifier = identifier.replace(/[^\d+]/g, "");

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailIdentifier },
          { phone: phoneIdentifier },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        university: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "The email address or password is incorrect.",
        },
        { status: 401 }
      );
    }

    if (user.university.trim()) {
      if (user.university.trim().toLowerCase() !== parsed.data.university.trim().toLowerCase()) {
        return NextResponse.json(
          { error: "The selected institution does not match this account." },
          { status: 401 }
        );
      }
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { university: parsed.data.university.trim() },
      });
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error:
            "The email address or password is incorrect.",
        },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}.`,
      redirectTo: "/",
    });
  } catch (error) {
    console.error("Campus Mall login error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to log in right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
