import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { messageSchema } from "../../../lib/validation";

function serializeMessage(message: {
  id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
  };
  receiver: {
    id: string;
    name: string;
  };
}) {
  return {
    id: message.id,
    listingId: message.listingId,
    senderId: message.senderId,
    receiverId: message.receiverId,
    body: message.body,
    readAt: message.readAt,
    createdAt: message.createdAt,
    sender: message.sender,
    receiver: message.receiver,
  };
}

/*
 * GET /api/messages?listingId=...&withUserId=...
 *
 * Returns the conversation between the logged-in user
 * and another user for a particular listing.
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to view messages.",
        },
        { status: 401 }
      );
    }

    if (!user.emailVerified && !user.phoneVerified) {
      return NextResponse.json(
        { error: "Verify your email or phone number before using Campus Mall chats.", verificationRequired: true, redirectTo: "/verify" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const listingId =
      searchParams.get("listingId")?.trim() ?? "";

    const withUserId =
      searchParams.get("withUserId")?.trim() ?? "";

    if (!listingId || !withUserId) {
      return NextResponse.json(
        {
          error:
            "listingId and withUserId are required.",
        },
        { status: 400 }
      );
    }

    if (withUserId === user.id) {
      return NextResponse.json(
        {
          error: "You cannot start a conversation with yourself.",
        },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      select: {
        id: true,
        sellerId: true,
        status: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        {
          error: "Listing not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Only the listing seller and the other participant
     * can access the conversation.
     */
    const isParticipant =
      user.id === listing.sellerId ||
      user.id === withUserId;

    if (!isParticipant) {
      return NextResponse.json(
        {
          error:
            "You do not have access to this conversation.",
        },
        { status: 403 }
      );
    }

    const otherUser = await prisma.user.findUnique({
      where: {
        id: withUserId,
      },
      select: {
        id: true,
        name: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    if (!otherUser) {
      return NextResponse.json(
        {
          error: "The other user could not be found.",
        },
        { status: 404 }
      );
    }

    if (
      !otherUser.emailVerified ||
      !otherUser.phoneVerified
    ) {
      return NextResponse.json(
        {
          error:
            "The other user has not completed verification yet.",
        },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        listingId,
        OR: [
          {
            senderId: user.id,
            receiverId: withUserId,
          },
          {
            senderId: withUserId,
            receiverId: user.id,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        listingId: true,
        senderId: true,
        receiverId: true,
        body: true,
        readAt: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    /*
     * Mark messages sent to the current user as read.
     */
    await prisma.message.updateMany({
      where: {
        listingId,
        senderId: withUserId,
        receiverId: user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      listingId,
      withUser: otherUser,
      messages: messages.map(serializeMessage),
    });
  } catch (error) {
    console.error("Campus Mall messages GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load this conversation.",
      },
      { status: 500 }
    );
  }
}

/*
 * POST /api/messages
 *
 * Sends one real database-backed message.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to send messages.",
        },
        { status: 401 }
      );
    }

    if (!user.emailVerified || !user.phoneVerified) {
      return NextResponse.json(
        {
          error:
            "Verify both your email and phone number before sending messages.",
          verificationRequired: true,
          redirectTo: "/verify",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid message.",
        },
        { status: 400 }
      );
    }

    const {
      listingId,
      receiverId,
      body: messageBody,
    } = parsed.data;

    if (receiverId === user.id) {
      return NextResponse.json(
        {
          error: "You cannot send a message to yourself.",
        },
        { status: 400 }
      );
    }

    const [listing, receiver] = await prisma.$transaction([
      prisma.listing.findUnique({
        where: {
          id: listingId,
        },
        select: {
          id: true,
          sellerId: true,
          status: true,
        },
      }),

      prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          id: true,
          name: true,
          emailVerified: true,
          phoneVerified: true,
        },
      }),
    ]);

    if (!listing) {
      return NextResponse.json(
        {
          error: "Listing not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Messages are tied to an actual listing.
     *
     * Once an item is sold, no new conversation can
     * be started for it.
     */
    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "This listing is no longer available for new messages.",
        },
        { status: 400 }
      );
    }

    if (!receiver) {
      return NextResponse.json(
        {
          error: "The recipient could not be found.",
        },
        { status: 404 }
      );
    }

    if (
      !receiver.emailVerified ||
      !receiver.phoneVerified
    ) {
      return NextResponse.json(
        {
          error:
            "The recipient has not completed email and phone verification.",
        },
        { status: 403 }
      );
    }

    /*
     * The conversation must involve the seller.
     *
     * Either:
     * seller -> interested buyer
     * buyer -> seller
     */
    const userIsSeller = listing.sellerId === user.id;
    const receiverIsSeller = listing.sellerId === receiverId;

    if (!userIsSeller && !receiverIsSeller) {
      return NextResponse.json(
        {
          error:
            "Messages for a listing can only be exchanged with its seller.",
        },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        listingId,
        senderId: user.id,
        receiverId,
        body: messageBody.trim(),
      },
      select: {
        id: true,
        listingId: true,
        senderId: true,
        receiverId: true,
        body: true,
        readAt: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent.",
        data: serializeMessage(message),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Campus Mall messages POST error:", error);

    return NextResponse.json(
      {
        error:
          "We could not send your message right now.",
      },
      { status: 500 }
    );
  }
        }
