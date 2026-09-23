import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/auth";
import { registerSchema } from "../../../../lib/validation";
import { getCountryByCode } from "../../../../data/countries";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Invalid registration details.",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const country = getCountryByCode(data.country);

    if (!country) {
      return NextResponse.json(
        {
          error: "Please select a valid country.",
        },
        { status: 400 }
      );
    }

    const email = data.email?.trim().toLowerCase() || undefined;

    const phone = data.phone
      ? data.phone.trim().replace(/[^\d+]/g, "")
      : undefined;

    if (phone && !phone.startsWith("+")) {
      return NextResponse.json(
        {
          error:
            "Please enter your phone number with the international country code.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
      select: {
        email: true,
        phone: true,
      },
    });

    if (existingUser) {
      if (email && existingUser.email === email) {
        return NextResponse.json(
          {
            error:
              "An account with this email address already exists. Please log in instead.",
          },
          { status: 409 }
        );
      }

      if (phone && existingUser.phone === phone) {
        return NextResponse.json(
          {
            error:
              "An account with this phone number already exists. Please use another number.",
          },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        country: country.name,
        university: data.university.trim(),
        accountType: data.accountType,
        phone,
        email,
        passwordHash,
        emailVerified: false,
        phoneVerified: false,
        setting: {
          create: {
            emailAlerts: true,
            messageAlerts: true,
            marketing: false,
            publicProfile: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. You can use Campus Mall immediately.",
        redirectTo: "/",
        verification: {
          emailSent: false,
          phoneSent: false,
        },
      },
      { status: 201 }
    );    return NextResponse.json(
      {
        success: true,
        message:
          emailSent || phoneSent
            ? "Account created. Verify at least one of your email address or phone number to activate the account."
            : "Account created. Please open the verification page to complete verification.",
        redirectTo: "/verify",
        verification: {
          emailSent,
          phoneSent,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Campus Mall registration error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "An account with these details already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to create your Campus Mall account right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
