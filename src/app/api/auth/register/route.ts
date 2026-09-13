import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/auth";
import {
  registerSchema,
} from "../../../../lib/validation";
import {
  sendEmailVerificationCode,
  sendPhoneVerificationCode,
} from "../../../../lib/verification";
import { countries } from "../../../../data/countries";

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid registration details.",
        },
        { status: 400 }
      );
    }

    const {
      name,
      country,
      university,
      accountType,
      phone,
      email,
      password,
    } = parsed.data;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    /*
     * Campus Mall uses international phone numbers because
     * phone verification is handled through SMS.
     */
    if (!normalizedPhone.startsWith("+")) {
      return NextResponse.json(
        {
          error:
            "Please enter your phone number with the international country code, for example +254712345678.",
        },
        { status: 400 }
      );
    }

    /*
     * Confirm that the selected country actually exists
     * in the Campus Mall country list.
     */
    const selectedCountry = countries.find(
      (item) =>
        item.name.toLowerCase() === country.trim().toLowerCase()
    );

    if (!selectedCountry) {
      return NextResponse.json(
        {
          error: "Please select a valid country.",
        },
        { status: 400 }
      );
    }

    /*
     * Check whether the email or phone number is already
     * registered before creating the account.
     */
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: normalizedEmail,
          },
          {
            phone: normalizedPhone,
          },
        ],
      },
      select: {
        email: true,
        phone: true,
      },
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json(
          {
            error:
              "An account with this email address already exists.",
          },
          { status: 409 }
        );
      }

      if (existingUser.phone === normalizedPhone) {
        return NextResponse.json(
          {
            error:
              "An account with this phone number already exists.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error:
            "An account with these details already exists.",
        },
        { status: 409 }
      );
    }

    /*
     * Passwords are never stored directly.
     */
    const passwordHash = await bcrypt.hash(password, 12);

    /*
     * Create the user and their real settings record
     * together in the database.
     */
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        country: selectedCountry.name,
        university: university.trim(),
        accountType,
        phone: normalizedPhone,
        email: normalizedEmail,
        passwordHash,

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

    /*
     * Create the authenticated session immediately.
     *
     * The user is allowed to reach the verification page,
     * but chat APIs will require both emailVerified and
     * phoneVerified to be true.
     */
    await createSession(user.id);

    /*
     * Send both verification codes.
     *
     * Promise.allSettled is intentional:
     * if one provider temporarily fails, the account is
     * still safely created and the user can use the
     * resend-verification endpoint later.
     */
    const verificationResults = await Promise.allSettled([
      sendEmailVerificationCode(user.id),
      sendPhoneVerificationCode(user.id),
    ]);

    const emailResult = verificationResults[0];
    const phoneResult = verificationResults[1];

    const emailSent = emailResult.status === "fulfilled";
    const phoneSent = phoneResult.status === "fulfilled";

    let message =
      "Account created successfully. Verification codes have been sent to your email and phone.";

    if (emailSent && !phoneSent) {
      message =
        "Account created. Your email verification code was sent, but the phone verification message could not be sent. You can request a new phone code.";
    }

    if (!emailSent && phoneSent) {
      message =
        "Account created. Your phone verification code was sent, but the email verification message could not be sent. You can request a new email code.";
    }

    if (!emailSent && !phoneSent) {
      message =
        "Account created, but the verification messages could not be sent. Please check your verification settings and request new codes.";
    }

    return NextResponse.json(
      {
        success: true,
        message,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        verification: {
          emailSent,
          phoneSent,
        },
        redirectTo: "/verify",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Campus Mall registration error:", error);

    /*
     * Handle Prisma unique-constraint errors as well.
     * This protects against two registration requests
     * arriving at almost exactly the same time.
     */
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "An account with this email address or phone number already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "We could not create your account right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
