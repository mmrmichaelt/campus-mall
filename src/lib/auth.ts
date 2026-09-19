import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { prisma } from "./prisma";

const SESSION_COOKIE = "campus_mall_session";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      getSecretKey()
    );

    if (
      typeof payload.userId !== "string" ||
      !payload.userId
    ) {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      country: true,
      university: true,
      accountType: true,
      phone: true,
      email: true,
      emailVerified: true,
      phoneVerified: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
