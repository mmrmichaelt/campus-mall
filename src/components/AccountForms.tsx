"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { countries } from "@/data/countries";
import { kenyaInstitutions } from "@/data/universities";

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

    // Kenya suggestions are bundled locally so the guest picker shows a
    // visible list immediately, even when the remote institution API is slow.
    if (country === "KE") {
      const term = query.trim().toLowerCase();
      const localResults = kenyaInstitutions
        .filter((institution) => !term || institution.name.toLowerCase().includes(term))
        .sort((a, b) => {
          if (!term) return a.name.localeCompare(b.name);

          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aExact = aName === term;
          const bExact = bName === term;
          if (aExact !== bExact) return aExact ? -1 : 1;

          const aStarts = aName.startsWith(term);
          const bStarts = bName.startsWith(term);
          if (aStarts !== bStarts) return aStarts ? -1 : 1;

          return aName.localeCompare(bName);
        });
      setInstitutions(localResults.slice(0, 250));
      setLoading(false);
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
        const results = Array.isArray(data.institutions) ? data.institutions : [];
        setInstitutions(results);

        // If the user typed an exact institution name, treat it as selected
        // once the directory confirms the match. This keeps guest checkout
        // from requiring a second click after an exact search.
        const normalizedQuery = query.trim().toLowerCase();
        if (normalizedQuery) {
          const exact = results.find(
            (institution: Institution) =>
              institution.name.trim().toLowerCase() === normalizedQuery
          );
          if (exact) {
            onSelect?.(exact.name);
          }
        }
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
            zIndex: 9999,
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

export default function AccountForms({ initialMode }: { initialMode?: Mode } = {}) {
  const searchParams = useSearchParams();
  const standaloneGuest = initialMode === "guest";
  const nextPath = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/";
  const [mode, setMode] = useState<Mode>(
    initialMode ?? (searchParams.get("mode") === "login" ? "login" : "register")
  );

  const [name, setName] = useState("");
  const [country, setCountry] = useState("KE");
  const [university, setUniversity] = useState("");
  const [confirmUniversity, setConfirmUniversity] = useState("");
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
    setConfirmUniversity("");
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
            confirmUniversity: confirmUniversity.trim(),
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
        onChange={(value) => {
          setUniversity(value);
          setInstitutionSelected(false);
        }}
        onSelect={() => setInstitutionSelected(true)}
      />

    </label>
  );

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-heading">
          <div className="brand-mark" aria-label="Campus Mall">CM</div>
          <h1>
            {mode === "register" ? "Join Campus Mall" : mode === "login" ? "Welcome back" : "Continue as guest"}
          </h1>
        </div>

        {!standaloneGuest && <div className="auth-tabs">
          <button type="button" className={mode === "register" ? "primary-btn" : "secondary-btn"} onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>
            Create Account
          </button>
          <button type="button" className={mode === "login" ? "primary-btn" : "secondary-btn"} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
            Log In
          </button>
          <button type="button" className={mode === "guest" ? "primary-btn" : "secondary-btn"} onClick={() => { setMode("guest"); setError(""); setSuccess(""); }}>
            Guest
          </button>
        </div>}

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
                Confirm Institution
                <input
                  value={confirmUniversity}
                  onChange={(event) => setConfirmUniversity(event.target.value)}
                  placeholder="Type the same institution name again"
                  autoComplete="organization"
                  required
                />
                <small className="note">
                  One Campus Mall account is permanently associated with one institution. Your institution cannot be changed after account creation.
                </small>
              </label>

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

          {mode !== "guest" && (
          <>
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
          </>
          )}

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
            {loading ? "Please wait..." : mode === "register" ? "Create account" : mode === "guest" ? "Continue as Guest" : "Log in"}
          </button>
        </form>

      </div>
    </div>
  );
}
