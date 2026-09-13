import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
export async function PUT(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: body.name ?? user.name,
      bio: body.bio ?? user.bio,
      profilePicture: body.profilePicture ?? user.profilePicture,
      university: body.university ?? user.university,
      phone: body.phone ?? user.phone
    }
  });
  return NextResponse.json({ user: updated });
}
