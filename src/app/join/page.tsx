"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { countries } from "@/data/countries";

type Mode = "create" | "login";

export default function JoinPage() {
const [mode, setMode] = useState<Mode>("create");

const [data, setData] = useState({
name: "",
country: "KE",
university: "",
accountType: "STUDENT",
phone: "",
email: "",
password: "",
confirmPassword: "",
});

const [error, setError] = useState("");
const [busy, setBusy] = useState(false);
const [institutions, setInstitutions] = useState<{name:string}[]>([]);
const [institutionLoading, setInstitutionLoading] = useState(false);

useEffect(() => {
  const country = countries.find((item) => item.code === data.country);
  if (!country || mode !== "create") return;
  const controller = new AbortController();
  setInstitutionLoading(true);
  fetch(`/api/institutions?country=${encodeURIComponent(country.code)}`, { signal: controller.signal })
    .then((r) => r.json())
    .then((d) => setInstitutions(Array.isArray(d.institutions) ? d.institutions : []))
    .catch(() => setInstitutions([]))
    .finally(() => setInstitutionLoading(false));
  return () => controller.abort();
}, [data.country, mode]);

function update(field: string, value: string) {
setData((current) => ({
...current,
[field]: value,
}));
}

async function submit(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

setError("");
setBusy(true);

try {
  const endpoint =
    mode === "create"
      ? "/api/auth/register"
      : "/api/auth/login";

  const payload =
    mode === "create"
      ? data
      : {
          email: data.email,
          password: data.password,
        };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    setError(
      result.error ||
        "Something went wrong. Please try again."
    );
    return;
  }

  /*
   * The newer authentication system may require
   * email/phone verification after registration.
   *
   * If the API gives us a verification destination,
   * use it. Otherwise return to the marketplace.
   */
  if (
    mode === "create" &&
    result.requiresVerification
  ) {
    window.location.href = "/verify";
    return;
  }

  window.location.href = "/";
} catch {
  setError(
    "Unable to connect to Campus Mall. Please check your internet connection and try again."
  );
} finally {
  setBusy(false);
}

}

return (
<div className="auth-wrap">
<div className="auth-card">
<h1>
{mode === "create"
? "Join campus mall"
: "Welcome back"}
</h1>

    <p className="note">
      {mode === "create"
        ? "Create an account as a student or outsider and select the campus you want to use."
        : "Log in to your Campus Mall account to continue shopping, selling and chatting."}
    </p>

    <div className="hero-actions">
      <button
        type="button"
        className={
          mode === "create"
            ? "primary-btn"
            : "secondary-btn"
        }
        onClick={() => {
          setMode("create");
          setError("");
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
        }}
      >
        Log In
      </button>
    </div>

    <form className="form" onSubmit={submit}>
      {mode === "create" && (
        <>
          <label>
            Name
            <input
              required
              autoComplete="name"
              value={data.name}
              onChange={(event) =>
                update("name", event.target.value)
              }
              placeholder="Your full name"
            />
          </label>

          <label>
            Country
            <select
              required
              value={data.country}
              onChange={(event) =>
                update("country", event.target.value)
              }
            >
              {countries.map((country) => (
                <option
                  key={country.code}
                  value={country.code}
                >
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            University / College
            <input required list="campus-mall-institutions" value={data.university} onChange={(event) => update("university", event.target.value)} placeholder={institutionLoading ? "Loading institutions..." : "Search or enter university / college"} />
            <datalist id="campus-mall-institutions">
              {institutions.map((institution) => <option key={institution.name} value={institution.name} />)}
            </datalist>
            <small className="note">Institutions are loaded for the selected country; you can also enter an institution manually.</small>
          </label>

          <label>
            Account type
            <select
              required
              value={data.accountType}
              onChange={(event) =>
                update(
                  "accountType",
                  event.target.value
                )
              }
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
              required
              type="tel"
              autoComplete="tel"
              value={data.phone}
              onChange={(event) =>
                update("phone", event.target.value)
              }
              placeholder="+254..."
            />
          </label>
        </>
      )}

      <label>
        Email
        <input
          required
          type="email"
          autoComplete="email"
          value={data.email}
          onChange={(event) =>
            update("email", event.target.value)
          }
          placeholder="you@example.com"
        />
      </label>

      <label>
        Password
        <input
          required
          type="password"
          minLength={8}
          autoComplete={
            mode === "create"
              ? "new-password"
              : "current-password"
          }
          value={data.password}
          onChange={(event) =>
            update("password", event.target.value)
          }
          placeholder="At least 8 characters"
        />
      </label>
      
      {mode === "create" && (
        <label>
          Confirm password
          <input
            required
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={data.confirmPassword}
            onChange={(event) =>
              update("confirmPassword", event.target.value)
            }
            placeholder="Re-enter your password"
          />
        </label>
      )}

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="primary-btn"
        disabled={busy}
      >
        {busy
          ? "Please wait..."
          : mode === "create"
            ? "Create account"
            : "Log in"}
      </button>
    </form>

    <p className="note">
      Support: campusmall.support@gmail.com
    </p>

    <Link href="/">
      ← Back to marketplace
    </Link>
  </div>
</div>

);
}
