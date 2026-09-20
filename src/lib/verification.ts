import { randomInt } from "crypto";
import { Resend } from "resend";
import { prisma } from "./prisma";

type VerificationType = "EMAIL" | "PHONE";

const CODE_EXPIRATION_MINUTES = 10;

function generateCode(): string {
  return randomInt(100000, 1000000).toString();
}

function getExpirationDate(): Date {
  return new Date(
    Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000
  );
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

async function sendTwilioSms(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured");
  }

  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!fromNumber) {
    throw new Error("TWILIO_FROM_NUMBER is not configured");
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        Body: body,
        From: fromNumber,
        To: to,
      }).toString(),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Twilio SMS request failed (${response.status}): ${errorBody}`);
  }
}
async function createVerificationCode(
  userId: string,
  type: VerificationType
) {
  const code = generateCode();
  const expiresAt = getExpirationDate();

  await prisma.verificationCode.deleteMany({
    where: {
      userId,
      type,
    },
  });

  return prisma.verificationCode.create({
    data: {
      userId,
      type,
      code,
      expiresAt,
    },
  });
}

export async function sendEmailVerificationCode(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.email) {
    throw new Error("No email address is attached to this account");
  }

  const verification = await createVerificationCode(
    userId,
    "EMAIL"
  );

  const resend = getResendClient();

  const from = process.env.EMAIL_FROM;

  if (!from) {
    throw new Error("EMAIL_FROM is not configured");
  }

  await resend.emails.send({
    from,
    to: user.email,
    subject: "Verify your Campus Mall email",
    text: [
      `Hello ${user.name},`,
      "",
      `Your Campus Mall verification code is: ${verification.code}`,
      "",
      `This code expires in ${CODE_EXPIRATION_MINUTES} minutes.`,
      "",
      "If you did not create a Campus Mall account, you can ignore this email.",
      "",
      "Campus Mall",
    ].join("\n"),
  });

  return {
    success: true,
    expiresAt: verification.expiresAt,
  };
}

export async function sendPhoneVerificationCode(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      phone: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.phone) {
    throw new Error("No phone number is attached to this account");
  }

  const verification = await createVerificationCode(
    userId,
    "PHONE"
  );

  await sendTwilioSms(
    user.phone,
    `Campus Mall verification code: ${verification.code}. It expires in ${CODE_EXPIRATION_MINUTES} minutes.`
  );

  return {
    success: true,
    expiresAt: verification.expiresAt,
  };
}

export async function verifyCode(
  userId: string,
  type: VerificationType,
  code: string
) {
  const verification = await prisma.verificationCode.findFirst({
    where: {
      userId,
      type,
      code,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!verification) {
    return {
      success: false,
      error: "Invalid or expired verification code",
    };
  }

  await prisma.$transaction([
    prisma.verificationCode.deleteMany({
      where: {
        userId,
        type,
      },
    }),

    prisma.user.update({
      where: {
        id: userId,
      },
      data:
        type === "EMAIL"
          ? {
              emailVerified: true,
            }
          : {
              phoneVerified: true,
            },
    }),
  ]);

  return {
    success: true,
  };
    }
