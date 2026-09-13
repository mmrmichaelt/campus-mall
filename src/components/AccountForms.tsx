"use client";

import { FormEvent, useMemo, useState } from "react";
import { countries } from "../data/countries";
import { getUniversitiesByCountry } from "../data/universities";

type AccountMode = "register" | "login";

type FormMessage = {
  type: "success" | "error";
  text: string;
} | null;

export default function AccountForms() {
  const [mode, setMode] = useState<AccountMode>("register");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("KE");
  const [university, setUniversity] = useState("");
  const [accountType, setAccountType] = useState<"STUDENT" | "OUTSIDER">(
    "STUDENT"
  );
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const universityOptions = useMemo(() => {
    return getUniversitiesByCountry(country);
  }, [country]);

  function handleCountryChange(value: string) {
    setCountry(value);
    setUniversity("");
  }

  function switchMode(nextMode: AccountMode) {
    setMode(nextMode);
    setMessage(null);
    setPassword("");
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          country: countries.find((item) => item.code === country)?.name ?? country,
          university,
          accountType,
          phone,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error ?? "Unable to create your account.",
        });
        return;
      }

      setMessage({
        type: "success",
        text:
          data.message ??
          "Account created. Please verify your email and phone number.",
      });

      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      }
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error ?? "Unable to log in.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Login successful. Redirecting...",
      });

      window.location.href = data.redirectTo ?? "/";
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="account-card">
      <div className="account-tabs">
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => switchMode("register")}
        >
          Create Account
        </button>

        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => switchMode("login")}
        >
          Log In
        </button>
      </div>

      {message && (
        <div
          className={`form-message ${
            message.type === "success"
              ? "form-message-success"
              : "form-message-error"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {mode === "register" ? (
        <form onSubmit={handleRegister} className="account-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>

            <select
              id="country"
              name="country"
              value={country}
              onChange={(event) =>
                handleCountryChange(event.target.value)
              }
              required
            >
              {countries.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.name} ({item.phoneCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="university">
              University / College
            </label>

            <select
              id="university"
              name="university"
              value={university}
              onChange={(event) =>
                setUniversity(event.target.value)
              }
              required
            >
              <option value="">
                Select your university / college
              </option>

              {universityOptions.map((item, index) => (
                <option
                  key={`${item.countryCode}-${item.name}-${index}`}
                  value={item.name}
                >
                  {item.name}
                </option>
              ))}
            </select>

            <small>
              Choose your country first to see available
              institutions.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="accountType">Account type</label>

            <select
              id="accountType"
              name="accountType"
              value={accountType}
              onChange={(event) =>
                setAccountType(
                  event.target.value as "STUDENT" | "OUTSIDER"
                )
              }
              required
            >
              <option value="STUDENT">Student</option>
              <option value="OUTSIDER">Outsider</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone number</label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+254712345678"
              autoComplete="tel"
              required
            />

            <small>
              Include your international country code.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>

            <input
              id="register-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>

            <input
              id="register-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="verification-note">
            Your email and phone number will need to be verified
            before you can use Campus Mall chats.
          </p>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="account-form">
          <div className="form-group">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      )}
    </section>
  );
        }
