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
      <main className="page-shell">
        <section className="verify-page">
          <div className="loading-card">
            <p>Loading verification...</p>
          </div>
        </section>
      </main>
    );
  }

  const fullyVerified =
    status.emailVerified &&
    status.phoneVerified;

  return (
    <main className="page-shell">
      <section className="verify-page">
        <div className="verify-header">
          <p className="eyebrow">CAMPUS MALL</p>

          <h1>Verify your account</h1>

          <p>
            Verify your email address and phone number
            before using Campus Mall chats.
          </p>
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {fullyVerified ? (
          <div className="verification-complete">
            <div className="success-icon">✓</div>

            <h2>Account fully verified</h2>

            <p>
              Your email and phone number have both
              been verified.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => router.replace("/")}
            >
              Continue to Campus Mall
            </button>
          </div>
        ) : (
          <div className="verification-grid">
            <section className="verification-card">
              <div className="verification-card-header">
                <span className="verification-icon">
                  ✉️
                </span>

                <div>
                  <h2>Email verification</h2>

                  <p>
                    {status.email}
                  </p>
                </div>
              </div>

              {status.emailVerified ? (
                <div className="verified-box">
                  ✓ Email verified
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={sendingEmail}
                    onClick={() =>
                      sendCode("EMAIL")
                    }
                  >
                    {sendingEmail
                      ? "Sending..."
                      : "Send email code"}
                  </button>

                  <form
                    onSubmit={(event) =>
                      verify(event, "EMAIL")
                    }
                    className="verification-form"
                  >
                    <label htmlFor="email-code">
                      Enter email code
                    </label>

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

                    <button
                      type="submit"
                      className="primary-button"
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
                    <p className="form-success">
                      {emailMessage}
                    </p>
                  )}
                </>
              )}
            </section>

            <section className="verification-card">
              <div className="verification-card-header">
                <span className="verification-icon">
                  📱
                </span>

                <div>
                  <h2>Phone verification</h2>

                  <p>
                    {status.phone}
                  </p>
                </div>
              </div>

              {status.phoneVerified ? (
                <div className="verified-box">
                  ✓ Phone verified
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="secondary-button"
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
                    className="verification-form"
                  >
                    <label htmlFor="phone-code">
                      Enter SMS code
                    </label>

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

                    <button
                      type="submit"
                      className="primary-button"
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
                    <p className="form-success">
                      {phoneMessage}
                    </p>
                  )}
                </>
              )}
            </section>
          </div>
        )}

        <div className="verify-note">
          <strong>Why verify?</strong>

          <p>
            Campus Mall requires both email and phone
            verification to help protect accounts and
            make marketplace conversations safer.
          </p>
        </div>

        <p className="support-text">
          Need help?{" "}
          <a href="mailto:campusmallsupport@gmail.com">
            campusmallsupport@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
    }
