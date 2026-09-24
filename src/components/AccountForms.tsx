"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  Eye,
  EyeOff,
} from "lucide-react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  countries,
} from "@/data/countries";

type Mode = "register" | "login" | "guest";

export default function AccountForms() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/";
  const [mode, setMode] =
    useState<Mode>(searchParams.get("mode") === "login" ? "login" : "register");

  const [name, setName] = useState("");
  const [country, setCountry] =
    useState("KE");
  const [university, setUniversity] = useState("");
  const [institutions, setInstitutions] = useState<{ name: string }[]>([]);
  const [institutionLoading, setInstitutionLoading] = useState(false);
  const [accountType, setAccountType] =
    useState("STUDENT");
  const [phone, setPhone] =
    useState("");
  const [email, setEmail] =
    useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  useEffect(() => {
    if (mode === "login") return;
    const controller = new AbortController();
    setInstitutionLoading(true);
    fetch(`/api/institutions?country=${encodeURIComponent(country)}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setInstitutions(Array.isArray(data.institutions) ? data.institutions : []))
      .catch((error) => { if (error?.name !== "AbortError") setInstitutions([]); })
      .finally(() => { if (!controller.signal.aborted) setInstitutionLoading(false); });
    return () => controller.abort();
  }, [country, mode]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "guest") {
        if (!country || !university.trim()) throw new Error("Select your country and institution to continue as a guest.");
        localStorage.setItem("campus_mall_guest_country", country);
        localStorage.setItem("campus_mall_guest_university", university.trim());
        localStorage.setItem("campus_mall_guest_institution", university.trim());
        window.location.href = nextPath;
        return;
      }

      const endpoint =
        mode === "register"
          ? "/api/auth/register"
          : "/api/auth/login";

      const body =
        mode === "register"
          ? {
              name: name.trim(),
              country,
              university: university.trim(),
              accountType,
              phone: phone.trim(),
              email:
                email.trim().toLowerCase(),
              password,
              confirmPassword,
            }
          : {
              identifier: (email.trim() || phone.trim()),
              university: university.trim(),
              password,
            };

      const response = await fetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Something went wrong."
        );
      }

      if (mode === "register") {
        setSuccess("Account created successfully. Opening Campus Mall...");
        window.location.href = data.redirectTo || nextPath;
      } else {
        setSuccess("Login successful. Opening Campus Mall...");
        window.location.href = data.redirectTo || "/";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-heading">
          <div
            className="brand-mark"
            aria-label="Campus Mall"
          >
            CM
          </div>

          <h1>
            {mode === "register"
              ? "Join campus mall"
              : mode === "login"
                ? "Welcome back"
                : "Browse as guest"}
          </h1>

          <p className="note">
            {mode === "register"
              ? "Your country and institution are saved to your Campus Mall account and profile."
              : mode === "login"
                ? "Select the institution saved on your account before logging in."
                : "Choose your country and institution to browse that campus as a guest."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={
              mode === "register"
                ? "primary-btn"
                : "secondary-btn"
            }
            onClick={() => {
              setMode("register");
              setError("");
              setSuccess("");
            }}
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
            onClick={() => {
              setMode("login");
              setError("");
              setSuccess("");
            }}
          >
            Log In
          </button>

          <button
            type="button"
            className={mode === "guest" ? "primary-btn" : "secondary-btn"}
            onClick={() => {
              setMode("guest");
              setError("");
              setSuccess("");
            }}
          >
            Guest
          </button>
        </div>

        <form
          className="form"
          onSubmit={handleSubmit}
        >
          {mode === "guest" && (
            <>
              <label>
                Country
                <select
                  value={country}
                  onChange={(event) => {
                    setCountry(event.target.value);
                    setUniversity("");
                  }}
                  required
                >
                  {countries.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Institution
                <select
                  value={university}
                  onChange={(event) => setUniversity(event.target.value)}
                  required
                  disabled={institutionLoading}
                >
                  <option value="">
                    {institutionLoading ? "Loading institutions..." : "Select institution"}
                  </option>
                  {institutions.map((item, index) => (
                    <option key={item.name + index} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {mode === "register" && (
            <>
              <label>
                Name
                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Your full name"
                  required
                />
              </label>

              <label>
                Country
                <select
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value);
                    setUniversity("");
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
                Institution
                <select
                  value={university}
                  onChange={(event) => setUniversity(event.target.value)}
                  required
                  disabled={institutionLoading}
                >
                  <option value="">
                    {institutionLoading ? "Loading institutions..." : "Select institution"}
                  </option>
                  {institutions.map((item, index) => (
                    <option key={item.name + index} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <small className="note">
                  This institution is saved to your account/profile and automatically used when you post an item.
                </small>
              </label>

              <label>
                Account type
                <select
                  value={accountType}
                  onChange={(event) =>
                    setAccountType(
                      event.target.value
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
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="+254..."
                />
              </label>
            </>
          )}

          {mode === "login" && (
            <label>
              Institution
              <select
                value={university}
                onChange={(event) => setUniversity(event.target.value)}
                required
                disabled={institutionLoading}
              >
                <option value="">
                  {institutionLoading ? "Loading institutions..." : "Select institution"}
                </option>
                {institutions.map((item, index) => (
                  <option key={item.name + index} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            {mode === "login" ? "Email or phone number" : "Email"}
            <input
              type={mode === "login" ? "text" : "email"}
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder={mode === "login" ? "you@example.com or +254..." : "you@example.com"}
              required={mode === "login"}
            />
          </label>

          <label>
            Password

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <input
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
                placeholder="Enter your password"
                required
                style={{
                  paddingRight:
                    "46px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position:
                    "absolute",
                  right: "10px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: 0,
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                  padding: "6px",
                  color:
                    "#6b7280",
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </label>

          {mode === "register" && (
            <>
              <label>
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
                {confirmPassword && confirmPassword !== password && (
                  <span className="field-error">Passwords do not match.</span>
                )}
              </label>
              {!email.trim() && !phone.trim() && (
                <div className="field-error">Enter an email address, a phone number, or both.</div>
              )}
            </>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {success && (
            <div className="success">
              {success}
            </div>
          )}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "register"
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="note support-note">
          Support:{" "}
          <a href="mailto:campusmall.support@gmail.com">
            campusmall.support@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
