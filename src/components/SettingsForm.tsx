"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Globe,
  Mail,
  MessageCircle,
  Megaphone,
  RotateCcw,
  Save,
} from "lucide-react";

type Settings = {
  emailAlerts: boolean;
  messageAlerts: boolean;
  marketing: boolean;
  publicProfile: boolean;
};

const defaultSettings: Settings = {
  emailAlerts: true,
  messageAlerts: true,
  marketing: false,
  publicProfile: true,
};

const options: {
  key: keyof Settings;
  title: string;
  description: string;
  icon: typeof Bell;
}[] = [
  {
    key: "emailAlerts",
    title: "Email notifications",
    description:
      "Receive important Campus Mall account and marketplace notifications by email.",
    icon: Mail,
  },
  {
    key: "messageAlerts",
    title: "Message notifications",
    description:
      "Receive notifications when someone sends you a Campus Mall chat message.",
    icon: MessageCircle,
  },
  {
    key: "marketing",
    title: "Marketing messages",
    description:
      "Allow Campus Mall to send occasional promotional and marketplace updates.",
    icon: Megaphone,
  },
  {
    key: "publicProfile",
    title: "Public profile",
    description:
      "Allow other Campus Mall users to view your public profile and marketplace information.",
    icon: Globe,
  },
];

export default function SettingsForm() {
  const [settings, setSettings] =
    useState<Settings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/settings",
        {
          cache: "no-store",
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load settings."
        );
      }

      setSettings({
        emailAlerts: Boolean(
          data.settings?.emailAlerts
        ),
        messageAlerts: Boolean(
          data.settings?.messageAlerts
        ),
        marketing: Boolean(
          data.settings?.marketing
        ),
        publicProfile: Boolean(
          data.settings?.publicProfile
        ),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function updateSetting(
    key: keyof Settings,
    value: boolean
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSuccess("");
    setError("");
  }

  function resetSettings() {
    setSettings(defaultSettings);
    setSuccess("");
    setError("");
  }

  async function saveSettings() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save settings."
        );
      }

      if (data.settings) {
        setSettings({
          emailAlerts: Boolean(
            data.settings.emailAlerts
          ),
          messageAlerts: Boolean(
            data.settings.messageAlerts
          ),
          marketing: Boolean(
            data.settings.marketing
          ),
          publicProfile: Boolean(
            data.settings.publicProfile
          ),
        });
      }

      setSuccess(
        "Your settings have been saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="panel">
        <p className="note">
          Loading your settings...
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div
          className="error"
          role="alert"
          style={{ marginBottom: "18px" }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="success"
          role="status"
          style={{ marginBottom: "18px" }}
        >
          <Check size={17} />
          {success}
        </div>
      )}

      <div className="settings-list">
        {options.map((option) => {
          const Icon = option.icon;
          const enabled = settings[option.key];

          return (
            <div
              key={option.key}
              className="panel"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    minWidth: "40px",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background:
                      "var(--red-light)",
                  }}
                >
                  <Icon
                    size={19}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "5px",
                    }}
                  >
                    {option.title}
                  </h3>

                  <p className="note">
                    {option.description}
                  </p>
                </div>
              </div>

              <label
                style={{
                  position: "relative",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) =>
                    updateSetting(
                      option.key,
                      event.target.checked
                    )
                  }
                  aria-label={option.title}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />

                <span
                  aria-hidden="true"
                  style={{
                    display: "block",
                    width: "48px",
                    height: "27px",
                    borderRadius: "999px",
                    background: enabled
                      ? "var(--red)"
                      : "#d1d5db",
                    position: "relative",
                    transition:
                      "background 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: enabled
                        ? "24px"
                        : "3px",
                      width: "21px",
                      height: "21px",
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow:
                        "0 1px 3px rgba(0,0,0,.2)",
                      transition:
                        "left 0.2s ease",
                    }}
                  />
                </span>
              </label>
            </div>
          );
        })}
      </div>

      <div
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <div className="hero-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={resetSettings}
            disabled={saving}
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={saveSettings}
            disabled={saving}
          >
            <Save size={17} />
            {saving
              ? "Saving..."
              : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
