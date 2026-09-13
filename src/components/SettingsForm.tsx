"use client";

import { useEffect, useState } from "react";

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load settings."
        );
      }

      setSettings({
        emailAlerts:
          Boolean(data.settings?.emailAlerts),
        messageAlerts:
          Boolean(data.settings?.messageAlerts),
        marketing:
          Boolean(data.settings?.marketing),
        publicProfile:
          Boolean(data.settings?.publicProfile),
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save settings."
        );
      }

      if (data.settings) {
        setSettings({
          emailAlerts:
            Boolean(data.settings.emailAlerts),
          messageAlerts:
            Boolean(data.settings.messageAlerts),
          marketing:
            Boolean(data.settings.marketing),
          publicProfile:
            Boolean(data.settings.publicProfile),
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
      <div className="loading-card">
        <p>Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-form-card">
      {error && (
        <div
          className="form-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="form-success"
          role="status"
        >
          {success}
        </div>
      )}

      <div className="settings-option">
        <div>
          <h2>Email notifications</h2>

          <p>
            Receive important Campus Mall account and
            marketplace notifications by email.
          </p>
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.emailAlerts}
            onChange={(event) =>
              updateSetting(
                "emailAlerts",
                event.target.checked
              )
            }
          />

          <span className="toggle-slider" />

          <span className="sr-only">
            Enable email notifications
          </span>
        </label>
      </div>

      <div className="settings-option">
        <div>
          <h2>Message notifications</h2>

          <p>
            Receive notifications when someone sends you
            a Campus Mall chat message.
          </p>
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.messageAlerts}
            onChange={(event) =>
              updateSetting(
                "messageAlerts",
                event.target.checked
              )
            }
          />

          <span className="toggle-slider" />

          <span className="sr-only">
            Enable message notifications
          </span>
        </label>
      </div>

      <div className="settings-option">
        <div>
          <h2>Marketing messages</h2>

          <p>
            Allow Campus Mall to send occasional
            promotional and marketplace updates.
          </p>
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.marketing}
            onChange={(event) =>
              updateSetting(
                "marketing",
                event.target.checked
              )
            }
          />

          <span className="toggle-slider" />

          <span className="sr-only">
            Enable marketing messages
          </span>
        </label>
      </div>

      <div className="settings-option">
        <div>
          <h2>Public profile</h2>

          <p>
            Allow other Campus Mall users to view your
            public profile and marketplace information.
          </p>
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.publicProfile}
            onChange={(event) =>
              updateSetting(
                "publicProfile",
                event.target.checked
              )
            }
          />

          <span className="toggle-slider" />

          <span className="sr-only">
            Make profile public
          </span>
        </label>
      </div>

      <div className="settings-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setSettings(defaultSettings);
            setSuccess("");
            setError("");
          }}
          disabled={saving}
        >
          Reset
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save settings"}
        </button>
      </div>
    </div>
  );
          }
