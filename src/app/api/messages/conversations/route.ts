import { NextResponse } from "next/server";

import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to view your conversations.",
        },
        { status: 401 }
      );
    }

    if (!user.emailVerified || !user.phoneVerified) {
      return NextResponse.json(
        {
          error:
            "You must verify both your email and phone number before using Campus Mall chats.",
          verificationRequired: true,
          redirectTo: "/verify",
        },
        { status: 403 }
      );
    }

    /*
     * Find every message involving the current user.
     */
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: user.id,
          },
          {
            receiverId: user.id,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        listingId: true,
        senderId: true,
        receiverId: true,
        body: true,
        readAt: true,
        createdAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            price: true,
            currency: true,
            status: true,
          },
        },
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
     * Build one conversation entry per:
     *
     * listing + other user
     *
     * This means the same buyer and seller can have
     * separate conversations for different listings.
     */
    const conversations = new Map<
      string,
      {
        listingId: string;
        otherUserId: string;
        otherUserName: string;
        listing: {
          id: string;
          title: string;
          imageUrl: string | null;
          price: number;
          currency: string;
          status: string;
        };
        lastMessage: {
          id: string;
          body: string;
          senderId: string;
          createdAt: Date;
        };
        unreadCount: number;
      }
    >();

    for (const message of messages) {
      const otherUser =
        message.senderId === user.id
          ? message.receiver
          : message.sender;

      const conversationKey =
        `${message.listingId}:${otherUser.id}`;

      const existing = conversations.get(conversationKey);

      if (!existing) {
        conversations.set(conversationKey, {
          listingId: message.listingId,
          otherUserId: otherUser.id,
          otherUserName: otherUser.name,
          listing: {
            id: message.listing.id,
            title: message.listing.title,
            imageUrl: message.listing.imageUrl,
            price: Number(message.listing.price),
            currency: message.listing.currency,
            status: message.listing.status,
          },
          lastMessage: {
            id: message.id,
            body: message.body,
            senderId: message.senderId,
            createdAt: message.createdAt,
          },
          unreadCount:
            message.receiverId === user.id &&
            message.readAt === null
              ? 1
              : 0,
        });

        continue;
      }

      if (
        message.receiverId === user.id &&
        message.readAt === null
      ) {
        existing.unreadCount += 1;
      }
    }

    return NextResponse.json({
      success: true,
      conversations: Array.from(
        conversations.values()
      ),
    });
  } catch (error) {
    console.error(
      "Campus Mall conversations error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not load your conversations right now.",
      },
      { status: 500 }
    );
  }
}
