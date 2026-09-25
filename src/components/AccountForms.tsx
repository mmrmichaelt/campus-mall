"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { countries } from "@/data/countries";

type Mode = "register" | "login" | "guest";

type Institution = {
  name: string;
  countryCode?: string;
  city?: string;
  website?: string;
};

function InstitutionPicker({
  country,
  value,
  onChange,
  onSelect,
  required = true,
}: {
  country: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  required?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!country) {
      setInstitutions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ country });
        if (query.trim()) params.set("name", query.trim());

        const response = await fetch(`/api/institutions?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        setInstitutions(Array.isArray(data.institutions) ? data.institutions : []);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setInstitutions([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query.trim() ? 250 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [country, query]);

  function choose(name: string) {
    setQuery(name);
    onChange(name);
    onSelect?.(name);
    setOpen(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        value={query}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
          setInstitutionSelected(false);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder={country ? "Search your institution..." : "Select a country first"}
        required={required}
        autoComplete="off"
        disabled={!country}
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {open && country && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 1000,
            left: 0,
            right: 0,
            top: "calc(100% + 4px)",
            maxHeight: 260,
            overflowY: "auto",
            border: "1px solid var(--border, #ddd)",
            borderRadius: 10,
            background: "var(--card, #fff)",
            boxShadow: "0 10px 25px rgba(0,0,0,.12)",
          }}
        >
          {loading && (
            <div style={{ padding: "12px 14px" }} className="note">
              Searching institutions...
            </div>
          )}

          {!loading && institutions.length === 0 && (
            <div style={{ padding: "12px 14px" }} className="note">
              No institution found. Try another search.
            </div>
          )}

          {!loading && institutions.map((institution, index) => (
            <button
              key={institution.name + index}
              type="button"
              role="option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(institution.name)}
              style={{
                display: "block",
                width: "100%",
                padding: "11px 14px",
                textAlign: "left",
                border: 0,
                borderBottom: "1px solid var(--border, #eee)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <strong>{institution.name}</strong>
              {institution.city && (
                <small className="note" style={{ display: "block", marginTop: 2 }}>
                  {institution.city}
                </small>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountForms() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/";
  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "login" ? "login" : "register"
  );

  const [name, setName] = useState("");
  const [country, setCountry] = useState("KE");
  const [university, setUniversity] = useState("");
  const [institutionSelected, setInstitutionSelected] = useState(false);
  const [accountType, setAccountType] = useState("STUDENT");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function changeCountry(value: string) {
    setCountry(value);
    setUniversity("");
    setInstitutionSelected(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "guest") {
        if (!country || !university.trim() || !institutionSelected) {
          throw new Error("Select an institution from the suggestions to continue.");
        }
        localStorage.setItem("campus_mall_guest_country", country);
        localStorage.setItem("campus_mall_guest_university", university.trim());
        localStorage.setItem("campus_mall_guest_institution", university.trim());
        window.location.href = nextPath;
        return;
      }

      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "register"
        ? {
            name: name.trim(),
            country,
            university: university.trim(),
            accountType,
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            password,
            confirmPassword,
          }
        : {
            identifier: email.trim() || phone.trim(),
            country,
            university: university.trim(),
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Something went wrong.");

      if (mode === "register") {
        setSuccess("Account created successfully. Opening Campus Mall...");
        window.location.href = data.redirectTo || nextPath;
      } else {
        setSuccess("Login successful. Opening Campus Mall...");
        window.location.href = data.redirectTo || "/";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const countryPicker = (
    <label>
      Country
      <select
        value={country}
        onChange={(event) => changeCountry(event.target.value)}
        required
      >
        {countries.map((item) => (
          <option key={item.code} value={item.code}>
            {item.flag} {item.name}
          </option>
        ))}
      </select>
    </label>
  );

  const institutionPicker = (
    <label>
      Institution
      <InstitutionPicker
        country={country}
        value={university}
        onChange={setUniversity}
        onSelect={() => setInstitutionSelected(true)}
      />
      {mode === "register" && (
        <small className="note">
          Search the cloud directory and choose your institution. The selected institution is then associated with your account.
        </small>
      )}
    </label>
  );

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-heading">
          <div className="brand-mark" aria-label="Campus Mall">CM</div>
          <h1>
            {mode === "register" ? "Join campus mall" : mode === "login" ? "Welcome back" : "Browse as guest"}
          </h1>
          <p className="note">
            {mode === "register"
              ? "Choose your country, then search the cloud institution directory."
              : mode === "login"
                ? "Choose your country, then search for the institution associated with your account."
                : "Choose your country, then search the cloud institution directory to browse that campus."}
          </p>
        </div>

        <div className="auth-tabs">
          <button type="button" className={mode === "register" ? "primary-btn" : "secondary-btn"} onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>
            Create Account
          </button>
          <button type="button" className={mode === "login" ? "primary-btn" : "secondary-btn"} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
            Log In
          </button>
          <button type="button" className={mode === "guest" ? "primary-btn" : "secondary-btn"} onClick={() => { setMode("guest"); setError(""); setSuccess(""); }}>
            Guest
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {mode === "guest" && (
            <>
              {countryPicker}
              {institutionPicker}
            </>
          )}

          {mode === "register" && (
            <>
              <label>
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" required />
              </label>
              {countryPicker}
              {institutionPicker}

              <label>
                Account type
                <select value={accountType} onChange={(event) => setAccountType(event.target.value)} required>
                  <option value="STUDENT">Student</option>
                  <option value="OUTSIDER">Outsider</option>
                </select>
              </label>

              <label>
                Phone number
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+254..." />
              </label>
            </>
          )}

          {mode === "login" && (
            <>
              {countryPicker}
              {institutionPicker}
            </>
          )}

          <label>
            {mode === "login" ? "Email or phone number" : "Email"}
            <input
              type={mode === "login" ? "text" : "email"}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={mode === "login" ? "you@example.com or +254..." : "you@example.com"}
              required={mode === "login"}
            />
          </label>

          <label>
            Password
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingRight: "46px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  padding: "6px",
                  color: "#6b7280",
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "register" ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="note support-note">
          Support: <a href="mailto:campusmall.support@gmail.com">campusmall.support@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
