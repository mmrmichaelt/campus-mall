"use client";

import { FormEvent, useState } from "react";

type ProfileFormProps = {
  initialName: string;
  initialUniversity: string;
};

type ProfileResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default function ProfileForm({
  initialName,
  initialUniversity,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [university, setUniversity] = useState(initialUniversity);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          university: university.trim(),
        }),
      });

      const data = (await response.json()) as ProfileResponse;

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to update your profile. Please try again."
        );
        return;
      }

      setMessage(
        data.message || "Your profile has been updated successfully."
      );
    } catch (requestError) {
      console.error("Profile update error:", requestError);

      setError(
        "A network error occurred. Please check your internet connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    const confirmed = window.confirm(
      "Are you sure you want to log out of Campus Mall?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = (await response.json()) as {
        redirectTo?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Unable to log out right now.");
        return;
      }

      window.location.href = data.redirectTo || "/";
    } catch (requestError) {
      console.error("Logout error:", requestError);

      setError(
        "A network error occurred while logging out."
      );
    }
  }

  return (
    <div className="profile-form-card">
      <div className="profile-form-header">
        <p className="eyebrow">EDIT PROFILE</p>

        <h2>Personal information</h2>

        <p>
          Keep your Campus Mall profile information
          accurate so other users know who they are
          dealing with.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="profile-form"
      >
        <div className="form-field">
          <label htmlFor="profile-name">
            Full name
          </label>

          <input
            id="profile-name"
            name="name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter your full name"
            autoComplete="name"
            maxLength={100}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="profile-university">
            University / College
          </label>

          <input
            id="profile-university"
            name="university"
            type="text"
            value={university}
            onChange={(event) =>
              setUniversity(event.target.value)
            }
            placeholder="Enter your university or college"
            maxLength={200}
            required
          />

          <small>
            You can enter your exact university or
            college name.
          </small>
        </div>

        {error && (
          <div
            className="form-message form-message-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="form-message form-message-success"
            role="status"
          >
            {message}
          </div>
        )}

        <div className="profile-form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      <div className="profile-danger-zone">
        <p className="eyebrow">ACCOUNT SESSION</p>

        <h3>Log out</h3>

        <p>
          Log out of this Campus Mall account on this
          device.
        </p>

        <button
          type="button"
          className="secondary-button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
