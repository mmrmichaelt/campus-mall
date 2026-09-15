"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import {
  Eye,
  EyeOff,
} from "lucide-react";
import { countries } from "../data/countries";
import {
  getUniversitiesByCountry,
} from "../data/universities";

type AccountMode = "register" | "login";

type FormMessage = {
  type: "success" | "error";
  text: string;
} | null;

export default function AccountForms() {
  const [mode, setMode] =
    useState<AccountMode>("register");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<FormMessage>(null);

  const [name, setName] =
    useState("");

  const [country, setCountry] =
    useState("KE");

  const [university, setUniversity] =
    useState("");

  const [accountType, setAccountType] =
    useState<"STUDENT" | "OUTSIDER">(
      "STUDENT"
    );

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const selectedCountryName = useMemo(() => {
    return (
      countries.find(
        (item) => item.code === country
      )?.name ?? country
    );
  }, [country]);

  const universityOptions = useMemo(() => {
    const byCode =
      getUniversitiesByCountry(country);

    if (byCode.length > 0) {
      return byCode;
    }

    return getUniversitiesByCountry(
      selectedCountryName
    );
  }, [country, selectedCountryName]);

  function handleCountryChange(
    value: string
  ) {
    setCountry(value);
    setUniversity("");
  }

  function switchMode(
    nextMode: AccountMode
  ) {
    setMode(nextMode);
    setMessage(null);
    setPassword("");
    setShowPassword(false);
  }

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),

            // Send country CODE to the API.
            // Example: KE instead of Kenya.
            country,

            university:
              university.trim(),

            accountType,

            phone:
              phone.trim(),

            email:
              email
                .trim()
                .toLowerCase(),

            password,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        setMessage({
          type: "error",
          text:
            data.error ??
            "Unable to create your account.",
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
        window.location.href =
          data.redirectTo;
      }
    } catch {
      setMessage({
        type: "error",
        text:
          "Unable to connect to Campus Mall. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email:
              email
                .trim()
                .toLowerCase(),

            password,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        setMessage({
          type: "error",
          text:
            data.error ??
            "Unable to log in.",
        });

        return;
      }

      setMessage({
        type: "success",
        text:
          "Login successful. Redirecting...",
      });

      window.location.href =
        data.redirectTo ?? "/";
    } catch {
      setMessage({
        type: "error",
        text:
          "Unable to connect to Campus Mall. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <div
        className="brand-mark"
        aria-label="Campus Mall"
      >
        CM
      </div>

      <p className="category">
        CAMPUS MALL ACCOUNT
      </p>

      <h1>
        {mode === "register"
          ? "Join campus mall"
          : "Welcome back"}
      </h1>

      <p className="note">
        {mode === "register"
          ? "Create an account as a student or outsider and select your campus."
          : "Log in to continue shopping, selling and connecting on Campus Mall."}
      </p>

      <div
        className="hero-actions"
        style={{
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          className={
            mode === "register"
              ? "primary-btn"
              : "secondary-btn"
          }
          onClick={() =>
            switchMode("register")
          }
        >
          Create Account
        </button>

        <button
          type="button"
          className={
            mode === "login"
              ? "primary-btn"
              : "secondary-btn"
          }
          onClick={() =>
            switchMode("login")
          }
        >
          Log In
        </button>
      </div>

      {message && (
        <div
          className={
            message.type === "success"
              ? "success"
              : "error"
          }
          role="alert"
          style={{
            marginBottom: "18px",
          }}
        >
          {message.text}
        </div>
      )}

      {mode === "register" ? (
        <form
          onSubmit={handleRegister}
          className="form"
        >
          <label>
            Name

            <input
              name="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </label>

          <label>
            Country

            <select
              name="country"
              value={country}
              onChange={(event) =>
                handleCountryChange(
                  event.target.value
                )
              }
              required
            >
              {countries.map(
                (item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.flag}{" "}
                    {item.name}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            University / College

            <select
              name="university"
              value={university}
              onChange={(event) =>
                setUniversity(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Select your university /
                college
              </option>

              {universityOptions.map(
                (item, index) => (
                  <option
                    key={`${item.countryCode}-${item.name}-${index}`}
                    value={item.name}
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>

            <small className="note">
              Choose your country first
              to see available
              institutions.
            </small>
          </label>

          <label>
            Account type

            <select
              name="accountType"
              value={accountType}
              onChange={(event) =>
                setAccountType(
                  event.target
                    .value as
                    | "STUDENT"
                    | "OUTSIDER"
                )
              }
              required
            >
              <option value="STUDENT">
                Student
              </option>

              <option value="OUTSIDER">
                Outsider
              </option>
            </select>
          </label>

          <label>
            Phone number

            <input
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                )
              }
              placeholder="+254712345678"
              autoComplete="tel"
              required
            />

            <small className="note">
              Include your international
              country code.
            </small>
          </label>

          <label>
            Email

            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                style={{
                  paddingRight:
                    "50px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position:
                    "absolute",
                  right: "8px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                  padding: "8px",
                  display: "grid",
                  placeItems:
                    "center",
                }}
              >
                {showPassword ? (
                  <EyeOff
                    size={19}
                    aria-hidden="true"
                  />
                ) : (
                  <Eye
                    size={19}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>

            <small className="note">
              Minimum 8 characters.
            </small>
          </label>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>

          <div className="panel">
            <p className="note">
              Your email and phone number
              must be verified before you
              can use Campus Mall chats and
              other protected features.
            </p>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleLogin}
          className="form"
        >
          <label>
            Email

            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Your password"
                autoComplete="current-password"
                required
                style={{
                  paddingRight:
                    "50px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position:
                    "absolute",
                  right: "8px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                  padding: "8px",
                  display: "grid",
                  placeItems:
                    "center",
                }}
              >
                {showPassword ? (
                  <EyeOff
                    size={19}
                    aria-hidden="true"
                  />
                ) : (
                  <Eye
                    size={19}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log in"}
          </button>
        </form>
      )}

      <p
        className="note"
        style={{
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        Support:
        {" "}
        campusmall.support@gmail.com
      </p>
    </section>
  );
}
