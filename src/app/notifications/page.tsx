"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
} from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  message?: string;
  createdAt: string;
  readAt?: string | null;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "/api/notifications",
          {
            cache: "no-store",
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load notifications."
          );
        }

        if (active) {
          setNotifications(
            data?.notifications ?? []
          );
        }

        // Mark notifications as read after loading them.
        await fetch("/api/notifications", {
          method: "PUT",
        });
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load notifications."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">CAMPUS MALL</p>

          <h1>Notifications</h1>

          <p className="note">
            Stay updated about your Campus Mall
            account, listings and activity.
          </p>
        </div>

        <Link
          href="/"
          className="secondary-btn"
        >
          Back to marketplace
        </Link>
      </div>

      {error && (
        <div
          className="error"
          role="alert"
          style={{ marginBottom: "20px" }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="panel">
          <p className="note">
            Loading notifications...
          </p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="panel">
          <div
            style={{
              textAlign: "center",
              padding: "30px 15px",
            }}
          >
            <Bell
              size={46}
              style={{
                marginBottom: "12px",
              }}
            />

            <h2>No notifications yet</h2>

            <p className="note">
              New Campus Mall activity and account
              updates will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {notifications.map((notification) => {
            const message =
              notification.message ??
              notification.body ??
              "";

            return (
              <article
                className="panel"
                key={notification.id}
                style={{
                  margin: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div
                    className="avatar-circle"
                    style={{
                      flexShrink: 0,
                    }}
                  >
                    <Bell size={20} />
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                        }}
                      >
                        {notification.title}
                      </h3>

                      {notification.readAt && (
                        <span className="note">
                          <CheckCheck
                            size={14}
                            style={{
                              verticalAlign:
                                "middle",
                              marginRight:
                                "4px",
                            }}
                          />
                          Read
                        </span>
                      )}
                    </div>

                    {message && (
                      <p
                        style={{
                          marginTop: "8px",
                        }}
                      >
                        {message}
                      </p>
                    )}

                    <small className="note">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </small>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
