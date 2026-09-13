"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Conversation = {
  listingId: string;
  withUserId: string;
  otherUser: {
    id: string;
    name: string;
    university: string;
    country: string;
  };
  listing: {
    id: string;
    title: string;
    status: string;
  };
  lastMessage: {
    id: string;
    body: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
};

type Message = {
  id: string;
  body: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  readAt: string | null;
};

export default function ChatsClient() {
  const searchParams = useSearchParams();

  const initialListingId =
    searchParams.get("listingId") || "";

  const initialWithUserId =
    searchParams.get("withUserId") || "";

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>(
    []
  );

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] =
    useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  async function loadConversations() {
    try {
      const response = await fetch(
        "/api/messages/conversations",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load conversations."
        );
      }

      setConversations(data.conversations || []);

      if (
        initialListingId &&
        initialWithUserId
      ) {
        const existing =
          data.conversations?.find(
            (conversation: Conversation) =>
              conversation.listingId ===
                initialListingId &&
              conversation.withUserId ===
                initialWithUserId
          );

        if (existing) {
          setSelectedConversation(existing);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversations."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(
    conversation: Conversation
  ) {
    setMessagesLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        listingId: conversation.listingId,
        withUserId: conversation.withUserId,
      });

      const response = await fetch(
        `/api/messages?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load messages."
        );
      }

      setMessages(data.messages || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load messages."
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      void loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  async function sendMessage() {
    const body = message.trim();

    if (!body || !selectedConversation) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        "/api/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listingId:
              selectedConversation.listingId,
            receiverId:
              selectedConversation.withUserId,
            body,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to send message."
        );
      }

      if (data.message) {
        setMessages((current) => [
          ...current,
          data.message,
        ]);
      }

      setMessage("");

      await loadConversations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    void sendMessage();
  }

  function formatTime(dateString: string) {
    return new Date(
      dateString
    ).toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  if (loading) {
    return (
      <div className="loading-card">
        <p>Loading your conversations...</p>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <aside className="conversation-panel">
        <div className="conversation-panel-header">
          <h2>Conversations</h2>

          <span>
            {conversations.length}
          </span>
        </div>

        {conversations.length === 0 ? (
          <div className="empty-chat-state">
            <div className="empty-icon">
              💬
            </div>

            <h3>No conversations yet</h3>

            <p>
              Open a listing and message a verified
              seller to start a conversation.
            </p>

            <Link
              href="/listings"
              className="primary-button"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map(
              (conversation) => {
                const isSelected =
                  selectedConversation
                    ?.listingId ===
                    conversation.listingId &&
                  selectedConversation
                    ?.withUserId ===
                    conversation.withUserId;

                return (
                  <button
                    key={`${conversation.listingId}-${conversation.withUserId}`}
                    type="button"
                    className={`conversation-item ${
                      isSelected
                        ? "conversation-item-active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedConversation(
                        conversation
                      )
                    }
                  >
                    <div className="conversation-avatar">
                      {conversation.otherUser.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="conversation-info">
                      <div className="conversation-name-row">
                        <strong>
                          {
                            conversation
                              .otherUser.name
                          }
                        </strong>

                        {conversation.unreadCount >
                          0 && (
                          <span className="unread-badge">
                            {
                              conversation.unreadCount
                            }
                          </span>
                        )}
                      </div>

                      <span className="conversation-listing">
                        {
                          conversation.listing
                            .title
                        }
                      </span>

                      <p>
                        {
                          conversation.lastMessage
                            .body
                        }
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
      </aside>

      <section className="chat-panel">
        {!selectedConversation ? (
          <div className="chat-placeholder">
            <div className="empty-icon">
              💬
            </div>

            <h2>Select a conversation</h2>

            <p>
              Choose a conversation from the left to
              view your messages.
            </p>
          </div>
        ) : (
          <>
            <header className="chat-header">
              <div className="chat-person">
                <div className="conversation-avatar">
                  {selectedConversation.otherUser.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2>
                    {
                      selectedConversation
                        .otherUser.name
                    }
                  </h2>

                  <p>
                    {
                      selectedConversation
                        .listing.title
                    }
                  </p>
                </div>
              </div>

              <Link
                href={`/listings/${selectedConversation.listingId}`}
                className="secondary-button"
              >
                View listing
              </Link>
            </header>

            <div className="messages-area">
              {messagesLoading ? (
                <div className="messages-loading">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-chat-state">
                  <div className="empty-icon">
                    👋
                  </div>

                  <h3>Start the conversation</h3>

                  <p>
                    Send a message about this listing.
                  </p>
                </div>
              ) : (
                messages.map((item) => {
                  const isOwn =
                    item.senderId !==
                    selectedConversation
                      .withUserId;

                  return (
                    <div
                      key={item.id}
                      className={`message-row ${
                        isOwn
                          ? "message-row-own"
                          : "message-row-other"
                      }`}
                    >
                      <div
                        className={`message-bubble ${
                          isOwn
                            ? "message-bubble-own"
                            : "message-bubble-other"
                        }`}
                      >
                        <p>{item.body}</p>

                        <time>
                          {formatTime(
                            item.createdAt
                          )}
                        </time>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedConversation.listing
              .status === "ACTIVE" ? (
              <form
                onSubmit={handleSubmit}
                className="message-form"
              >
                <label
                  htmlFor="chat-message"
                  className="sr-only"
                >
                  Message
                </label>

                <textarea
                  id="chat-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder="Write a message..."
                  maxLength={2000}
                  rows={2}
                  disabled={sending}
                />

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                >
                  {sending
                    ? "Sending..."
                    : "Send"}
                </button>
              </form>
            ) : (
              <div className="chat-closed-notice">
                This listing is no longer active, so new
                messages cannot be sent.
              </div>
            )}
          </>
        )}
      </section>

      {error && (
        <div
          className="form-error chat-error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
          }
