import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ensurePrimaryInstitutionMembership,
  getInstitutionMembershipLimit,
} from "@/lib/institution-memberships";

export async function GET() {
  const user = await requireUser();
  await ensurePrimaryInstitutionMembership(user.id);

  const memberships = await prisma.userInstitutionMembership.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const limit = await getInstitutionMembershipLimit(user.id);
  return NextResponse.json({
    memberships,
    limit,
    count: memberships.length,
    isPro: limit > 2,
  });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => ({}));

  const country = String(body.country || user.country || "").trim();
  const institution = String(body.institution || "").trim();
  const type = String(body.type || "POSTING").toUpperCase();

  if (!country || !institution) {
    return NextResponse.json({ error: "Country and institution are required." }, { status: 400 });
  }

  if (type !== "POSTING" && type !== "VISITING") {
    return NextResponse.json({ error: "Membership type must be POSTING or VISITING." }, { status: 400 });
  }

  await ensurePrimaryInstitutionMembership(user.id);
  const limit = await getInstitutionMembershipLimit(user.id);

  const existing = await prisma.userInstitutionMembership.findUnique({
    where: {
      userId_country_institution: {
        userId: user.id,
        country,
        institution,
      },
    },
  });

  if (existing) {
    if (existing.type !== type) {
      const updated = await prisma.userInstitutionMembership.update({
        where: { id: existing.id },
        data: { type: type as "POSTING" | "VISITING" },
      });
      return NextResponse.json({ membership: updated, updated: true });
    }
    return NextResponse.json({ membership: existing, updated: false });
  }

  const count = await prisma.userInstitutionMembership.count({ where: { userId: user.id } });
  if (count >= limit) {
    return NextResponse.json({
      error: `Your current plan allows up to ${limit} institution memberships. Campus Mall Pro unlocks additional institutions.`,
      code: "INSTITUTION_LIMIT_REACHED",
      limit,
      count,
      upgradeRequired: limit === 2,
    }, { status: 403 });
  }

  const membership = await prisma.userInstitutionMembership.create({
    data: {
      userId: user.id,
      country,
      institution,
      type: type as "POSTING" | "VISITING",
    },
  });

  return NextResponse.json({ membership, limit, count: count + 1 }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();

  if (!id) {
    return NextResponse.json({ error: "Membership id is required." }, { status: 400 });
  }

  const membership = await prisma.userInstitutionMembership.findFirst({
    where: { id, userId: user.id },
  });

  if (!membership) {
    return NextResponse.json({ error: "Membership not found." }, { status: 404 });
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { country: true, university: true },
  });

  if (
    membership.country === userRecord?.country &&
    membership.institution === userRecord?.university
  ) {
    return NextResponse.json({
      error: "Your primary university membership cannot be removed. Switch your primary university first.",
    }, { status: 400 });
  }

  await prisma.userInstitutionMembership.delete({ where: { id: membership.id } });
  return NextResponse.json({ ok: true });
}
