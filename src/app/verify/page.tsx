"use client"; 

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type VerificationStatus = {
  emailVerified: boolean;
  phoneVerified: boolean;
  email: string;
  phone: string;
};

export default function VerifyPage() {
  const router = useRouter();

  const [status, setStatus] =
    useState<VerificationStatus | null>(null);

  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");

  const [emailMessage, setEmailMessage] = useState("");
  const [phoneMessage, setPhoneMessage] = useState("");
  const [error, setError] = useState("");

  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingPhone, setSendingPhone] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  async function loadStatus() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        router.replace("/account");
        return;
      }

      const data = await response.json();

      setStatus({
        emailVerified: data.user.emailVerified,
        phoneVerified: data.user.phoneVerified,
        email: data.user.email,
        phone: data.user.phone,
      });
    } catch {
      setError(
        "Unable to load your verification status. Please try again."
      );
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function sendCode(type: "EMAIL" | "PHONE") {
    setError("");

    if (type === "EMAIL") {
      setSendingEmail(true);
      setEmailMessage("");
    } else {
      setSendingPhone(true);
      setPhoneMessage("");
    }

    try {
      const response = await fetch(
        "/api/auth/send-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to send verification code."
        );
      }

      if (type === "EMAIL") {
        setEmailMessage(
          "A new verification code has been sent to your email."
        );
      } else {
        setPhoneMessage(
          "A new verification code has been sent to your phone."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send verification code."
      );
    } finally {
      if (type === "EMAIL") {
        setSendingEmail(false);
      } else {
        setSendingPhone(false);
      }
    }
  }

  async function verify(
    event: FormEvent<HTMLFormElement>,
    type: "EMAIL" | "PHONE"
  ) {
    event.preventDefault();

    setError("");

    if (type === "EMAIL") {
      setVerifyingEmail(true);
    } else {
      setVerifyingPhone(true);
    }

    const code =
      type === "EMAIL"
        ? emailCode
        : phoneCode;

    try {
      const response = await fetch(
        "/api/auth/verify-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Verification failed."
        );
      }

      setStatus((current) =>
        current
          ? {
              ...current,
              emailVerified:
                type === "EMAIL"
                  ? true
                  : current.emailVerified,
              phoneVerified:
                type === "PHONE"
                  ? true
                  : current.phoneVerified,
            }
          : current
      );

      if (type === "EMAIL") {
        setEmailCode("");
        setEmailMessage(
          "Your email has been verified successfully."
        );
      } else {
        setPhoneCode("");
        setPhoneMessage(
          "Your phone number has been verified successfully."
        );
      }

      if (data.fullyVerified) {
        setTimeout(() => {
          router.replace("/");
        }, 1000);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed."
      );
    } finally {
      if (type === "EMAIL") {
        setVerifyingEmail(false);
      } else {
        setVerifyingPhone(false);
      }
    }
  }

  if (!status) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-mark">CM</div>

          <h1>Loading verification...</h1>

          <p className="note">
            Please wait while we load your account
            verification status.
          </p>
        </div>
      </div>
    );
  }

  const fullyVerified =
    status.emailVerified &&
    status.phoneVerified;

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">CAMPUS MALL</p>

          <h1>Verify your account</h1>

          <p className="note">
            Verify your email address and phone number
            before using Campus Mall chats.
          </p>
        </div>
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

      {fullyVerified ? (
        <div className="panel">
          <div
            style={{
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                margin: "0 auto 15px",
                display: "grid",
                placeItems: "center",
                background: "#e9f8ef",
                color: "#16803c",
                fontSize: "30px",
                fontWeight: 800,
              }}
            >
              ✓
            </div>

            <h2>Account fully verified</h2>

            <p className="note">
              Your email and phone number have both
              been verified.
            </p>

            <button
              type="button"
              className="primary-btn"
              onClick={() => router.replace("/")}
            >
              Continue to Campus Mall
            </button>
          </div>
        </div>
      ) : (
        <div className="two-col">
          <section className="panel">
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                }}
              >
                ✉️
              </span>

              <div>
                <p className="category">
                  EMAIL
                </p>

                <h2>Email verification</h2>

                <p className="note">
                  {status.email}
                </p>
              </div>
            </div>

            {status.emailVerified ? (
              <div className="success">
                ✓ Email verified
              </div>
            ) : (
              <>
                <div className="hero-actions">
                  <a
                    href={`mailto:${status.email}`}
                    className="secondary-btn"
                  >
                    Open email
                  </a>

                  <button
                    type="button"
                    className="secondary-btn"
                    disabled={sendingEmail}
                    onClick={() =>
                      sendCode("EMAIL")
                    }
                  >
                    {sendingEmail
                      ? "Sending..."
                      : "Resend email code"}
                  </button>
                </div>

                <form
                  onSubmit={(event) =>
                    verify(event, "EMAIL")
                  }
                  className="form"
                  style={{ marginTop: "16px" }}
                >
                  <label htmlFor="email-code">
                    Enter email code
                    <input
                      id="email-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      value={emailCode}
                      onChange={(event) =>
                        setEmailCode(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                    />
                  </label>

                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={
                      verifyingEmail ||
                      emailCode.length !== 6
                    }
                  >
                    {verifyingEmail
                      ? "Verifying..."
                      : "Verify email"}
                  </button>
                </form>

                {emailMessage && (
                  <p className="success">
                    {emailMessage}
                  </p>
                )}
              </>
            )}
          </section>

          <section className="panel">
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                }}
              >
                📱
              </span>

              <div>
                <p className="category">
                  PHONE
                </p>

                <h2>Phone verification</h2>

                <p className="note">
                  {status.phone}
                </p>
              </div>
            </div>

            {status.phoneVerified ? (
              <div className="success">
                ✓ Phone verified
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={sendingPhone}
                  onClick={() =>
                    sendCode("PHONE")
                  }
                >
                  {sendingPhone
                    ? "Sending..."
                    : "Send SMS code"}
                </button>

                <form
                  onSubmit={(event) =>
                    verify(event, "PHONE")
                  }
                  className="form"
                  style={{ marginTop: "16px" }}
                >
                  <label htmlFor="phone-code">
                    Enter SMS code
                    <input
                      id="phone-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      value={phoneCode}
                      onChange={(event) =>
                        setPhoneCode(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                    />
                  </label>

                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={
                      verifyingPhone ||
                      phoneCode.length !== 6
                    }
                  >
                    {verifyingPhone
                      ? "Verifying..."
                      : "Verify phone"}
                  </button>
                </form>

                {phoneMessage && (
                  <p className="success">
                    {phoneMessage}
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      )}

      <section
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <p className="category">
          WHY VERIFY?
        </p>

        <h2>Protecting Campus Mall accounts</h2>

        <p className="note">
          Campus Mall requires both email and phone
          verification to help protect accounts and
          make marketplace conversations safer.
        </p>
      </section>

      <p
        className="note"
        style={{
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        Need help?{" "}
        <a
          href="mailto:campusmall.support@gmail.com"
          className="text-link"
        >
          campusmall.support@gmail.com
        </a>
      </p>
    </div>
  );
}
