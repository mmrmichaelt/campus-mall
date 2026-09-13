import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
export async function GET() {
  const user = await requireUser();
  return NextResponse.json({ notifications: await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }) });
}
export async function PUT() {
  const user = await requireUser();
  await prisma.notification.updateMany({ where: { userId: user.id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
