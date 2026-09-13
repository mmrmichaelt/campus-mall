import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await requireUser();
  const url = new URL(req.url);
  const withUser = url.searchParams.get("with");
  const messages = await prisma.message.findMany({
    where: withUser ? { OR: [{ senderId: user.id, receiverId: withUser }, { senderId: withUser, receiverId: user.id }] } : { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    include: { sender: { select: { name: true } }, receiver: { select: { name: true } } },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json({ messages });
}
export async function POST(req: Request) {
  const user = await requireUser();
  const { receiverId, text } = await req.json();
  if (!receiverId || !text?.trim()) return NextResponse.json({ error: "Receiver and message are required." }, { status: 400 });
  const msg = await prisma.message.create({ data: { senderId: user.id, receiverId, text: text.trim() } });
  await prisma.notification.create({ data: { userId: receiverId, title: "New message", body: `${user.name || "A buyer"} sent you a message.` } });
  return NextResponse.json({ message: msg }, { status: 201 });
}
