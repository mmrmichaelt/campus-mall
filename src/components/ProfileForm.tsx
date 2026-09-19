"use client";

import { FormEvent, useState } from "react";
import { LogOut, Save, Upload, Image as ImageIcon } from "lucide-react";

type ProfileFormProps = {
  initialName: string;
  initialUniversity: string;
  initialImageUrl?: string | null;
};

type ProfileResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default function ProfileForm({
  initialName,
  initialUniversity,
  initialImageUrl,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [university, setUniversity] =
    useState(initialUniversity);
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            university: university.trim(),
            imageUrl,
          }),
        }
      );

      const data =
        (await response
          .json()
          .catch(() => ({}))) as ProfileResponse;

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to update your profile. Please try again."
        );
        return;
      }

      setMessage(
        data.message ||
          "Your profile has been updated successfully."
      );
    } catch (requestError) {
      console.error(
        "Profile update error:",
        requestError
      );

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

    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as {
        redirectTo?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to log out right now."
        );
        return;
      }

      window.location.href =
        data.redirectTo || "/";
    } catch (requestError) {
      console.error(
        "Logout error:",
        requestError
      );

      setError(
        "A network error occurred while logging out."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div>
      <div className="panel">
        <div className="section-title">
          <div>
            <p className="category">
              EDIT PROFILE
            </p>

            <h2>Personal information</h2>

            <p className="note">
              Keep your Campus Mall profile
              information accurate so other users
              know who they are dealing with.
            </p>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: "18px" }}>
          <div className="section-title">
            <div>
              <p className="category">PROFILE PHOTO</p>
              <h3>Upload your profile picture</h3>
              <p className="note">Use a clear photo so other Campus Mall users can recognize your account.</p>
            </div>
            <ImageIcon size={24} />
          </div>

          {imageUrl && (
            <div style={{ marginBottom: "14px" }}>
              <img
                src={imageUrl}
                alt="Your profile"
                style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }}
              />
            </div>
          )}

          <input
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploadingPhoto(true);
              setError("");
              setMessage("");
              try {
                const formData = new FormData();
                formData.append("files", file);
                const response = await fetch("/api/uploads", { method: "POST", body: formData });
                const data = await response.json().catch(() => ({}));
                if (!response.ok || !data.urls?.[0]) {
                  throw new Error(data.error || "Unable to upload profile photo.");
                }
                setImageUrl(data.urls[0]);
                setMessage("Profile photo uploaded. Save changes to keep it on your profile.");
              } catch (error) {
                setError(error instanceof Error ? error.message : "Unable to upload profile photo.");
              } finally {
                setUploadingPhoto(false);
                event.target.value = "";
              }
            }}
          />

          {uploadingPhoto && <p className="note">Uploading photo...</p>}
        </div>

        <form
          onSubmit={handleSubmit}
          className="form"
        >
          <label>
            Full name
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
          </label>

          <label>
            University / College
            <input
              id="profile-university"
              name="university"
              type="text"
              value={university}
              onChange={(event) =>
                setUniversity(
                  event.target.value
                )
              }
              placeholder="Enter your university or college"
              maxLength={200}
              required
            />

            <small className="note">
              You can enter your exact university
              or college name.
            </small>
          </label>

          {error && (
            <div
              className="error"
              role="alert"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="success"
              role="status"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn"
            disabled={saving}
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </form>
      </div>

      <div
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <p className="category">
          ACCOUNT SESSION
        </p>

        <h2>Log out</h2>

        <p className="note">
          Log out of this Campus Mall account on
          this device.
        </p>

        <button
          type="button"
          className="secondary-btn"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut size={17} />

          {loggingOut
            ? "Logging out..."
            : "Log out"}
        </button>
      </div>
    </div>
  );
}
