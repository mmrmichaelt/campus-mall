import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";\nimport { ensurePrimaryInstitutionMembership } from "@/lib/institution-memberships";
export async function PUT(req: Request) {
  const user = await requireUser();
  const { university } = await req.json();
  if (!university?.trim()) return NextResponse.json({ error: "University is required." }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { university: university.trim() } });\n  await ensurePrimaryInstitutionMembership(user.id);
  return NextResponse.json({ ok: true, university: university.trim() });
}
