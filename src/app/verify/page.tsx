"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type VerificationStatus = {
  emailVerified: boolean;
  phoneVerified: boolean;
  email: string | null;
  phone: string | null;
};

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
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
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        router.replace("/join");
        return;
      }
      const data = await response.json();
      setStatus({
        emailVerified: data.user.emailVerified,
        phoneVerified: data.user.phoneVerified,
        email: data.user.email ?? null,
        phone: data.user.phone ?? null,
      });
    } catch {
      setError("Unable to load your verification status. Please try again.");
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
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send verification code.");

      if (type === "EMAIL") {
        setEmailMessage("A new verification code has been sent to your email.");
      } else {
        setPhoneMessage("A new verification code has been sent to your phone.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send verification code.");
    } finally {
      if (type === "EMAIL") setSendingEmail(false);
      else setSendingPhone(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>, type: "EMAIL" | "PHONE") {
    event.preventDefault();
    setError("");
    if (type === "EMAIL") setVerifyingEmail(true);
    else setVerifyingPhone(true);

    const code = type === "EMAIL" ? emailCode : phoneCode;

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed.");

      setStatus((current) =>
        current
          ? {
              ...current,
              emailVerified: type === "EMAIL" ? true : current.emailVerified,
              phoneVerified: type === "PHONE" ? true : current.phoneVerified,
            }
          : current
      );

      if (type === "EMAIL") {
        setEmailCode("");
        setEmailMessage("Your email has been verified successfully.");
      } else {
        setPhoneCode("");
        setPhoneMessage("Your phone number has been verified successfully.");
      }

      if (data.verification?.fullyVerified || data.fullyVerified) {
        setTimeout(() => router.replace("/"), 700);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      if (type === "EMAIL") setVerifyingEmail(false);
      else setVerifyingPhone(false);
    }
  }

  if (!status) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-mark">CM</div>
          <h1>Loading verification...</h1>
          <p className="note">Please wait while we load your account verification status.</p>
        </div>
      </div>
    );
  }

  const verified = status.emailVerified || status.phoneVerified;
  const hasEmail = Boolean(status.email);
  const hasPhone = Boolean(status.phone);

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">CAMPUS MALL</p>
          <h1>Verify your account</h1>
          <p className="note">
            Verify at least one contact method — your email, your phone number, or both — to activate your Campus Mall account.
          </p>
        </div>
      </div>

      {error && <div className="error" role="alert" style={{ marginBottom: 20 }}>{error}</div>}

      {verified && (
        <div className="success" style={{ marginBottom: 20 }}>
          ✓ Your account is verified. You can continue using Campus Mall.
          {!status.emailVerified && hasEmail ? " You can verify your email too." : ""}
          {!status.phoneVerified && hasPhone ? " You can verify your phone too." : ""}
        </div>
      )}

      <div className="two-col">
        {hasEmail && (
          <section className="panel">
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontSize: 28 }}>✉️</span>
              <div>
                <p className="category">EMAIL</p>
                <h2>Email verification</h2>
                <p className="note">{status.email}</p>
              </div>
            </div>

            {status.emailVerified ? (
              <div className="success">✓ Email verified</div>
            ) : (
              <>
                <div className="hero-actions">
                  <a href={`mailto:${status.email}`} className="secondary-btn">Open email</a>
                  <button type="button" className="secondary-btn" disabled={sendingEmail} onClick={() => sendCode("EMAIL")}>
                    {sendingEmail ? "Sending..." : "Resend email code"}
                  </button>
                </div>
                <form onSubmit={(event) => verify(event, "EMAIL")} className="form" style={{ marginTop: 16 }}>
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
                      onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </label>
                  <button type="submit" className="primary-btn" disabled={verifyingEmail || emailCode.length !== 6}>
                    {verifyingEmail ? "Verifying..." : "Verify email"}
                  </button>
                </form>
                {emailMessage && <p className="success">{emailMessage}</p>}
              </>
            )}
          </section>
        )}

        {hasPhone && (
          <section className="panel">
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontSize: 28 }}>📱</span>
              <div>
                <p className="category">PHONE</p>
                <h2>Phone verification</h2>
                <p className="note">{status.phone}</p>
              </div>
            </div>

            {status.phoneVerified ? (
              <div className="success">✓ Phone verified</div>
            ) : (
              <>
                <button type="button" className="secondary-btn" disabled={sendingPhone} onClick={() => sendCode("PHONE")}>
                  {sendingPhone ? "Sending..." : "Send SMS code"}
                </button>
                <form onSubmit={(event) => verify(event, "PHONE")} className="form" style={{ marginTop: 16 }}>
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
                      onChange={(event) => setPhoneCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </label>
                  <button type="submit" className="primary-btn" disabled={verifyingPhone || phoneCode.length !== 6}>
                    {verifyingPhone ? "Verifying..." : "Verify phone"}
                  </button>
                </form>
                {phoneMessage && <p className="success">{phoneMessage}</p>}
              </>
            )}
          </section>
        )}
      </div>

      <section className="panel" style={{ marginTop: 20 }}>
        <p className="category">ACCOUNT RULE</p>
        <h2>One verified contact is enough</h2>
        <p className="note">
          You may create an account with an email address, a phone number, or both. Campus Mall activates the account once at least one supplied contact method has been successfully verified. If both are supplied, you may verify both for additional account recovery options.
        </p>
      </section>

      <p className="note" style={{ marginTop: 20, textAlign: "center" }}>
        Need help?{" "}
        <a href="mailto:campusmall.support@gmail.com" className="text-link">
          campusmall.support@gmail.com
        </a>
      </p>
    </div>
  );
}
